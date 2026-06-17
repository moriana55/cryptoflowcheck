import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/adminAuth";
import { getMetricsSnapshot } from "@/lib/metrics";
import { getServerBlogPosts } from "@/lib/blog-store";
import { listSubscriptions } from "@/lib/subscriptions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Admin-only, read-only. Fail-closed via signed-cookie verification.
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const metrics = getMetricsSnapshot();
  const posts = getServerBlogPosts();
  const subs = listSubscriptions();

  const proSubs = subs.filter((s) => s.tier === "pro" && s.status === "active");

  return NextResponse.json({
    ...metrics,
    content: {
      totalBlogPosts: posts.length,
      latestPostDate: posts[0]?.date ?? null,
    },
    subscriptions: {
      total: subs.length,
      activePro: proSubs.length,
    },
  });
}
