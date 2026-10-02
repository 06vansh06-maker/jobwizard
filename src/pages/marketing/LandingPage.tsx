import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Search, Bell, Clock, Briefcase, Building2 } from 'lucide-react';
import CinematicHero from '../../components/cinematic-hero';
import { MarketingFooter, FinalCta } from '../../components/marketing';
import {
  BentoFeatures,
  WorkflowSection,
  WhyJobWizard,
  IntelligenceSection,
  FloatPill,
  fadeUp,
} from '../../components/landing-advanced';
import { useApp } from '../../store/AppContext';

export default function LandingPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const go = () => { login(); navigate('/app/dashboard'); };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased">
      {/* 1 — dark cinematic hero */}
      <CinematicHero />

      {/* sources strip */}
      <section className="border-b border-[#F1F5F9] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#94A3B8]">Aggregates opportunities from</span>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[15px] font-semibold text-[#94A3B8]">
            {['LinkedIn', 'Indeed', 'Greenhouse', 'Lever', 'Wellfound'].map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5"><Building2 className="h-4 w-4" />{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 2 — asymmetric bento features (light) */}
      <BentoFeatures />

      {/* 3 — workflow (white, centered) */}
      <WorkflowSection />

      {/* 4 — dramatic dark interactive story */}
      <WhyJobWizard />

      {/* 5 — dark premium intelligence */}
      <IntelligenceSection />

      {/* 6 — dashboard preview (light, asymmetric heading) */}
      <section className="bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-20 lg:pb-28 lg:pt-24">
          <div className="grid items-end gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <motion.div {...fadeUp} transition={{ duration: 0.45 }}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#4F46E5]">Product tour</p>
              <h2 className="mt-4 text-[40px] font-extrabold leading-[1.02] tracking-[-0.02em] sm:text-[52px]">
                Your entire search,
                <br />
                in one calm view.
              </h2>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.45, delay: 0.1 }} className="lg:pb-2">
              <p className="max-w-[380px] text-[16px] leading-relaxed text-[#64748B]">
                Recommended jobs, application timelines, outreach and reply alerts — side by side, always current.
              </p>
            </motion.div>
          </div>

          <div className="relative mt-12">
            <FloatPill icon={Search} className="absolute -top-5 left-8 z-10">
              24 Jobs Found
            </FloatPill>
            <motion.div {...fadeUp} transition={{ duration: 0.55 }} className="mx-auto max-w-6xl overflow-hidden rounded-[22px] border border-[#E2E8F0] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.1)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0]" /><span className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0]" /><span className="h-2.5 w-2.5 rounded-full bg-[#E2E8F0]" /></div>
                <div className="flex items-center gap-2 text-[13px] font-semibold">
                  {['Jobs', 'Applications', 'Outreach'].map((t, i) => (
                    <span key={t} className={`rounded-[8px] px-3 py-1.5 ${i === 0 ? 'bg-white text-[#4F46E5] shadow-sm ring-1 ring-[#E2E8F0]' : 'text-[#64748B]'}`}>{t}</span>
                  ))}
                </div>
                <span className="hidden h-8 w-8 items-center justify-center rounded-full bg-[#4F46E5] text-[13px] font-bold text-white sm:flex">V</span>
              </div>
              <div className="grid lg:grid-cols-5">
                <div className="border-b border-[#E2E8F0] p-6 lg:col-span-3 lg:border-b-0 lg:border-r">
                  <div className="flex items-center justify-between"><h3 className="text-[16px] font-semibold">Recommended jobs</h3><span className="text-[13px] font-semibold text-[#4F46E5]">View all</span></div>
                  <div className="mt-4 space-y-3">
                    {[
                      { title: 'AI Engineer', co: 'NeuralLabs', score: '9.5', pct: 95, tag: 'Excellent Match', active: true },
                      { title: 'Frontend Developer', co: 'TechNova', score: '9.2', pct: 92, tag: 'Excellent Match', active: false },
                      { title: 'Backend Developer', co: 'DevStack', score: '8.9', pct: 89, tag: 'Strong Match', active: false },
                    ].map((r) => (
                      <div key={r.title} className={`rounded-[12px] border p-4 ${r.active ? 'border-[#4F46E5] bg-[#EEF2FF]/50' : 'border-[#E2E8F0]'}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0"><p className="truncate text-[15px] font-semibold">{r.title} <span className="font-normal text-[#64748B]">• {r.co}</span></p>
                            <div className="mt-2 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-[#E2E8F0]"><div className="h-full rounded-full bg-[#16A34A]" style={{ width: `${r.pct}%` }} /></div>
                          </div>
                          <div className="shrink-0 text-right"><span className="text-[15px] font-bold">{r.score}</span><span className="text-[12px] text-[#64748B]">/10</span>
                            <div className="mt-1 rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-semibold text-[#16A34A]">{r.tag}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <h3 className="mt-6 text-[16px] font-semibold">Application status</h3>
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {[{ k: 'Applied', v: '14' }, { k: 'Interview', v: '5' }, { k: 'Offer', v: '2' }].map((a) => (
                      <div key={a.k} className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
                        <div className="text-[20px] font-bold">{a.v}</div><div className="text-[12px] font-semibold uppercase text-[#64748B]">{a.k}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#F8FAFC]/60 p-6 lg:col-span-2">
                  <div className="flex items-center justify-between"><h3 className="text-[16px] font-semibold">Recruiter outreach</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[12px] font-semibold text-[#16A34A]"><span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />2 new replies</span></div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[12px] border border-[#E2E8F0] bg-white p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF2FF] text-[13px] font-bold text-[#4F46E5]">SR</span>
                        <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-semibold">Sarah · CloudCore</p><p className="truncate text-[13px] text-[#64748B]">Loved your background — free for a chat Thursday?</p></div>
                        <span className="text-[12px] text-[#94A3B8]">2m</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 rounded-[9px] bg-[#F0FDF4] px-3 py-2 text-[13px] font-medium text-[#15803D]"><Bell className="h-3.5 w-3.5" />Response alert — reply suggested by AI</div>
                    </div>
                    <div className="rounded-[12px] border border-[#E2E8F0] bg-white p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECFEFF] text-[13px] font-bold text-[#0E7490]">DK</span>
                        <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-semibold">David · NeuralLabs</p><p className="truncate text-[13px] text-[#64748B]">Outreach opened • Follow-up scheduled</p></div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FF] px-2 py-1 text-[11px] font-semibold text-[#4F46E5]"><Clock className="h-3 w-3" />Opened</span>
                      </div>
                    </div>
                    <div className="rounded-[12px] border border-dashed border-[#CBD5E1] bg-white p-4">
                      <p className="flex items-center gap-2 text-[13px] font-medium text-[#475569]"><Briefcase className="h-4 w-4 text-[#4F46E5]" />3 applications auto-submitted this week</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="mt-8 text-center">
              <button onClick={go} className="inline-flex items-center gap-2 rounded-[9px] border border-[#E2E8F0] bg-white px-6 py-3 text-[15px] font-semibold hover:border-[#4F46E5] hover:text-[#4F46E5]">Open the live dashboard<ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </section>

      <FinalCta />
      <MarketingFooter />
    </div>
  );
}
