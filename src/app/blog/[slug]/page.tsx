"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBlogPostBySlug, type BlogPost } from "@/lib/admin";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteStructure";
import { PriceTicker } from "@/components/PriceTicker";
import { ArrowLeft, Calendar, Tag } from "lucide-react";

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (slug) setPost(getBlogPostBySlug(slug) ?? null);
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center">
        <h2 className="text-xl font-black text-text-secondary mb-4">Post not found</h2>
        <Link
          href="/blog"
          className="px-6 py-2 bg-accent-cyan text-bg-dark font-black text-xs uppercase tracking-widest rounded-xl"
        >
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <PriceTicker />
      <SiteHeader />
      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
        <article className="glass-card">
          <div className="text-[10px] font-black text-accent-cyan uppercase tracking-widest mb-4 flex items-center gap-2">
            <Calendar className="w-3 h-3" /> {post.date}
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-6">{post.title}</h1>
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-black uppercase text-text-secondary bg-white/5 px-2 py-1 rounded flex items-center gap-1"
              >
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>
          <div className="text-sm leading-relaxed text-gray-300 whitespace-pre-line">{post.content}</div>
        </article>
      </main>
    </div>
  );
}
