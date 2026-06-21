import type { Metadata } from "next";
import { getServerBlogPosts } from "@/lib/blog-store";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteStructure";
import { PriceTicker } from "@/components/PriceTicker";
import { ArrowLeft, Calendar, Tag } from "lucide-react";

// Always render from the server-side store so AI-generated posts (written by the
// daily cron) are visible to every visitor and crawlable by search engines.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Crypto Market Analysis & On-Chain Intelligence Blog | CryptoFlowCheck",
  description:
    "Expert crypto market analysis, whale flow tracking, and on-chain intelligence from the CryptoFlowCheck research desk. Updated regularly.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Crypto Market Analysis Blog | CryptoFlowCheck",
    description:
      "Expert crypto market analysis and on-chain intelligence from the CryptoFlowCheck research desk.",
    type: "website",
    url: "/blog",
  },
};

export default function BlogListPage() {
  const posts = getServerBlogPosts();

  return (
    <div className="min-h-screen bg-bg-dark">
      <PriceTicker />
      <SiteHeader />
      <main className="container mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-3xl font-black tracking-tight mb-8">
          Blog <span className="text-gradient">Posts</span>
        </h1>
        {posts.length === 0 && (
          <div className="text-text-secondary text-sm font-bold text-center py-20">No blog posts yet.</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="glass-card hover:-translate-y-1 transition-transform"
            >
              <div className="text-[10px] font-black text-accent-cyan uppercase tracking-widest mb-3 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> {post.date}
              </div>
              <h2 className="text-lg font-black mb-2 leading-tight">{post.title}</h2>
              <p className="text-text-secondary text-sm mb-4 line-clamp-2">{post.excerpt}</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-black uppercase text-text-secondary bg-white/5 px-2 py-1 rounded flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
