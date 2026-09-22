import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const metadata = {
  title: "Kontak Kami - RXR",
  description: "Hubungi CS RXR via WhatsApp, email, atau kunjungi alamat usaha kami.",
};

const contacts = [
  {
    icon: Phone,
    label: "WhatsApp (CS 24 Jam)",
    value: "+62 857-5433-5542",
    href: "https://wa.me/6285754335542",
  },
  {
    icon: Mail,
    label: "Email",
    value: "cs@rxr.my.id",
    href: "mailto:cs@rxr.my.id",
  },
  {
    icon: MapPin,
    label: "Alamat Usaha",
    value: "Jl. Trans Kalimantan Handil Bakti, Barito Kuala, Kalimantan Selatan",
    href: undefined,
  },
  {
    icon: Clock,
    label: "Jam Operasional",
    value: "Setiap hari, 24 jam nonstop",
    href: undefined,
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold text-white">Kontak Kami</h1>
      <p className="mt-1 text-xs text-slate-400">
        Ada kendala pesanan atau pertanyaan? Hubungi kami melalui kanal berikut.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contacts.map((c) => {
          const inner = (
            <>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                <c.icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[11px] uppercase tracking-wider text-slate-400">
                  {c.label}
                </span>
                <span className="block text-sm font-bold text-white">{c.value}</span>
              </span>
            </>
          );
          return c.href ? (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border border-line bg-panel p-4 hover:border-line-strong transition"
            >
              {inner}
            </a>
          ) : (
            <div
              key={c.label}
              className="flex items-center gap-3 rounded-xl border border-line bg-panel p-4"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
