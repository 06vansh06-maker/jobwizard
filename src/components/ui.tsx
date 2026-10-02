import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { cn } from '../lib/cn';

/* Buttons */
export function PrimaryButton({ children, onClick, className, type }: { children: ReactNode; onClick?: () => void; className?: string; type?: 'button' | 'submit' }) {
  return (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      className={cn('inline-flex items-center justify-center gap-2 rounded-[9px] bg-[#4F46E5] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#3730A3] disabled:cursor-not-allowed disabled:opacity-50', className)}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('inline-flex items-center justify-center gap-2 rounded-[9px] border border-[#E2E8F0] bg-white px-5 py-2.5 text-[14px] font-semibold text-[#0F172A] transition-colors hover:border-[#CBD5E1] hover:bg-[#F8FAFC]', className)}
    >
      {children}
    </button>
  );
}

/* Card */
export function Card({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={cn('rounded-[16px] border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] scroll-mt-24', className)}>
      {children}
    </div>
  );
}

/* Section eyebrow + heading */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#4F46E5]">{children}</p>;
}

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-1 text-[28px] font-bold tracking-tight text-[#0F172A] sm:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-[640px] text-[15px] leading-relaxed text-[#64748B]">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* Match score */
export function scoreLabel(score: number) {
  if (score >= 9.2) return 'Excellent Match';
  if (score >= 8.5) return 'Strong Match';
  if (score >= 7.5) return 'Good Match';
  return 'Fair Match';
}

export function MatchBadge({ score, compact }: { score: number; compact?: boolean }) {
  return (
    <div className="shrink-0 text-right">
      <div className={compact ? 'text-[16px] font-bold leading-none text-[#0F172A]' : 'text-[20px] font-bold leading-none text-[#0F172A]'}>
        {score.toFixed(1)} <span className="text-[13px] font-semibold text-[#64748B]">/ 10</span>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.3 }}
        className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[11px] font-semibold text-[#16A34A]"
      >
        {scoreLabel(score)}
      </motion.div>
    </div>
  );
}

export function MatchBar({ score, className }: { score: number; className?: string }) {
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-[#E2E8F0]', className)} role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={10} aria-label={`Match score ${score} out of 10`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score * 10}%` }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="h-full rounded-full bg-[#16A34A]"
      />
    </div>
  );
}

export function SkillPill({ skill }: { skill: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[13px] font-medium text-[#334155]">
      <Check className="h-3.5 w-3.5 text-[#16A34A]" strokeWidth={3} />
      {skill}
    </span>
  );
}

/* Status badge */
const STATUS_STYLES: Record<string, string> = {
  Applied: 'bg-[#EEF2FF] text-[#4F46E5]',
  'Under Review': 'bg-[#FFFBEB] text-[#B45309]',
  Interview: 'bg-[#F5F3FF] text-[#6D28D9]',
  Rejected: 'bg-[#FEF2F2] text-[#DC2626]',
  Offer: 'bg-[#F0FDF4] text-[#16A34A]',
  Sent: 'bg-[#EEF2FF] text-[#4F46E5]',
  Opened: 'bg-[#ECFEFF] text-[#0E7490]',
  Replied: 'bg-[#F5F3FF] text-[#6D28D9]',
  Interested: 'bg-[#F0FDF4] text-[#16A34A]',
  'Not Contacted': 'bg-[#F8FAFC] text-[#64748B] ring-1 ring-[#E2E8F0]',
  'Not Interested': 'bg-[#FEF2F2] text-[#DC2626]',
  'Needs Action': 'bg-[#FFFBEB] text-[#B45309]',
  Withdrawn: 'bg-[#F1F5F9] text-[#64748B]',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold', STATUS_STYLES[status] ?? 'bg-[#F8FAFC] text-[#64748B]')}>
      {status}
    </span>
  );
}

/* Empty state */
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-[#CBD5E1] bg-white px-6 py-14 text-center">
      <p className="text-[16px] font-semibold text-[#0F172A]">{title}</p>
      {description && <p className="mt-1.5 max-w-[420px] text-[14px] leading-relaxed text-[#64748B]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* Skeleton */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-[8px] bg-[#E2E8F0]', className)} />;
}

export function SkeletonCard() {
  return (
    <Card className="p-5">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="mt-2 h-4 w-1/3" />
      <Skeleton className="mt-4 h-2 w-full" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-7 w-20" />
      </div>
    </Card>
  );
}

/* Friendly error state */
export function ErrorState({ title, description, onRetry }: { title: string; description?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[16px] border border-[#FECACA] bg-[#FEF2F2]/50 px-6 py-14 text-center" role="alert">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FEE2E2] text-[20px] font-bold text-[#DC2626]">!</span>
      <p className="mt-3 text-[16px] font-semibold text-[#0F172A]">{title}</p>
      {description && <p className="mt-1.5 max-w-[420px] text-[14px] leading-relaxed text-[#64748B]">{description}</p>}
      {onRetry && (
        <button onClick={onRetry} className="mt-5 rounded-[9px] bg-[#DC2626] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#B91C1C]">
          Try again
        </button>
      )}
    </div>
  );
}

/* Toggle */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-[#4F46E5]' : 'bg-[#CBD5E1]')}>
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

/* Tabs */
export function Tabs({ tabs, active, onChange }: { tabs: readonly string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {tabs.map((t) => (
        <button key={t} role="tab" aria-selected={active === t} onClick={() => onChange(t)}
          className={cn('rounded-[9px] px-4 py-2 text-[14px] font-semibold transition-colors',
            active === t ? 'bg-[#0F172A] text-white' : 'border border-[#E2E8F0] bg-white text-[#475569] hover:border-[#CBD5E1]')}>
          {t}
        </button>
      ))}
    </div>
  );
}
