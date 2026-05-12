"use client";
import { useState } from "react";
import JSZip from "jszip";
import { FileText, Upload, Download, ArrowLeft, RefreshCw, Shield, Scale, Info, Search, FileCheck } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function UdfReader() {
  const [content, setContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".udf")) {
      setError("GEÇERSİZ FORMAT: LÜTFEN .UDF DOKÜMANI YÜKLEYİNİZ");
      return;
    }

    setIsLoading(true);
    setError("");
    setFileName(file.name);

    try {
      const zip = await JSZip.loadAsync(file);
      const contentXml = await zip.file("content.xml")?.async("string");

      if (!contentXml) {
        throw new Error("UDF içeriği (content.xml) bulunamadı.");
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(contentXml, "text/xml");
      const textNodes = xmlDoc.getElementsByTagName("content");
      let extractedText = "";

      if (textNodes.length > 0) {
        for (let i = 0; i < textNodes.length; i++) {
          extractedText += textNodes[i].textContent + "\n";
        }
      } else {
        extractedText = xmlDoc.documentElement.textContent || "";
      }

      setContent(extractedText.trim());
    } catch (err) {
      console.error(err);
      setError("DOSYA ANALİZ HATASI: BELGE OKUNAMADI");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadText = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName.replace(".udf", ".txt");
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1F2C] selection:bg-[#C5A059]/20 font-inter">
      
      {/* Header Bar */}
      <header className="bg-[#0F172A] text-white py-4 shadow-xl border-b border-[#C5A059]/30">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#C5A059] rounded-lg flex items-center justify-center text-[#0F172A]">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none uppercase">UDF <span className="text-[#C5A059]">ANALİZ</span></h1>
              <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-1">GelecekFinans Kurumsal Çözümler</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Shield className="w-3 h-3 text-[#C5A059]" />
              %100 Güvenli & Yerel Analiz
            </div>
            <Link href="/" className="px-4 py-2 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
              Sistemi Kapat
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-6 py-12">
        
        <main>
          <AnimatePresence mode="wait">
            {!content && !isLoading ? (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-serif font-medium text-[#0F172A] mb-4 italic">Belge Çözümleme Merkezi</h2>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                    UYAP dökümanlarınızı güvenli bir şekilde görüntüleyin ve metin formatına dönüştürün.
                  </p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-12 text-center cursor-pointer relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#C5A059]"></div>
                  <input 
                    type="file" 
                    accept=".udf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-[#0F172A] group-hover:bg-[#C5A059]/10 transition-colors">
                      <Upload className="w-8 h-8 opacity-40" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">UDF Dosyası Yükleyiniz</h3>
                      <p className="text-slate-400 text-xs">Sürükleyip bırakın veya göz atın</p>
                    </div>
                    <div className="flex items-center gap-2 px-6 py-2 bg-[#0F172A] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-transform group-hover:scale-105">
                      Dosya Seçin
                    </div>
                  </div>
                  {error && <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">{error}</div>}
                </div>

                <div className="mt-12 grid grid-cols-3 gap-6">
                  {[
                    { icon: Shield, label: "Gizli", desc: "Verileriniz saklanmaz" },
                    { icon: RefreshCw, label: "Hızlı", desc: "Saniyeler içinde" },
                    { icon: FileCheck, label: "Tam", desc: "XML tabanlı analiz" }
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <item.icon className="w-5 h-5 mx-auto mb-3 text-[#C5A059]" />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1">{item.label}</h4>
                      <p className="text-[9px] text-slate-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl shadow-2xl p-20 text-center max-w-2xl mx-auto"
              >
                <div className="w-16 h-16 border-4 border-[#C5A059]/20 border-t-[#C5A059] rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">Döküman Çözümleniyor</h3>
                <p className="text-slate-400 text-xs uppercase tracking-widest">Lütfen bekleyiniz...</p>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Result Control Bar */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center text-white">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0F172A]">{fileName}</h4>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">İçerik Başarıyla Ayrıştırıldı</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setContent("")}
                      className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Yeni Belge
                    </button>
                    <button 
                      onClick={downloadText}
                      className="flex items-center gap-2 px-8 py-2.5 bg-[#C5A059] text-[#0F172A] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-[#C5A059]/20"
                    >
                      <Download className="w-4 h-4" />
                      METİN OLARAK KAYDET
                    </button>
                  </div>
                </div>

                {/* The Legal Document Viewer */}
                <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden">
                  <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Info className="w-3 h-3 text-[#C5A059]" />
                      <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Resmi Doküman Görüntüleyici</span>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Görünüm: Standart (A4)</div>
                    </div>
                  </div>
                  <div className="p-12 sm:p-20 bg-white min-h-[600px] max-h-[800px] overflow-y-auto">
                    <div className="max-w-2xl mx-auto font-serif text-[17px] leading-[1.8] text-[#1e293b] whitespace-pre-wrap text-justify selection:bg-[#C5A059]/30">
                      {content}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-20 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            <Search className="w-3 h-3 text-[#C5A059]" />
            UYAP v3 / UDF v2 Protokolleri ile uyumludur
          </div>
          <p className="text-slate-400 text-[10px] leading-relaxed max-w-xs mx-auto">
            GelecekFinans Hukuk Teknolojileri Birimi tarafından <br />
            güvenli analiz için geliştirilmiştir.
          </p>
        </footer>
      </div>
    </div>
  );
}
