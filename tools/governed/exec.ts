import { spawn } from "node:child_process";

export type ExecResult = {
  command: string;
  exitCode: number;
  durationMs: number;
  stdout: string;
  stderr: string;
};

export async function execCmd(
  command: string,
  args: string[],
  opts?: { cwd?: string; env?: NodeJS.ProcessEnv },
): Promise<ExecResult> {
  const startedAt = Date.now();
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: opts?.cwd,
      env: { ...process.env, ...opts?.env },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    child.stdout.on("data", (d: Buffer) => stdoutChunks.push(d));
    child.stderr.on("data", (d: Buffer) => stderrChunks.push(d));
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      resolve({
        command: [command, ...args].join(" "),
        exitCode: code ?? 1,
        durationMs: Date.now() - startedAt,
        stdout: Buffer.concat(stdoutChunks).toString("utf8"),
        stderr: Buffer.concat(stderrChunks).toString("utf8"),
      });
    });
  });
}

