export function Sparkline({ data, positive, className }: { data: number[]; positive: boolean; className?: string }) {
  if (!data?.length) return null;
  const w = 100;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / span) * (h - 4) - 2}`).join(" ");
  const color = positive ? "#3ee6b8" : "#fb7185";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className ?? "size-full"} preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
