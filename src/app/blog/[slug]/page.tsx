import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerBlogBySlug } from "@/lib/blog-store";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteStructure";
import { PriceTicker } from "@/components/PriceTicker";
import { ArrowLeft, Calendar, Tag } from "lucide-react";

// Server-render from the shared store so AI-generated posts are visible to all
// visitors and indexable/shareable (real OG + canonical) by crawlers.
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getServerBlogBySlug(slug);

  if (!post) {
    return { title: "Post Not Found | CryptoFlowCheck" };
  }

  return {
    title: `${post.title} | CryptoFlowCheck`,
    description: post.excerpt || `${post.title} — analysis from the CryptoFlowCheck intelligence desk.`,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      type: "article",
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || post.title,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = getServerBlogBySlug(slug);

  if (!post) {
    notFound();
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
