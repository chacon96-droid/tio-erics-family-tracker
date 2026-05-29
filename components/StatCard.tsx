export function StatCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <section className="rounded-app border border-line bg-white p-4">
      <p className="text-xs font-black uppercase text-clay">{label}</p>
      <p className="mt-2 text-3xl font-black text-ink">{value}</p>
      {detail ? <p className="mt-1 text-sm font-semibold text-muted">{detail}</p> : null}
    </section>
  );
}
