import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

export type RepoMeta = {
  repoHeadSha: string | null;
  repoTreeSha: string | null;
  repoDirty: boolean;
  // NOTE: We cannot rely on hashing raw working-tree bytes on Windows when CRLF conversion is enabled.
  // This is a best-effort heuristic: index stat mismatch + untracked scan (with a minimal ignore list).
  method: "git-cli" | "git-index-stat+untracked-scan";
};

function toPosix(rel: string): string {
  return rel.split(path.sep).join("/");
}

function normKey(relPosix: string): string {
  // Git path comparisons are effectively case-insensitive on Windows by default; mirror that for our scan.
  return process.platform === "win32" ? relPosix.toLowerCase() : relPosix;
}

async function readTextIfExists(abs: string): Promise<string | null> {
  try {
    return await fs.readFile(abs, "utf8");
  } catch {
    return null;
  }
}

async function resolveGitHeadSha(repoRoot: string): Promise<string | null> {
  const headAbs = path.join(repoRoot, ".git", "HEAD");
  const headRaw = (await readTextIfExists(headAbs))?.trim() ?? null;
  if (!headRaw) return null;
  if (!headRaw.startsWith("ref:")) {
    // Detached head contains the SHA directly.
    return headRaw;
  }
  const ref = headRaw.replace(/^ref:\s*/, "").trim();
  const refAbs = path.join(repoRoot, ".git", ...ref.split("/"));
  const refRaw = (await readTextIfExists(refAbs))?.trim() ?? null;
  if (refRaw) return refRaw;

  // Fallback: packed-refs.
  const packedAbs = path.join(repoRoot, ".git", "packed-refs");
  const packed = await readTextIfExists(packedAbs);
  if (!packed) return null;
  for (const line of packed.split(/\r?\n/)) {
    const t = line.trim();
    if (t.length === 0 || t.startsWith("#") || t.startsWith("^")) continue;
    const [sha, name] = t.split(" ");
    if (name === ref && sha) return sha;
  }
  return null;
}

type IndexEntry = { path: string; sha1Hex: string; mtimeSec: number; size: number };

function isSpawnBlockedError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const anyErr = err as any;
  const code = String(anyErr.code ?? "");
  // EPERM shows up on some Windows setups / restricted environments.
  return code === "EPERM" || code === "EACCES";
}

function tryGit(repoRoot: string, args: string[]): string | null {
  try {
    const out = execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    return String(out).trim();
  } catch (err) {
    // If spawning git is blocked, fall back to the index-scan heuristic.
    if (isSpawnBlockedError(err)) return null;
    // If git isn't available or this isn't a git repo, also fall back.
    const anyErr = err as any;
    const code = String(anyErr?.code ?? "");
    if (code === "ENOENT") return null;
    const msg = String(anyErr?.message ?? "");
    if (msg.toLowerCase().includes("not a git repository")) return null;
    return null;
  }
}

function parseGitIndex(buf: Buffer): IndexEntry[] {
  if (buf.length < 12) throw new Error("git index too small");
  const sig = buf.subarray(0, 4).toString("ascii");
  if (sig !== "DIRC") throw new Error("git index signature mismatch");
  const version = buf.readUInt32BE(4);
  if (version < 2 || version > 4) throw new Error(`unsupported git index version ${version}`);
  const count = buf.readUInt32BE(8);

  const entries: IndexEntry[] = [];
  let offset = 12;
  for (let i = 0; i < count; i++) {
    const entryStart = offset;
    if (offset + 62 > buf.length) throw new Error("git index truncated");
    const mtimeSec = buf.readUInt32BE(offset + 8);
    const size = buf.readUInt32BE(offset + 36);
    // Skip stat fields and flags; we only need object id + path.
    const shaStart = offset + 40;
    const sha = buf.subarray(shaStart, shaStart + 20);
    const sha1Hex = sha.toString("hex");

    // flags (2 bytes) at offset+60; if the extended bit is set, a 2-byte extended flags
    // field follows, shifting the path start from 62 -> 64 bytes.
    const flags = buf.readUInt16BE(offset + 60);
    const isExtended = (flags & 0x4000) !== 0;
    const pathStart = offset + (isExtended ? 64 : 62);
    let p = pathStart;
    while (p < buf.length && buf[p] !== 0) p++;
    if (p >= buf.length) throw new Error("git index path not terminated");
    const relPath = buf.subarray(pathStart, p).toString("utf8");
    entries.push({ path: relPath, sha1Hex, mtimeSec, size });

    // Entries are padded so the *entry length* is a multiple of 8 bytes (relative to entryStart),
    // not necessarily aligned to an absolute 8-byte boundary within the file.
    let entryLen = (p - entryStart) + 1; // include NUL
    while (entryLen % 8 !== 0) entryLen++;
    offset = entryStart + entryLen;
  }
  return entries;
}

function sha256Text(text: string): string {
  const h = crypto.createHash("sha256");
  h.update(text, "utf8");
  return h.digest("hex");
}

function gitBlobSha1(content: Buffer): string {
  const header = Buffer.from(`blob ${content.length}\0`, "utf8");
  const h = crypto.createHash("sha1");
  h.update(header);
  h.update(content);
  return h.digest("hex");
}

function looksBinary(buf: Buffer): boolean {
  // Cheap heuristic: any NUL byte => treat as binary.
  return buf.includes(0);
}

function normalizeCrlfToLf(buf: Buffer): Buffer {
  // This is intentionally conservative: only attempt conversion when content looks text-like.
  // It helps match git's CRLF normalization without spawning `git`.
  if (looksBinary(buf)) return buf;
  // Replace CRLF with LF in UTF-8 text. If decoding fails, we still get replacement chars,
  // but that would fail the hash match and we fall back to raw bytes.
  const text = buf.toString("utf8");
  if (!text.includes("\r\n")) return buf;
  return Buffer.from(text.replace(/\r\n/g, "\n"), "utf8");
}

export async function computeRepoMeta(repoRoot = process.cwd()): Promise<RepoMeta> {
  // Prefer `git` itself when possible. It's the only source of truth that respects `.gitignore`
  // and handles Windows case-insensitivity correctly.
  const headShaGit = tryGit(repoRoot, ["rev-parse", "HEAD"]);
  const treeShaGit = tryGit(repoRoot, ["rev-parse", "HEAD^{tree}"]);
  const porcelain = tryGit(repoRoot, ["status", "--porcelain=v1"]);
  if (headShaGit && treeShaGit && porcelain !== null) {
    return {
      repoHeadSha: headShaGit,
      repoTreeSha: treeShaGit,
      repoDirty: porcelain.trim().length > 0,
      method: "git-cli",
    };
  }

  const headSha = await resolveGitHeadSha(repoRoot);

  const indexAbs = path.join(repoRoot, ".git", "index");
  const indexBuf = await fs.readFile(indexAbs);
  const entries = parseGitIndex(indexBuf);

  // "Tree" hash here is a deterministic fingerprint of the index (not git's tree object id).
  // It supports strict "same repo state" checks in environments where spawning git is not permitted.
  const treeSha = sha256Text(
    entries
      .slice()
      .sort((a, b) => a.path.localeCompare(b.path))
      .map((e) => `${e.path}\0${e.sha1Hex}`)
      .join("\n"),
  );

  // NOTE: We cannot reliably detect "untracked" files without git (global excludes, per-user ignores),
  // and spawning git may be blocked (EPERM). So we define "dirty" narrowly as
  // "tracked files differ from index content" (or tracked file missing).
  //
  // We first use the fast-path stat check; if it differs, we fall back to hashing the working-tree
  // content as a git blob (trying both raw bytes and CRLF-normalized bytes) and compare to the index OID.
  let dirty = false;
  for (const e of entries) {
    const abs = path.join(repoRoot, ...e.path.split("/"));
    try {
      const st = await fs.stat(abs);
      const mtimeSec = Math.floor(st.mtimeMs / 1000);
      if (mtimeSec === e.mtimeSec && st.size === e.size) continue;

      const raw = await fs.readFile(abs);
      const shaRaw = gitBlobSha1(raw);
      if (shaRaw === e.sha1Hex) continue;

      const normalized = normalizeCrlfToLf(raw);
      if (normalized !== raw) {
        const shaNorm = gitBlobSha1(normalized);
        if (shaNorm === e.sha1Hex) continue;
      }

      dirty = true;
      break;
    } catch {
      dirty = true;
      break;
    }
  }

  return {
    repoHeadSha: headSha,
    repoTreeSha: treeSha,
    repoDirty: dirty,
    method: "git-index-stat+untracked-scan",
  };
}
