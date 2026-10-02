import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Check } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export default function LoginPage() {
  const { login, pushToast } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('vansh@example.com');
  const [password, setPassword] = useState('password123');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    pushToast({ title: 'Welcome back, Vansh', description: 'Signed in successfully', kind: 'success' });
    navigate('/app/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <div className="hidden flex-1 flex-col justify-between bg-[#0F172A] p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#4F46E5]"><Zap className="h-[18px] w-[18px] text-white" strokeWidth={2.5} /></span>
          <span className="text-[20px] font-bold">JobWizard</span>
        </Link>
        <div className="max-w-[440px]">
          <h1 className="text-[36px] font-bold leading-tight">Your job search, finally organized.</h1>
          <ul className="mt-8 space-y-4">
            {['AI-matched roles scored 0–10', 'One-click applications with tracking', 'Personalized recruiter outreach', 'Reply alerts the moment they land'].map((t) => (
              <li key={t} className="flex items-center gap-3 text-[15px] text-slate-300">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4F46E5]"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>{t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[13px] text-slate-500">© 2026 JobWizard • Trusted by 12,000+ job seekers</p>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <Link to="/" className="flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#4F46E5]"><Zap className="h-[18px] w-[18px] text-white" strokeWidth={2.5} /></span>
            <span className="text-[20px] font-bold">JobWizard</span>
          </Link>
          <h2 className="mt-8 text-[28px] font-bold tracking-tight lg:mt-0">Welcome back</h2>
          <p className="mt-1.5 text-[15px] text-[#64748B]">Log in to continue to your dashboard.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[14px] font-semibold">Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[9px] border border-[#E2E8F0] bg-white px-4 py-3 text-[15px] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15" />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-[14px] font-semibold">Password</label>
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[9px] border border-[#E2E8F0] bg-white px-4 py-3 text-[15px] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15" />
            </div>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#4F46E5] px-5 py-3.5 text-[15px] font-semibold text-white hover:bg-[#3730A3]">
              Log In<ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-6 text-center text-[14px] text-[#64748B]">
            Demo build — any credentials work. <Link to="/" className="font-semibold text-[#4F46E5]">Back to site</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
