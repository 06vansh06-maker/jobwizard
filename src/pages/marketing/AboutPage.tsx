import { motion } from 'motion/react';
import { ShieldCheck, Target, Clock, HeartHandshake, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MarketingLayout, FinalCta } from '../../components/marketing';
import { useApp } from '../../store/AppContext';

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' } };

export default function AboutPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  return (
    <MarketingLayout>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-16 sm:pt-20 lg:pt-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-[680px] text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#4F46E5]">About</p>
            <h1 className="mt-3 text-[40px] font-extrabold leading-[1.05] tracking-tight sm:text-[56px]">Job hunting is broken. We’re fixing the repetitive parts.</h1>
            <p className="mt-5 text-[17px] leading-relaxed text-[#64748B]">
              JobWizard started with a simple observation: talented people miss great roles because searching, filtering,
              applying and following up is exhausting. AI should absorb that busywork — while humans stay in control of every decision.
            </p>
          </motion.div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-3">
            {[
              { icon: Target, title: 'Clarity over hype', desc: 'No black-box magic. Every score and suggestion comes with a reason you can inspect.' },
              { icon: Clock, title: 'Respect your time', desc: 'If a task is repetitive — discovery, data entry, follow-ups — JobWizard should do it.' },
              { icon: ShieldCheck, title: 'Trust by default', desc: 'Nothing is sent without your review. Your data stays private and exportable.' },
            ].map((v, i) => (
              <motion.div key={v.title} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.08 }} className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-white text-[#4F46E5] ring-1 ring-[#E2E8F0]"><v.icon className="h-5 w-5" /></span>
                <h2 className="mt-4 text-[18px] font-semibold">{v.title}</h2>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[#64748B]">{v.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="mx-auto mt-12 grid max-w-5xl gap-6 rounded-[22px] border border-[#E2E8F0] bg-white p-8 lg:grid-cols-2 lg:p-12">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#4F46E5]">Our principles</p>
              <h2 className="mt-2 text-[28px] font-bold tracking-tight">AI in the workflow, not on top of it.</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[#64748B]">
                We deliberately avoid gimmicky AI. Matching, drafting and classifying are embedded where they save time —
                and always leave the final call to you. The result feels like a calm, competent assistant rather than a slot machine.
              </p>
              <button onClick={() => { login(); navigate('/app/dashboard'); }} className="mt-6 inline-flex items-center gap-2 rounded-[9px] bg-[#4F46E5] px-6 py-3 text-[15px] font-semibold text-white hover:bg-[#3730A3]">
                Get Started<ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                ['1. AI finds opportunities.', 'Continuous discovery across trusted job sources.'],
                ['2. AI understands your profile.', 'Resume, skills, preferences and history in one place.'],
                ['3. AI scores relevance.', 'Transparent 0–10 matches with reasons.'],
                ['4. You remain in control.', 'Review, edit, approve — nothing auto-sends.'],
              ].map(([t, d]) => (
                <div key={t} className="flex gap-3 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <HeartHandshake className="h-5 w-5 shrink-0 text-[#06B6D4]" />
                  <div><p className="text-[15px] font-semibold">{t}</p><p className="text-[14px] text-[#64748B]">{d}</p></div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="mx-auto mt-12 max-w-5xl rounded-[16px] border border-[#E2E8F0] bg-white p-6 text-center sm:p-8">
            <p className="text-[15px] text-[#475569]">Questions? Contact us at</p>
            <p className="mt-1 text-[18px] font-semibold text-[#4F46E5]">hello@jobwizard.ai</p>
          </div>
        </div>
      </section>
      <FinalCta />
    </MarketingLayout>
  );
}
