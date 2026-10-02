import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Archive, CheckCheck, StickyNote, Inbox, RotateCcw, Loader2, Check, Pencil } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Card, EmptyState, PageHeader, StatusBadge, Skeleton } from '../../components/ui';
import { Drawer } from '../../components/app-shell';
import { cn } from '../../lib/cn';
import type { RecruiterResponse } from '../../types';

const FOLDERS = ['All', 'Interested', 'Needs Action', 'Not Interested', 'Archived'] as const;

function ResponseDetail({
  response: active,
  onClose,
}: {
  response: RecruiterResponse;
  onClose?: () => void;
}) {
  const { markResponseRead, archiveResponse, restoreResponse, addResponseNote, sendReply } = useApp();
  const [replyText, setReplyText] = useState(active.suggestedResponse);
  const [noteText, setNoteText] = useState('');
  const [editing, setEditing] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setReplyText(active.suggestedResponse);
    setNoteText('');
    setEditing(true);
    setSending(false);
  }, [active.id, active.suggestedResponse]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[14px] font-bold text-[#4F46E5]">{active.initials}</span>
        <div className="min-w-0">
          <p className="truncate text-[16px] font-semibold">{active.recruiterName}</p>
          <p className="truncate text-[13px] text-[#64748B]">{active.recruiterTitle} • {active.timestamp}</p>
        </div>
        <span className="ml-auto shrink-0"><StatusBadge status={active.classification} /></span>
      </div>

      <div>
        <p className="mb-1.5 text-[14px] font-semibold">Original message</p>
        <div className="rounded-[12px] border border-[#E2E8F0] bg-white p-4">
          <p className="whitespace-pre-line text-[14px] leading-relaxed text-[#334155]">{active.message}</p>
        </div>
      </div>

      <div className="rounded-[12px] border border-[#4F46E5]/20 bg-[#EEF2FF]/40 p-4">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4F46E5]">
          <Sparkles className="h-4 w-4" />AI Classification
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={active.classification} />
          <span className="text-[13px] text-[#475569]">Confidence: <span className="font-bold text-[#0F172A]">{active.confidence}%</span> <span className="text-[#94A3B8]">(demo estimate)</span></span>
          {active.replied && <span className="rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-bold text-[#16A34A]">Replied</span>}
        </div>
      </div>

      <div className="rounded-[12px] border border-[#06B6D4]/30 bg-[#ECFEFF]/60 p-4">
        <p className="text-[12px] font-bold uppercase tracking-[0.07em] text-[#0E7490]">Recommended action</p>
        <p className="mt-1 text-[13px] font-medium leading-relaxed text-[#334155]">
          {active.classification === 'Needs Action'
            ? '“Reply within 24 hours” — this thread needs a direct answer to keep momentum.'
            : active.classification === 'Interested'
              ? '“Reply within 24 hours” — interested recruiters expect a fast follow-up.'
              : 'No reply needed — archive to keep the inbox focused.'}
        </p>
        <p className="mt-0.5 text-[11px] text-[#94A3B8]">AI/demo recommendation — you decide.</p>
      </div>

      <div>
        <p className="mb-1.5 text-[14px] font-semibold">Suggested Response</p>
        {editing ? (
          <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={5} className="w-full rounded-[9px] border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-[14px] leading-relaxed outline-none focus:border-[#4F46E5]" aria-label="Suggested response" />
        ) : (
          <p className="whitespace-pre-line rounded-[9px] border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-[14px] leading-relaxed">{replyText}</p>
        )}
        <div className="mt-2.5 flex flex-wrap gap-2">
          <button onClick={() => setEditing((v) => !v)} className="inline-flex items-center gap-1 rounded-[8px] border border-[#E2E8F0] bg-white px-3.5 py-2 text-[13px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]">
            <Pencil className="h-3.5 w-3.5" />{editing ? 'Preview' : 'Edit'}
          </button>
          <button
            onClick={() => {
              if (!replyText.trim() || sending) return;
              setSending(true);
              const text = replyText;
              setTimeout(() => {
                setSending(false);
                sendReply(active.id, text);
                onClose?.();
              }, 900);
            }}
            disabled={!replyText.trim() || active.replied || sending}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[8px] bg-[#4F46E5] px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#3730A3] disabled:opacity-70"
          >
            {active.replied ? (<><Check className="h-3.5 w-3.5" strokeWidth={3} />Sent</>) : sending ? (<><Loader2 className="h-3.5 w-3.5 animate-spin" />Sending…</>) : (<><Send className="h-3.5 w-3.5" />Send</>)}
          </button>
          <button onClick={() => markResponseRead(active.id)} className="rounded-[8px] border border-[#E2E8F0] bg-white px-3.5 py-2 text-[13px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]">
            Mark Read
          </button>
          {active.archived ? (
            <button onClick={() => { restoreResponse(active.id); onClose?.(); }} className="inline-flex items-center gap-1 rounded-[8px] border border-[#E2E8F0] bg-white px-3.5 py-2 text-[13px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]">
              <RotateCcw className="h-3.5 w-3.5" />Restore
            </button>
          ) : (
            <button onClick={() => { archiveResponse(active.id); onClose?.(); }} className="inline-flex items-center gap-1 rounded-[8px] border border-[#E2E8F0] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#64748B] transition-colors hover:border-[#DC2626] hover:text-[#DC2626]">
              <Archive className="h-3.5 w-3.5" />Archive
            </button>
          )}
        </div>
        <p className="mt-2 text-[12px] text-[#64748B]">Messages only send when you press Send.</p>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-[14px] font-semibold"><StickyNote className="h-4 w-4 text-[#64748B]" />Notes ({active.notes.length})</p>
        <div className="space-y-2">
          {active.notes.map((n) => (
            <div key={n.id} className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <p className="text-[14px]">{n.text}</p>
              <p className="mt-1 text-[12px] text-[#94A3B8]">{n.date}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && noteText.trim()) { addResponseNote(active.id, noteText); setNoteText(''); } }}
            placeholder="Add a note…"
            className="flex-1 rounded-[9px] border border-[#E2E8F0] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#4F46E5]"
            aria-label="Add response note"
          />
          <button onClick={() => { if (noteText.trim()) { addResponseNote(active.id, noteText); setNoteText(''); } }}
            className="rounded-[9px] bg-[#0F172A] px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-[#1E293B]">Add Note</button>
        </div>
      </div>
    </div>
  );
}

export default function ResponsesPage() {
  const { responses, unreadResponseCount, markResponseRead, markAllResponsesRead } = useApp();
  const navigate = useNavigate();
  const [folder, setFolder] = useState<(typeof FOLDERS)[number]>('All');
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const inbox = useMemo(() => responses.filter((r) => !r.archived), [responses]);
  const filtered = useMemo(() => {
    if (folder === 'All') return inbox;
    if (folder === 'Archived') return responses.filter((r) => r.archived);
    return inbox.filter((r) => r.classification === folder);
  }, [inbox, responses, folder]);

  const active = responses.find((r) => r.id === openId) ?? filtered[0] ?? null;
  const drawerActive = responses.find((r) => r.id === drawerId) ?? null;

  const countFor = (f: (typeof FOLDERS)[number]) => {
    if (f === 'All') return inbox.length;
    if (f === 'Archived') return responses.filter((r) => r.archived).length;
    return inbox.filter((r) => r.classification === f).length;
  };
  const unreadFor = (f: (typeof FOLDERS)[number]) => {
    if (f === 'Archived') return 0;
    const pool = f === 'All' ? inbox : inbox.filter((r) => r.classification === f);
    return pool.filter((r) => !r.read).length;
  };

  const pick = (id: string) => {
    markResponseRead(id);
    if (window.matchMedia('(min-width: 1280px)').matches) {
      setOpenId(id);
    } else {
      setDrawerId(id);
    }
  };

  useEffect(() => {
    if (active && !responses.some((r) => r.id === active.id && (folder === 'Archived' ? r.archived : !r.archived))) {
      setOpenId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Recruiter Responses"
        subtitle="A smart inbox — every reply classified, with a suggested next step."
        actions={
          unreadResponseCount > 0 ? (
            <button onClick={markAllResponsesRead} className="inline-flex items-center gap-1.5 rounded-[9px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[14px] font-semibold transition-colors hover:border-[#4F46E5] hover:text-[#4F46E5]">
              Mark all read ({unreadResponseCount})
            </button>
          ) : undefined
        }
      />

      <div className="grid items-start gap-4 xl:grid-cols-[220px_minmax(0,1fr)_400px]">
        {/* LEFT: folders */}
        <Card className="flex gap-1 overflow-x-auto p-2 xl:flex-col">
          {FOLDERS.map((f) => {
            const selected = folder === f;
            return (
              <button
                key={f}
                onClick={() => setFolder(f)}
                aria-pressed={selected}
                className={cn('flex shrink-0 items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-left text-[14px] font-medium transition-colors',
                  selected ? 'bg-[#0F172A] font-semibold text-white' : 'text-[#475569] hover:bg-[#F8FAFC]')}
              >
                <Inbox className={cn('h-4 w-4 shrink-0', selected ? 'text-white' : 'text-[#94A3B8]')} />
                <span className="whitespace-nowrap">{f}</span>
                <span className={cn('ml-auto rounded-full px-1.5 py-0.5 text-[11px] font-bold', selected ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#64748B]')}>
                  {countFor(f)}
                </span>
                {unreadFor(f) > 0 && (
                  <span className="rounded-full bg-[#DC2626] px-1.5 py-0.5 text-[11px] font-bold text-white">{unreadFor(f)}</span>
                )}
              </button>
            );
          })}
        </Card>

        {/* CENTER: messages */}
        <div className="min-w-0 space-y-3">
          {loading ? (
            <><Skeleton className="h-[120px]" /><Skeleton className="h-[120px]" /></>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No recruiter responses yet"
              description={folder === 'All' ? 'When recruiters reply to your outreach, they will appear here classified automatically.' : `Nothing in “${folder}”.`}
              action={<button onClick={() => navigate('/app/outreach')} className="rounded-[9px] bg-[#4F46E5] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#3730A3]">View Outreach</button>}
            />
          ) : (
            filtered.map((r) => {
              const selected = active?.id === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => pick(r.id)}
                  className={cn('block w-full rounded-[14px] border bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.1)]',
                    selected ? 'border-[#4F46E5] shadow-[0_8px_24px_rgba(79,70,229,0.12)]' : 'border-[#E2E8F0]',
                    !r.read && 'border-l-4 border-l-[#4F46E5]')}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[13px] font-bold text-[#4F46E5]">{r.initials}</span>
                    <div className="min-w-0 flex-1">
                      <p className={cn('flex items-center gap-2 truncate text-[15px]', r.read ? 'font-medium' : 'font-bold')}>
                        {r.recruiterName}
                        {!r.read && <span className="h-2 w-2 shrink-0 rounded-full bg-[#4F46E5]" aria-label="Unread" />}
                      </p>
                      <p className={cn('truncate text-[13px]', r.read ? 'text-[#64748B]' : 'font-semibold text-[#0F172A]')}>{r.subject}</p>
                      <p className={cn('truncate text-[13px]', r.read ? 'text-[#64748B]' : 'font-medium text-[#334155]')}>{r.company}</p>
                    </div>
                    <span className="shrink-0 text-[12px] text-[#94A3B8]">{r.timestamp}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-[#475569]">“{r.preview}”</p>
                  <div className="mt-2.5"><StatusBadge status={r.classification} /></div>
                </button>
              );
            })
          )}
        </div>

        {/* RIGHT: intelligence panel */}
        <div className="hidden min-w-0 xl:block">
          <div className="sticky top-0">
            {active ? (
              <Card className="max-h-[calc(100vh-140px)] overflow-y-auto p-5">
                <ResponseDetail response={active} />
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-[15px] font-semibold">Select a message</p>
                <p className="mt-1 text-[14px] text-[#64748B]">AI classification and suggested replies appear here.</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Drawer open={!!drawerActive} onClose={() => setDrawerId(null)} title="Response detail" wide>
        {drawerActive && <ResponseDetail response={drawerActive} onClose={() => setDrawerId(null)} />}
      </Drawer>
    </div>
  );
}
