export function PlaceholderPage({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-paper px-6 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink-soft">Built in {phase} — this route exists so the structure is real.</p>
    </div>
  );
}
