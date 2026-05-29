export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-app border border-dashed border-line bg-white/70 p-6 text-muted">
      <p className="font-black text-ink">{title}</p>
      {body ? <p className="mt-1 text-sm font-semibold">{body}</p> : null}
    </div>
  );
}
