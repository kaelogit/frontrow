/** Stable pseudo-random jitter per UTC hour — avoids flicker on re-render. */
function hourBucket(): number {
  const d = new Date();
  return (
    d.getUTCFullYear() * 1_000_000 +
    (d.getUTCMonth() + 1) * 10_000 +
    d.getUTCDate() * 100 +
    d.getUTCHours()
  );
}

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function jitterCount(base: number, jitterPct: number, salt: string): number {
  if (jitterPct <= 0) return base;
  const bucket = hourBucket();
  const roll = hashString(`${bucket}:${salt}`) % 1000;
  const deltaPct = (roll / 1000) * jitterPct * 2 - jitterPct;
  return Math.round(base * (1 + deltaPct / 100));
}

export function formatCompactCount(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return m >= 10 ? `${Math.round(m)}M` : `${m.toFixed(1)}M`;
  }
  if (n >= 10_000) {
    const k = n / 1000;
    return k >= 100 ? `${Math.round(k)}k` : `${k.toFixed(1)}k`;
  }
  return n.toLocaleString("en-US");
}

export function formatFullCount(n: number): string {
  return n.toLocaleString("en-US");
}
