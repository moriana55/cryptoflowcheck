"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/lib/admin";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (await loginAdmin(password)) {
      router.push("/admin");
    } else {
      setError("Invalid password");
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="glass-card w-full max-w-sm space-y-6">
        <h1 className="text-xl font-black tracking-tight text-center">Admin Login</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-accent-cyan/50"
        />
        {error && <div className="text-red-400 text-xs font-bold text-center">{error}</div>}
        <button
          type="submit"
          className="w-full py-3 bg-accent-cyan text-bg-dark font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-transform"
        >
          Login
        </button>
      </form>
    </div>
  );
}
