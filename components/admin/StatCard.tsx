const StatCard = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => (
  <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-2 font-display text-3xl font-bold tracking-tight">{value}</p>
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export default StatCard;
