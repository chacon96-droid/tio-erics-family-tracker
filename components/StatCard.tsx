export function StatCard({ label, value, detail, tone = "dark" }: { label: string; value: string | number; detail?: string; tone?: "dark" | "light" }) {
  return (
    <section
      className={`relative overflow-hidden rounded-app border p-4 shadow-[0_24px_70px_rgba(0,0,0,0.12)] ${
        tone === "light" ? "border-line bg-white/80" : "border-white/10 bg-white/[0.07]"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <p className="text-xs font-black uppercase tracking-[0.16em] text-gold">{label}</p>
      <p className={`mt-3 font-serif text-4xl font-black tracking-tight ${tone === "light" ? "text-ink" : "text-ivory"}`}>{value}</p>
      {detail ? <p className={`mt-2 text-sm font-semibold leading-snug ${tone === "light" ? "text-muted" : "text-champagne/[0.82]"}`}>{detail}</p> : null}
    </section>
  );
}
