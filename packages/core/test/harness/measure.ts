// §15 harness — measurement primitives. Budgets are asserted as p50/p95/p99 over
// repeated calls; percentile = nearest-rank (ceil(q·n)), the conservative reading.
export function percentile(samples: number[], q: number): number {
  if (samples.length === 0) return NaN;
  const sorted = [...samples].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(q * sorted.length) - 1))]!;
}

export function timeN(n: number, fn: (i: number) => void): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = performance.now();
    fn(i);
    out.push(performance.now() - t0);
  }
  return out;
}

export interface LawRow {
  scale: string; law: string; budgetMs: number; stat: string; measuredMs: number; pass: boolean;
}
const rows: LawRow[] = [];

/** Record + assert one §15 law. Budgets fail builds: the caller expects(row.pass). */
export function law(scale: string, name: string, stat: string, measuredMs: number, budgetMs: number): LawRow {
  const row: LawRow = {
    scale, law: name, budgetMs, stat,
    measuredMs: Math.round(measuredMs * 1000) / 1000,
    pass: measuredMs <= budgetMs,
  };
  rows.push(row);
  console.log(`[§15] ${scale.padEnd(2)} ${name.padEnd(46)} ${stat.padEnd(4)} ${row.measuredMs.toFixed(3).padStart(10)}ms  budget ${budgetMs}ms  ${row.pass ? "PASS" : "FAIL"}`);
  return row;
}

export function lawTable(): LawRow[] { return rows; }
