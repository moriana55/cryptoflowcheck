"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdmin, getBlogPosts, saveBlogPost, deleteBlogPost, type BlogPost } from "@/lib/admin";
import { Plus, Trash2, Edit, X, Sparkles, Wand2, CheckCircle, AlertTriangle, BarChart3 } from "lucide-react";
import { generateBlogWithAI, generateAutoBlogWithAI } from "@/lib/ai";
import Link from "next/link";

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      window.location.href = "/admin/login";
    } else {
      setPosts(getBlogPosts());
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest animate-pulse">Checking credentials...</div>
      </div>
    );
  }

  function handleSave(post: BlogPost) {
    saveBlogPost(post);
    setPosts(getBlogPosts());
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    deleteBlogPost(id);
    setPosts(getBlogPosts());
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <header className="h-16 border-b border-white/5 flex items-center justify-between container mx-auto px-6">
        <Link href="/admin" className="font-black text-sm tracking-tight">← Back to Dashboard</Link>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              setAiLoading(true);
              try {
                const result = await generateAutoBlogWithAI();
                setEditing({
                  id: crypto.randomUUID(),
                  slug: result.slug,
                  title: result.title,
                  excerpt: result.excerpt,
                  content: result.content,
                  date: new Date().toISOString().slice(0, 10),
                  tags: result.tags,
                  focusKeyword: (result as any).focusKeyword || "",
                } as BlogPost);
              } catch {
                alert("AI auto generation failed. Check your API key.");
              } finally {
                setAiLoading(false);
              }
            }}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-accent-purple text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" /> {aiLoading ? "Writing..." : "AI Auto Write"}
          </button>
          <button
            onClick={async () => {
              const topic = prompt("Enter blog topic for AI:");
              if (!topic) return;
              setAiLoading(true);
              try {
                const result = await generateBlogWithAI(topic);
                setEditing({
                  id: crypto.randomUUID(),
                  slug: result.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60),
                  title: result.title,
                  excerpt: result.excerpt,
                  content: result.content,
                  date: new Date().toISOString().slice(0, 10),
                  tags: ["AI", "Crypto"],
                });
              } catch {
                alert("AI generation failed. Check your API key.");
              } finally {
                setAiLoading(false);
              }
            }}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" /> {aiLoading ? "Generating..." : "Custom Topic"}
          </button>
          <button
            onClick={() =>
              setEditing({
                id: crypto.randomUUID(),
                slug: "",
                title: "",
                excerpt: "",
                content: "",
                date: new Date().toISOString().slice(0, 10),
                tags: [],
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-bg-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" /> New Post
          </button>
        </div>
      </header>
      <main className="container mx-auto px-6 py-12">
        {editing ? (
          <BlogEditor post={editing} existingPosts={posts} onSave={handleSave} onCancel={() => setEditing(null)} />
        ) : (
          <div className="space-y-4">
            {posts.length === 0 && (
              <div className="text-text-secondary text-sm font-bold text-center py-20">No blog posts yet.</div>
            )}
            {posts.map((post) => (
              <div key={post.id} className="glass-card flex items-center justify-between">
                <div>
                  <div className="text-sm font-black">{post.title}</div>
                  <div className="text-[10px] font-bold text-text-secondary">
                    {post.date} · {post.tags.join(", ")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditing(post)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <Edit className="w-4 h-4 text-accent-cyan" />
                  </button>
                  <button onClick={() => handleDelete(post.id)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function calculateSEOScore(post: BlogPost & { focusKeyword?: string }) {
  let score = 0;
  const checks: { label: string; ok: boolean }[] = [];

  // Title length (50-60 ideal)
  const titleLen = post.title.length;
  if (titleLen >= 50 && titleLen <= 60) { score += 25; checks.push({ label: "Title length (50-60 chars)", ok: true }); }
  else if (titleLen >= 30 && titleLen <= 70) { score += 15; checks.push({ label: "Title length (30-70 chars)", ok: true }); }
  else { checks.push({ label: "Title length (50-60 ideal)", ok: false }); }

  // Excerpt length (120-160 ideal)
  const excLen = post.excerpt.length;
  if (excLen >= 120 && excLen <= 160) { score += 25; checks.push({ label: "Excerpt length (120-160 chars)", ok: true }); }
  else if (excLen >= 80 && excLen <= 200) { score += 15; checks.push({ label: "Excerpt length (80-200 chars)", ok: true }); }
  else { checks.push({ label: "Excerpt length (120-160 ideal)", ok: false }); }

  // Content length (800+ words ideal)
  const wordCount = post.content.split(/\s+/).filter((w) => w.length > 0).length;
  if (wordCount >= 800) { score += 25; checks.push({ label: `Content length (${wordCount} words)`, ok: true }); }
  else if (wordCount >= 300) { score += 15; checks.push({ label: `Content length (${wordCount} words)`, ok: true }); }
  else { checks.push({ label: `Content length (${wordCount} words, 800+ ideal)`, ok: false }); }

  // Heading structure
  const hasH1 = /^#\s/m.test(post.content);
  const hasH2 = /^##\s/m.test(post.content);
  if (hasH1 && hasH2) { score += 15; checks.push({ label: "Has H1 + H2 headings", ok: true }); }
  else if (hasH2) { score += 10; checks.push({ label: "Has H2 headings", ok: true }); }
  else { checks.push({ label: "Missing headings (# ##)", ok: false }); }

  // Focus keyword
  const kw = (post as any).focusKeyword || "";
  if (kw) {
    const inTitle = post.title.toLowerCase().includes(kw.toLowerCase());
    const inContent = post.content.toLowerCase().includes(kw.toLowerCase());
    if (inTitle && inContent) { score += 10; checks.push({ label: `Keyword "${kw}" in title + body`, ok: true }); }
    else if (inContent) { score += 5; checks.push({ label: `Keyword "${kw}" in body only`, ok: true }); }
    else { checks.push({ label: `Keyword "${kw}" missing`, ok: false }); }
  } else {
    checks.push({ label: "No focus keyword set", ok: false });
  }

  return { score: Math.min(score, 100), checks };
}

function checkDuplicates(post: BlogPost, existing: BlogPost[]) {
  const dups: string[] = [];
  for (const p of existing) {
    if (p.id === post.id) continue;
    if (p.title.toLowerCase() === post.title.toLowerCase()) {
      dups.push(`Same title as "${p.title}"`);
    }
    const common = p.content.toLowerCase().split(" ").filter((w) => post.content.toLowerCase().includes(w));
    const similarity = common.length / Math.max(p.content.split(" ").length, 1);
    if (similarity > 0.7) {
      dups.push(`High content similarity with "${p.title}"`);
    }
  }
  return dups;
}

function BlogEditor({ post, existingPosts, onSave, onCancel }: { post: BlogPost; existingPosts: BlogPost[]; onSave: (p: BlogPost) => void; onCancel: () => void }) {
  const [form, setForm] = useState(post);
  const [showSEO, setShowSEO] = useState(false);

  const seo = calculateSEOScore(form);
  const duplicates = checkDuplicates(form, existingPosts);

  return (
    <div className="glass-card max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black">{post.slug ? "Edit Post" : "New Post"}</h2>
        <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>

      {duplicates.length > 0 && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-400 text-xs font-black uppercase tracking-widest mb-2">
            <AlertTriangle className="w-4 h-4" /> Duplicate Warning
          </div>
          <ul className="space-y-1">
            {duplicates.map((d, i) => (
              <li key={i} className="text-xs text-red-300">• {d}</li>
            ))}
          </ul>
        </div>
      )}

      <input
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-accent-cyan/50"
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <input
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-accent-cyan/50"
        placeholder="Slug (e.g. bitcoin-halving-2026)"
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
      />
      <input
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-accent-cyan/50"
        placeholder="Excerpt"
        value={form.excerpt}
        onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
      />
      <textarea
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-accent-cyan/50 min-h-[200px]"
        placeholder="Content (supports markdown)"
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
      />
      <input
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-accent-cyan/50"
        placeholder="Tags (comma separated)"
        value={form.tags.join(", ")}
        onChange={(e) =>
          setForm({
            ...form,
            tags: e.target.value
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          })
        }
      />

      {/* SEO Score */}
      <div className="border border-white/10 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowSEO(!showSEO)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/[0.07] transition-colors"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent-cyan" />
            <span className="text-xs font-black uppercase tracking-widest">SEO Score</span>
            <span className={`text-xs font-black ${seo.score >= 80 ? "text-emerald-400" : seo.score >= 50 ? "text-amber-400" : "text-red-400"}`}>
              {seo.score}/100
            </span>
          </div>
          <span className="text-[10px] text-text-secondary font-bold">{showSEO ? "Hide" : "Show"}</span>
        </button>
        {showSEO && (
          <div className="px-4 py-3 space-y-2">
            {seo.checks.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {c.ok ? <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />}
                <span className={c.ok ? "text-gray-400" : "text-amber-400"}>{c.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => onSave(form)}
          className="flex-1 py-3 bg-accent-cyan text-bg-dark font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-transform"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-3 bg-white/5 border border-white/10 text-text-secondary font-black text-xs uppercase tracking-widest rounded-xl hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
