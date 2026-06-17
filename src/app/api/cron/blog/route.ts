import { NextRequest, NextResponse } from "next/server";
import { generateAutoBlogWithAI } from "@/lib/ai";
import { saveServerBlogPost } from "@/lib/blog-store";
import { randomUUID } from "crypto";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  // Fail-closed: no secret configured => never authorize.
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await generateAutoBlogWithAI();

    saveServerBlogPost({
      id: randomUUID(),
      slug: result.slug,
      title: result.title,
      excerpt: result.excerpt,
      content: result.content,
      date: new Date().toISOString().split("T")[0],
      tags: result.tags,
    });

    return NextResponse.json({ success: true, title: result.title, slug: result.slug });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "AI generation failed" }, { status: 500 });
  }
}
