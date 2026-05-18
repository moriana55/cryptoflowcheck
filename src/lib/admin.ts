export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  tags: string[];
}

const ADMIN_KEY = "cfc-admin-session";
const BLOG_KEY = "cfc-blog-posts";

// SHA-256 hash of "CryptoFlow2025!" — never store plaintext passwords in client code
const ADMIN_HASH = "c7ef050a4efd7ab8d017e803747124a745b5c9a973c91d326d3a4136df95f1cb";

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_KEY) === "authenticated";
}

export async function loginAdmin(password: string): Promise<boolean> {
  const hash = await sha256(password);
  if (hash === ADMIN_HASH) {
    localStorage.setItem(ADMIN_KEY, "authenticated");
    document.cookie = "cfc-admin=authenticated; path=/; max-age=86400; SameSite=Strict";
    return true;
  }
  return false;
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_KEY);
  document.cookie = "cfc-admin=; path=/; max-age=0";
}

export function getBlogPosts(): BlogPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BLOG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function saveBlogPost(post: BlogPost) {
  const posts = getBlogPosts();
  const idx = posts.findIndex((p) => p.id === post.id);
  if (idx >= 0) posts[idx] = post;
  else posts.unshift(post);
  localStorage.setItem(BLOG_KEY, JSON.stringify(posts));
}

export function deleteBlogPost(id: string) {
  const posts = getBlogPosts().filter((p) => p.id !== id);
  localStorage.setItem(BLOG_KEY, JSON.stringify(posts));
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return getBlogPosts().find((p) => p.slug === slug);
}
