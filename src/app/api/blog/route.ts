import { NextRequest, NextResponse } from "next/server";
import { saveServerBlogPost, getServerBlogPosts } from "@/lib/blog-store";
import { randomUUID } from "crypto";

export async function GET() {
  const posts = getServerBlogPosts();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const post = {
    id: randomUUID(),
    slug: body.slug || "untitled",
    title: body.title || "Untitled",
    excerpt: body.excerpt || "",
    content: body.content || "",
    date: new Date().toISOString().split("T")[0],
    tags: body.tags || [],
  };

  saveServerBlogPost(post);
  return NextResponse.json({ success: true, post });
}
