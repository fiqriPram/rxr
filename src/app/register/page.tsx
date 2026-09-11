"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, Lock, Loader2, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Gagal mendaftar.");
      }
    } catch {
      setError("Gangguan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-line-2 bg-canvas-soft py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-blue-500";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4 py-10">
      <div className="w-full rounded-xl border border-line bg-panel p-6">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-blue-400" />
          <h1 className="text-base font-bold text-white">Buat Akun</h1>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Daftar gratis untuk checkout lebih cepat dan pantau semua pesananmu.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Nama Lengkap</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kamu" autoComplete="name" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" autoComplete="email" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Nomor WhatsApp <span className="text-slate-500">(opsional)</span>
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="081234567890" autoComplete="tel" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Password (min. 6 karakter)</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" className={inputCls} />
            </div>
          </div>

          {error && <div className="text-xs text-rose-400">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm disabled:opacity-50">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Mendaftar..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
