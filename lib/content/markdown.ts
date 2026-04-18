import fs from "node:fs/promises";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { validatedFrontmatterSchema, type Frontmatter } from "./frontmatter";

export type LoadedMarkdown = {
  frontmatter: Frontmatter;
  markdown: string;
  html: string;
  headings: Array<{ depth: number; text: string; id: string }>;
};

function slugifyId(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function extractHeadings(markdown: string): Array<{ depth: number; text: string; id: string }> {
  const lines = markdown.split(/\r?\n/);
  const out: Array<{ depth: number; text: string; id: string }> = [];
  for (const line of lines) {
    const m = line.match(/^(#{2,4})\s+(.+?)\s*$/);
    if (!m) continue;
    const depth = m[1]!.length;
    const text = m[2]!.replace(/\[(.+?)\]\(.+?\)/g, "$1").trim();
    out.push({ depth, text, id: slugifyId(text) });
  }
  return out;
}

export async function loadMarkdownFile(filePath: string): Promise<LoadedMarkdown> {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);

  const frontmatter = validatedFrontmatterSchema.parse(parsed.data);
  const markdown = parsed.content.trim() + "\n";

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);

  return {
    frontmatter,
    markdown,
    html: String(file),
    headings: extractHeadings(markdown),
  };
}
