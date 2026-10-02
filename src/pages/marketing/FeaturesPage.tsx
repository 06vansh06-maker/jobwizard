import { motion } from 'motion/react';
import { Search, Sparkles, MousePointerClick, Send, BellRing, FileCheck, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { MarketingLayout, FinalCta } from '../../components/marketing';
import { useApp } from '../../store/AppContext';

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' } };

const GROUPS = [
  {
    eyebrow: 'Discover',
    title: 'Find the right roles without the noise',
    description: 'JobWizard continuously pulls fresh postings from multiple sources, dedupes them and filters out spam, scams and irrelevant roles.',
    bullets: ['Multi-source aggregation (LinkedIn, Indeed, Greenhouse, Lever)', 'Automatic dedupe and spam filtering', 'Location, salary and work-mode filters that actually stick'],
    icon: Search,
  },
  {
    eyebrow: 'Match',
    title: 'AI scoring grounded in your profile',
    description: 'Every job is compared against your skills, resume, experience and preferences — with a transparent 0–10 score and skill breakdown.',
    bullets: ['Transparent 0–10 match score on every role', 'Skill-by-skill match explanation', 'Preference-aware ranking (role, location, salary)'],
    icon: Sparkles,
  },
  {
    eyebrow: 'Apply',
    title: 'Apply in one click, track everything',
    description: 'Your profile auto-fills applications. Every submission lands in a single tracker with timelines and status updates.',
    bullets: ['One-click apply with saved profile', 'Application timeline per role', 'Daily limits so automation stays safe'],
    icon: MousePointerClick,
  },
  {
    eyebrow: 'Outreach',
    title: 'Reach recruiters, hear back faster',
    description: 'AI drafts personalized outreach per recruiter. You review, edit and send — then get alerted the moment someone replies.',
    bullets: ['Personalized drafts you can edit', 'Open, reply and interest tracking', 'AI-classified inbox with suggested replies'],
    icon: Send,
  },
];

export default function FeaturesPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const go = () => { login(); navigate('/app/dashboard'); };
  return (
    <MarketingLayout>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-16 sm:pt-20 lg:pt-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-[680px] text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#4F46E5]">Features</p>
            <h1 className="mt-3 text-[40px] font-extrabold leading-[1.05] tracking-tight sm:text-[56px]">Everything your job search needs. Nothing it doesn’t.</h1>
            <p className="mt-5 text-[17px] leading-relaxed text-[#64748B]">Four tightly integrated workflows — discovery, matching, applying and outreach — in one calm workspace.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button onClick={go} className="inline-flex items-center justify-center gap-2 rounded-[9px] bg-[#4F46E5] px-7 py-3.5 text-[16px] font-semibold text-white hover:bg-[#3730A3]">Get Started<ArrowRight className="h-4 w-4" /></button>
              <Link to="/how-it-works" className="inline-flex items-center justify-center rounded-[9px] border border-[#E2E8F0] px-7 py-3.5 text-[16px] font-semibold hover:bg-[#F8FAFC]">See How It Works</Link>
            </div>
          </motion.div>
        </div>
      </section>
      {GROUPS.map((g, idx) => (
        <section key={g.title} className={idx % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-white border-y border-[#E2E8F0]'}>
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-20">
            <motion.div {...fadeUp} transition={{ duration: 0.45 }}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#4F46E5]">{g.eyebrow}</p>
              <h2 className="mt-2 text-[30px] font-bold tracking-tight sm:text-[36px]">{g.title}</h2>
              <p className="mt-3 max-w-[520px] text-[16px] leading-relaxed text-[#64748B]">{g.description}</p>
              <ul className="mt-6 space-y-2.5">
                {g.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-[15px] text-[#334155]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4]"><FileCheck className="h-3 w-3 text-[#16A34A]" /></span>{b}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#EEF2FF] text-[#4F46E5]"><g.icon className="h-5 w-5" /></span>
                <div><p className="text-[15px] font-semibold">{g.eyebrow} workspace</p><p className="text-[13px] text-[#64748B]">Live inside your dashboard</p></div>
                {g.eyebrow === 'Outreach' && <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[12px] font-semibold text-[#16A34A]"><BellRing className="h-3.5 w-3.5" />2 replies</span>}
              </div>
              <div className="mt-5 space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className={`rounded-[12px] border p-4 ${i === 0 ? 'border-[#4F46E5] bg-[#EEF2FF]/40' : 'border-[#E2E8F0]'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="h-4 w-2/3 rounded bg-[#E2E8F0]" style={{ width: `${72 - i * 12}%` }} />
                      <span className="text-[13px] font-bold">{(9.4 - i * 0.4).toFixed(1)}<span className="font-medium text-[#64748B]">/10</span></span>
                    </div>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]"><div className="h-full rounded-full bg-[#16A34A]" style={{ width: `${94 - i * 5}%` }} /></div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      ))}
      <FinalCta />
    </MarketingLayout>
  );
}
