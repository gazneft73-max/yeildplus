import { assetInfo } from "@/lib/types";

/** Original coloured monogram badge for each supported asset. */
export function AssetIcon({ symbol, size = 28 }: { symbol: string; size?: number }) {
  const a = assetInfo(symbol);
  const color = a?.color ?? "#5b6784";
  return (
    <span
      className="inline-grid place-items-center rounded-full font-display font-bold text-white shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36, boxShadow: `0 0 0 1px rgb(255 255 255 / 0.12), 0 4px 12px -4px ${color}` }}
      aria-hidden
    >
      {symbol.slice(0, 1)}
    </span>
  );
}
