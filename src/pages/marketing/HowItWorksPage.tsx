import { motion } from 'motion/react';
import { UserCheck, ScanSearch, MousePointerClick, MessagesSquare, ArrowRight, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { MarketingLayout, FinalCta } from '../../components/marketing';
import { useApp } from '../../store/AppContext';

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' } };

const STEPS = [
  { n: '01', icon: UserCheck, title: 'Tell JobWizard what you want', desc: 'Add target roles, skills, locations, salary and work-mode preferences. Upload your resume once — JobWizard parses skills and experience automatically.', bullets: ['Resume parsing in seconds', 'Preferred roles + locations', 'Salary and remote preferences'] },
  { n: '02', icon: ScanSearch, title: 'AI finds and ranks opportunities', desc: 'New postings are discovered daily, deduped, then scored 0–10 against your profile with a transparent skill breakdown.', bullets: ['Daily fresh discovery', 'Transparent 0–10 scoring', 'Why-this-matches explanations'] },
  { n: '03', icon: MousePointerClick, title: 'Apply to suitable jobs', desc: 'Review top matches and apply in one click. Every application is tracked with a timeline — applied, viewed, interview, decision.', bullets: ['One-click apply', 'Per-application timeline', 'Safe daily limits'] },
  { n: '04', icon: MessagesSquare, title: 'Reach recruiters and track responses', desc: 'AI drafts tailored outreach per recruiter. You edit and send. Replies land in a classified inbox with suggested follow-ups.', bullets: ['Editable AI drafts', 'Open + reply tracking', 'Interested / needs-action inbox'] },
];

export default function HowItWorksPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  return (
    <MarketingLayout>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-14 pt-16 sm:pt-20 lg:pt-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-[680px] text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#4F46E5]">How it works</p>
            <h1 className="mt-3 text-[40px] font-extrabold leading-[1.05] tracking-tight sm:text-[56px]">From setup to recruiter reply in four steps.</h1>
            <p className="mt-5 text-[17px] leading-relaxed text-[#64748B]">Set preferences once. JobWizard handles the repetitive searching, scoring, applying and following up.</p>
          </motion.div>
          <div className="relative mx-auto mt-14 max-w-5xl">
            <div className="absolute bottom-[40px] left-[24px] top-[24px] w-px bg-[#E2E8F0] sm:left-1/2" aria-hidden="true" />
            <div className="space-y-6">
              {STEPS.map((s, i) => (
                <motion.div key={s.n} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.05 }}
                  className={`relative flex gap-5 rounded-[20px] border border-[#E2E8F0] bg-white p-6 sm:items-start sm:gap-8 sm:p-8 ${i % 2 === 1 ? 'sm:flex-row-reverse sm:text-right' : ''}`}>
                  <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#4F46E5] text-[15px] font-bold text-white">{s.n}</span>
                  <div className="min-w-0 flex-1">
                    <div className={`flex items-center gap-2 ${i % 2 === 1 ? 'sm:justify-end' : ''}`}>
                      <s.icon className="h-5 w-5 text-[#06B6D4]" />
                      <h2 className="text-[20px] font-semibold">{s.title}</h2>
                    </div>
                    <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-[#64748B]">{s.desc}</p>
                    <ul className={`mt-4 flex flex-wrap gap-2 ${i % 2 === 1 ? 'sm:justify-end' : ''}`}>
                      {s.bullets.map((b) => (
                        <li key={b} className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-[13px] font-medium text-[#334155]">
                          <Check className="h-3.5 w-3.5 text-[#16A34A]" strokeWidth={3} />{b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <button onClick={() => { login(); navigate('/app/dashboard'); }} className="inline-flex items-center gap-2 rounded-[9px] bg-[#4F46E5] px-7 py-3.5 text-[16px] font-semibold text-white hover:bg-[#3730A3]">
                Try it now<ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-3 text-[14px] text-[#64748B]">Free to start • Or <Link to="/features" className="font-semibold text-[#4F46E5]">explore features</Link></p>
            </div>
          </div>
        </div>
      </section>
      <FinalCta />
    </MarketingLayout>
  );
}
