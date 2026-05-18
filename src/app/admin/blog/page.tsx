"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, X, Sparkles, Wand2, CheckCircle, AlertTriangle, BarChart3, Search, Loader2 } from "lucide-react";

interface BlogPost {
  id: string; slug: string; title: string; excerpt: string;
  content: string; date: string; tags: string[];
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const fetchPosts = () => {
    setLoading(true);
    fetch("/api/blog").then(r => r.json()).then(setPosts).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, []);

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  async function handleSave(post: BlogPost) {
    setSaving(true);
    try {
      const isNew = !posts.find(p => p.id === post.id);
      const res = await fetch("/api/blog", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
      if (res.ok) {
        setEditing(null);
        fetchPosts();
      } else {
        alert("Kayıt başarısız!");
      }
    } catch { alert("Hata oluştu!"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu yazıyı silmek istediğine emin misin?")) return;
    await fetch("/api/blog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchPosts();
  }

  async function handleAIGenerate(topic?: string) {
    setAiLoading(true);
    try {
      const endpoint = topic ? `/api/blog/ai?topic=${encodeURIComponent(topic)}` : "/api/cron/blog";
      const res = await fetch(endpoint, {
        headers: { "Authorization": `Bearer ${prompt("Cron Secret gir:") || ""}` },
      });
      if (res.ok) {
        fetchPosts();
        alert("AI blog yazısı oluşturuldu!");
      } else {
        alert("AI üretimi başarısız. API key'i kontrol et.");
      }
    } catch { alert("AI hatası!"); }
    finally { setAiLoading(false); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Blog Yazıları</h1>
          <p className="text-sm text-gray-500 mt-1">{posts.length} yazı</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleAIGenerate()}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-purple-500/30 transition-colors disabled:opacity-50"
          >
            <Wand2 size={14} /> {aiLoading ? "Üretiliyor..." : "AI Yaz"}
          </button>
          <button
            onClick={() => setEditing({
              id: crypto.randomUUID(), slug: "", title: "", excerpt: "",
              content: "", date: new Date().toISOString().slice(0, 10), tags: [],
            })}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-400 text-[#0a0a0f] rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-cyan-300 transition-colors"
          >
            <Plus size={14} /> Yeni Yazı
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Başlık veya tag ile ara..."
          className="w-full bg-[#111118] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-gray-300 outline-none focus:border-cyan-400/30"
        />
      </div>

      {editing ? (
        <BlogEditor post={editing} existingPosts={posts} saving={saving} onSave={handleSave} onCancel={() => setEditing(null)} />
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-gray-600 text-sm font-bold text-center py-20">Henüz yazı yok.</div>
          )}
          {filtered.map(post => (
            <div key={post.id} className="bg-[#111118] border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:border-white/10 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-black text-white truncate">{post.title}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] font-bold text-gray-600">{post.date}</span>
                  <span className="text-[10px] font-bold text-gray-600">·</span>
                  <span className="text-[10px] font-bold text-cyan-400/60">{post.tags.join(", ")}</span>
                  <span className="text-[10px] font-bold text-gray-600">·</span>
                  <span className="text-[10px] font-bold text-gray-600">{post.content.split(/\s+/).length} kelime</span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <button onClick={() => setEditing(post)} className="p-2.5 hover:bg-white/5 rounded-xl transition-colors">
                  <Edit size={15} className="text-cyan-400" />
                </button>
                <button onClick={() => handleDelete(post.id)} className="p-2.5 hover:bg-white/5 rounded-xl transition-colors">
                  <Trash2 size={15} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BlogEditor({ post, existingPosts, saving, onSave, onCancel }: {
  post: BlogPost; existingPosts: BlogPost[]; saving: boolean;
  onSave: (p: BlogPost) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState(post);
  const [showSEO, setShowSEO] = useState(false);

  const seo = calculateSEOScore(form);

  return (
    <div className="bg-[#111118] border border-white/5 rounded-2xl p-8 max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black">{post.slug ? "Yazıyı Düzenle" : "Yeni Yazı"}</h2>
        <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-lg"><X size={16} /></button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input className="col-span-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-cyan-400/30"
          placeholder="Başlık" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-cyan-400/30"
          placeholder="Slug (ör: bitcoin-analiz-2026)" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
        <input className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-cyan-400/30"
          placeholder="Tarih" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
      </div>

      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-cyan-400/30"
        placeholder="Özet (SEO description)" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} />

      <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-cyan-400/30 min-h-[300px] font-mono"
        placeholder="İçerik (Markdown destekli)" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />

      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-cyan-400/30"
        placeholder="Taglar (virgülle ayır)" value={form.tags.join(", ")}
        onChange={e => setForm({ ...form, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })} />

      {/* SEO Score */}
      <div className="border border-white/10 rounded-xl overflow-hidden">
        <button onClick={() => setShowSEO(!showSEO)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/[0.07] transition-colors">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-cyan-400" />
            <span className="text-[11px] font-black uppercase tracking-widest">SEO Skoru</span>
            <span className={`text-[11px] font-black ${seo.score >= 80 ? "text-emerald-400" : seo.score >= 50 ? "text-amber-400" : "text-red-400"}`}>
              {seo.score}/100
            </span>
          </div>
          <span className="text-[10px] text-gray-600 font-bold">{showSEO ? "Gizle" : "Göster"}</span>
        </button>
        {showSEO && (
          <div className="px-4 py-3 space-y-2">
            {seo.checks.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {c.ok ? <CheckCircle size={12} className="text-emerald-400 shrink-0" /> : <AlertTriangle size={12} className="text-amber-400 shrink-0" />}
                <span className={c.ok ? "text-gray-400" : "text-amber-400"}>{c.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button onClick={() => onSave(form)} disabled={saving}
          className="flex-1 py-3 bg-cyan-400 text-[#0a0a0f] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-cyan-300 transition-colors disabled:opacity-50">
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button onClick={onCancel}
          className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-500 font-black text-xs uppercase tracking-widest rounded-xl hover:text-white transition-colors">
          İptal
        </button>
      </div>
    </div>
  );
}

function calculateSEOScore(post: BlogPost) {
  let score = 0;
  const checks: { label: string; ok: boolean }[] = [];

  const titleLen = post.title.length;
  if (titleLen >= 30 && titleLen <= 70) { score += 25; checks.push({ label: `Başlık uzunluğu (${titleLen} karakter)`, ok: true }); }
  else { checks.push({ label: `Başlık uzunluğu (${titleLen}, ideal: 30-70)`, ok: false }); }

  const excLen = post.excerpt.length;
  if (excLen >= 80 && excLen <= 200) { score += 25; checks.push({ label: `Özet uzunluğu (${excLen} karakter)`, ok: true }); }
  else { checks.push({ label: `Özet uzunluğu (${excLen}, ideal: 80-200)`, ok: false }); }

  const wordCount = post.content.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount >= 800) { score += 25; checks.push({ label: `İçerik (${wordCount} kelime)`, ok: true }); }
  else if (wordCount >= 300) { score += 15; checks.push({ label: `İçerik (${wordCount} kelime, 800+ ideal)`, ok: true }); }
  else { checks.push({ label: `İçerik çok kısa (${wordCount} kelime)`, ok: false }); }

  const hasHeadings = /^##\s/m.test(post.content);
  if (hasHeadings) { score += 15; checks.push({ label: "Başlık yapısı (## mevcut)", ok: true }); }
  else { checks.push({ label: "Başlık yapısı eksik (## kullan)", ok: false }); }

  if (post.tags.length >= 2) { score += 10; checks.push({ label: `${post.tags.length} tag`, ok: true }); }
  else { checks.push({ label: "En az 2 tag ekle", ok: false }); }

  return { score: Math.min(score, 100), checks };
}
