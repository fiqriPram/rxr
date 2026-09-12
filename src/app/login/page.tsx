"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, LogIn } from "lucide-react";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn.email({ email, password });
      if (res.error) {
        setError(
          res.error.message === "Invalid email or password"
            ? "Email atau password salah."
            : res.error.message || "Gagal masuk."
        );
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Gangguan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4 py-10">
      <div className="w-full rounded-xl border border-line bg-panel p-6">
        <div className="flex items-center gap-2">
          <LogIn className="h-5 w-5 text-blue-400" />
          <h1 className="text-base font-bold text-white">Masuk Akun</h1>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Masuk untuk checkout lebih cepat dan lihat riwayat pesananmu.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
                className="w-full rounded-lg border border-line-2 bg-canvas-soft py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-lg border border-line-2 bg-canvas-soft py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-blue-500"
              />
            </div>
          </div>

          {error && <div className="text-xs text-rose-400">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm disabled:opacity-50">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Memeriksa..." : "Masuk"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
