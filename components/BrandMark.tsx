export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-12 w-12 shrink-0 place-items-center border border-gold bg-ink text-lg font-black text-gold shadow-brand">
        TE
      </div>
      {!compact ? (
        <div className="leading-none">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-gold">Call Tio Eric</p>
          <p className="mt-1 font-serif text-2xl font-black tracking-tight text-ivory">Family Tracker</p>
        </div>
      ) : null}
    </div>
  );
}
