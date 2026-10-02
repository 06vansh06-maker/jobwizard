import { useMemo } from 'react';
import { motion } from 'motion/react';

/* Clean SVG area chart with two series */
export function AreaChart({
  labels,
  seriesA,
  seriesB,
  labelA = 'Jobs',
  labelB = 'Matches',
  height = 180,
}: {
  labels: string[];
  seriesA: number[];
  seriesB: number[];
  labelA?: string;
  labelB?: string;
  height?: number;
}) {
  const W = 600;
  const H = 200;
  const PAD = 8;

  const { pathA, pathB, areaA, max, ticks } = useMemo(() => {
    const max = Math.max(...seriesA, ...seriesB, 1);
    const x = (i: number) => PAD + (i / Math.max(1, labels.length - 1)) * (W - PAD * 2);
    const y = (v: number) => H - 24 - (v / max) * (H - 48);
    const line = (s: number[]) => s.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const area = (s: number[]) => `${line(s)} L${x(s.length - 1).toFixed(1)},${H - 24} L${x(0).toFixed(1)},${H - 24} Z`;
    return { pathA: line(seriesA), pathB: line(seriesB), areaA: area(seriesA), max, ticks: x };
  }, [labels.length, seriesA, seriesB]);

  void ticks;
  void max;

  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-[12px] font-medium text-[#64748B]">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#4F46E5]" />{labelA}</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#06B6D4]" />{labelB}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} role="img" aria-label={`${labelA} and ${labelB} chart`}>
        <defs>
          <linearGradient id="jwArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PAD} x2={W - PAD} y1={H * f} y2={H * f} stroke="#E2E8F0" strokeWidth="1" />
        ))}
        <motion.path d={areaA} fill="url(#jwArea)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
        <motion.path d={pathA} fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
        <motion.path d={pathB} fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.15 }} />
        {seriesA.map((v, i) => {
          const cx = PAD + (i / Math.max(1, labels.length - 1)) * (W - PAD * 2);
          const cy = H - 24 - (v / Math.max(...seriesA, ...seriesB, 1)) * (H - 48);
          return <circle key={i} cx={cx} cy={cy} r="3.5" fill="#fff" stroke="#4F46E5" strokeWidth="2" />;
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] font-medium text-[#94A3B8]">
        {labels.map((l) => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

/* Vertical bars */
export function BarChart({
  data,
  highlightLast,
  height = 140,
}: {
  data: Array<{ label: string; value: number }>;
  highlightLast?: boolean;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => {
          const last = highlightLast && i === data.length - 1;
          return (
            <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(6, (d.value / max) * 100)}%` }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className={`w-full max-w-[36px] rounded-[6px] ${last ? 'bg-[#4F46E5]' : d.value === 0 ? 'bg-[#E2E8F0]' : 'bg-[#C7D2FE]'}`}
                style={{ minHeight: 6 }}
                title={`${d.label}: ${d.value}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-2">
        {data.map((d) => (
          <span key={d.label} className="min-w-0 flex-1 text-center text-[11px] font-medium text-[#94A3B8]">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

/* Horizontal funnel stages */
export function Funnel({
  stages,
  onSelect,
}: {
  stages: Array<{ label: string; value: number; color: string; to?: string }>;
  onSelect?: (stage: { label: string; value: number; to?: string }) => void;
}) {
  const max = Math.max(...stages.map((s) => s.value), 1);
  return (
    <div className="space-y-3">
      {stages.map((s, i) => {
        const row = (
          <>
            <div className="mb-1 flex items-center justify-between text-[13px]">
              <span className="font-medium text-[#475569]">{i + 1}. {s.label}</span>
              <span className="font-bold text-[#0F172A]">{s.value}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#EEF2FF]">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(s.value / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.08 }}
                className="h-full rounded-full"
                style={{ backgroundColor: s.color }}
              />
            </div>
          </>
        );
        return onSelect ? (
          <button key={s.label} onClick={() => onSelect(s)} className="block w-full rounded-[10px] p-1 text-left transition-colors hover:bg-[#F8FAFC]">
            {row}
          </button>
        ) : (
          <div key={s.label}>{row}</div>
        );
      })}
    </div>
  );
}

/* Donut distribution */
export function Donut({
  segments,
  size = 150,
  onSelect,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
  size?: number;
  onSelect?: (segment: { label: string; value: number }) => void;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const R = 54;
  const C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox="0 0 140 140" role="img" aria-label="Match distribution">
        <circle cx="70" cy="70" r={R} fill="none" stroke="#EEF2FF" strokeWidth="16" />
        {segments.map((s) => {
          const frac = s.value / total;
          const dash = frac * C;
          const off = -acc * C;
          acc += frac;
          return (
            <motion.circle
              key={s.label}
              cx="70" cy="70" r={R} fill="none"
              stroke={s.color} strokeWidth="16"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={off}
              strokeLinecap="butt"
              transform="rotate(-90 70 70)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
          );
        })}
        <text x="70" y="66" textAnchor="middle" fontSize="24" fontWeight="800" fill="#0F172A">{total}</text>
        <text x="70" y="84" textAnchor="middle" fontSize="11" fill="#64748B">matches</text>
      </svg>
      <div className="space-y-2">
        {segments.map((s) => (
          <div key={s.label}>
            {onSelect ? (
              <button onClick={() => onSelect(s)} className="flex w-full items-center gap-2 rounded-[8px] px-1 py-0.5 text-left text-[13px] transition-colors hover:bg-[#F8FAFC]" title={`Filter: ${s.label}`}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="font-medium text-[#334155]">{s.label}</span>
                <span className="ml-auto font-bold text-[#0F172A]">{s.value}</span>
              </button>
            ) : (
              <p className="flex items-center gap-2 text-[13px]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="font-medium text-[#334155]">{s.label}</span>
                <span className="ml-auto font-bold text-[#0F172A]">{s.value}</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
