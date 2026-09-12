"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, Lock, Loader2, UserPlus } from "lucide-react";
import { signUp, signIn } from "@/lib/auth-client";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.1.1c2.1-2 3.9-4.9 3.9-8.7z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.1.1-3.6 2.8v.1C3.5 21.4 7.5 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.6-2.8-.1.1C.5 8.6 0 10.2 0 12s.5 3.4 1.4 4.9l3.8-2.5z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.5 0 3.5 2.6 1.4 6.8l3.8 2.9c1-2.9 3.7-5 6.8-5z"
      />
    </svg>
  );
}

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
      const res = await signUp.email({
        name,
        email,
        password,
        // @ts-expect-error additional field (phone) terdaftar di auth config
        phone: phone || undefined,
      });
      if (res.error) {
        const msg = res.error.message || "";
        setError(
          /already exists|terdaftar/i.test(msg)
            ? "Email sudah terdaftar. Silakan masuk."
            : msg || "Gagal mendaftar."
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

        <div className="my-3 flex items-center gap-2 text-[11px] text-slate-500">
          <span className="h-px flex-1 bg-line" />
          <span>atau</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          onClick={() => signIn.social({ provider: "google", callbackURL: "/" })}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-line-2 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition"
        >
          <GoogleIcon />
          Daftar dengan Google
        </button>

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
