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

/**
 * Client login helper. The real credential check + the tamper-proof,
 * HMAC-signed httpOnly cookie are issued server-side by /api/admin/login.
 * The localStorage marker below is purely a non-authoritative UX hint so the
 * admin layout can render optimistically; access is enforced by middleware
 * verifying the signed cookie on every /admin/* request.
 */
export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_KEY) === "authenticated";
}

export async function loginAdmin(password: string): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return false;
    localStorage.setItem(ADMIN_KEY, "authenticated");
    return true;
  } catch {
    return false;
  }
}

export async function logoutAdmin() {
  localStorage.removeItem(ADMIN_KEY);
  try {
    await fetch("/api/admin/login", { method: "DELETE" });
  } catch {
    // ignore — cookie will expire regardless
  }
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
