import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  tags: string[];
}

const BLOG_FILE = join(process.cwd(), "data", "blog-posts.json");

function ensureFile() {
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) {
    const { mkdirSync } = require("fs");
    mkdirSync(dir, { recursive: true });
  }
  if (!existsSync(BLOG_FILE)) {
    writeFileSync(BLOG_FILE, "[]", "utf-8");
  }
}

export function getServerBlogPosts(): BlogPost[] {
  ensureFile();
  try {
    const raw = readFileSync(BLOG_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveServerBlogPost(post: BlogPost) {
  const posts = getServerBlogPosts();
  const idx = posts.findIndex((p) => p.id === post.id);
  if (idx >= 0) posts[idx] = post;
  else posts.unshift(post);
  writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), "utf-8");
}

export function getServerBlogBySlug(slug: string): BlogPost | undefined {
  return getServerBlogPosts().find((p) => p.slug === slug);
}

export function deleteServerBlogPost(id: string) {
  const posts = getServerBlogPosts().filter((p) => p.id !== id);
  writeFileSync(BLOG_FILE, JSON.stringify(posts, null, 2), "utf-8");
}
