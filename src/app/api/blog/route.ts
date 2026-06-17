import { NextRequest, NextResponse } from "next/server";
import { saveServerBlogPost, getServerBlogPosts, deleteServerBlogPost } from "@/lib/blog-store";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/adminAuth";
import { randomUUID } from "crypto";

async function isAuthed(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;
  return verifyAdminToken(token);
}

export async function GET() {
  const posts = getServerBlogPosts();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthed(request))) {
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

export async function PUT(request: NextRequest) {
  if (!(await isAuthed(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  saveServerBlogPost({
    id: body.id,
    slug: body.slug || "untitled",
    title: body.title || "Untitled",
    excerpt: body.excerpt || "",
    content: body.content || "",
    date: body.date || new Date().toISOString().split("T")[0],
    tags: body.tags || [],
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthed(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  deleteServerBlogPost(id);
  return NextResponse.json({ success: true });
}
