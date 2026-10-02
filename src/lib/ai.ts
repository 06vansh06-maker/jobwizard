import type { Job, UserProfile } from '../types';

/* ------------------------------------------------------------------ */
/* Shared AI-workflow helpers (deterministic demo logic over real state) */
/* ------------------------------------------------------------------ */

export const KNOWN_SKILLS = [
  'React', 'TypeScript', 'JavaScript', 'Python', 'FastAPI', 'Node.js',
  'PostgreSQL', 'AWS', 'Docker', 'REST APIs', 'Machine Learning', 'LLMs',
  'PyTorch', 'Django', 'MongoDB', 'SQL', 'CSS', 'HTML', 'Figma',
  'Kubernetes', 'CI/CD', 'Linux', 'MLOps', 'Go', 'Airflow', 'Snowflake',
  'TensorFlow', 'Redux', 'Tailwind',
];

const SKILL_ALIASES: Record<string, string> = {
  node: 'Node.js', 'node.js': 'Node.js', ts: 'TypeScript', js: 'JavaScript',
  postgres: 'PostgreSQL', k8s: 'Kubernetes', ml: 'Machine Learning',
  'rest': 'REST APIs', 'rest api': 'REST APIs', 'rest apis': 'REST APIs',
  tailwindcss: 'Tailwind',
};

export const KNOWN_LOCATIONS = [
  'Remote', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Gurgaon',
  'San Francisco, CA', 'Austin, TX', 'New York, NY', 'Seattle, WA',
];

export interface ParsedSearch {
  role: string;
  experience: 'Entry' | 'Mid' | 'Senior' | null;
  internship: boolean;
  fresher: boolean;
  location: string | null;
  remoteOnly: boolean;
  inrLpa: number | null;
  usdK: number | null;
  minScore: number | null;
  skills: string[];
}

/** Annual LPA equivalent for ₹ salaries; null for $-scale salaries. */
export function parseSalaryLPA(salary: string): number | null {
  const s = salary.toLowerCase();
  const nums = (salary.match(/[\d.]+/g) ?? []).map(Number);
  if (nums.length === 0) return null;
  if (s.includes('lpa')) return nums[0];
  if (s.includes('/ month') && s.includes('₹')) return (nums[0] * 12) / 100;
  if (s.includes('/ month') && s.includes('$')) return (nums[0] * 12) / 1000;
  if (s.includes('/ hour')) return null; // can't annualize without hours
  return null;
}

const STOPWORDS = new Set([
  'find', 'me', 'my', 'show', 'search', 'for', 'with', 'and', 'the', 'a', 'an',
  'jobs', 'job', 'roles', 'role', 'that', 'where', 'which', 'accept', 'to',
  'in', 'above', 'over', 'under', 'below', 'at', 'least', 'is', 'are', 'of',
  'any', 'all', 'please', 'looking', 'want', 'need', 'i', 'fresher', 'freshers',
]);

/** Interpret a natural-language job search into structured filters. */
export function parseJobSearchQuery(raw: string): ParsedSearch {
  const q = ` ${raw.toLowerCase().replace(/[.,!?]/g, ' ')} `;
  const has = (...words: string[]) => words.some((w) => q.includes(` ${w} `) || q.includes(` ${w}s `) || q.includes(w));

  // location
  let location: string | null = null;
  for (const loc of KNOWN_LOCATIONS) {
    if (loc === 'Remote') continue;
    if (q.includes(` ${loc.toLowerCase()} `) || q.includes(`in ${loc.toLowerCase()}`)) { location = loc; break; }
  }
  const remoteOnly = q.includes('remote');

  // experience
  const internship = q.includes('internship') || q.includes('internships') || /\bintern\b/.test(q);
  const fresher = q.includes('fresher') || q.includes('freshers') || q.includes('no experience') || q.includes('0-1') || q.includes('entry level');
  let experience: ParsedSearch['experience'] = null;
  if (internship || fresher || q.includes(' entry ')) experience = 'Entry';
  else if (q.includes('senior') || q.includes(' sr ') || q.includes('lead')) experience = 'Senior';

  // pay — ₹ LPA / ₹k monthly vs $k
  let inrLpa: number | null = null;
  let usdK: number | null = null;
  const inrLpaMatch = q.match(/₹\s*([\d.]+)\s*(lpa|l)\b/) || q.match(/([\d.]+)\s*lpa/);
  const inrKMatch = q.match(/₹\s*([\d.]+)\s*k\b/);
  const usdMatch = q.match(/\$\s*([\d.]+)\s*k\b/);
  if (inrLpaMatch) inrLpa = Number(inrLpaMatch[1]);
  else if (inrKMatch) inrLpa = (Number(inrKMatch[1]) * 12) / 100;
  if (usdMatch) usdK = Number(usdMatch[1]);

  // match score — "above 85%" / "85%+" / "8.5+"
  let minScore: number | null = null;
  const pctMatch = q.match(/(\d{2})\s*%/);
  if (pctMatch) {
    const pct = Number(pctMatch[1]);
    if (pct >= 70 && pct <= 100) minScore = Math.min(9.5, pct / 10);
  } else {
    const scoreMatch = q.match(/([789](?:\.\d)?)\s*\+/);
    if (scoreMatch) minScore = Number(scoreMatch[1]);
  }

  // skills
  const skills: string[] = [];
  for (const skill of KNOWN_SKILLS) {
    if (q.includes(` ${skill.toLowerCase()} `)) skills.push(skill);
  }
  for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
    if (q.includes(` ${alias} `) && !skills.includes(canonical)) skills.push(canonical);
  }

  // role = leftover meaningful words
  const stripPatterns = [
    /₹\s*[\d.]+\s*(lpa|l|k)?/g, /\$\s*[\d.]+\s*k?/g, /\d+\s*%/g, /[789](?:\.\d)?\+/g,
    /\b\d+\s*-\s*\d+\b/g, /\b\d+\s*lpa\b/g,
  ];
  let rest = ` ${raw.toLowerCase().replace(/[.,!?]/g, ' ')} `;
  for (const p of stripPatterns) rest = rest.replace(p, ' ');
  const stripWord = (t: string) =>
    STOPWORDS.has(t) ||
    ['internship', 'internships', 'intern', 'senior', 'remote', 'hybrid', 'onsite', 'entry', 'fresher', 'freshers', 'match', 'score', 'above'].includes(t) ||
    KNOWN_SKILLS.some((s) => s.toLowerCase() === t) ||
    Object.keys(SKILL_ALIASES).includes(t) ||
    KNOWN_LOCATIONS.some((l) => l.toLowerCase().split(/[ ,]+/).includes(t));
  const tokens = rest.split(/[\s,]+/).filter((t) => t && !stripWord(t) && t.length > 1);
  const role = tokens.filter((t) => !['developer', 'engineer', 'designer', 'analyst'].includes(t)).join(' ')
    || tokens.join(' ');

  return { role, experience, internship, fresher, location, remoteOnly, inrLpa, usdK, minScore, skills };
}

/* ------------------------- readiness & resume ------------------------- */

export interface ReadinessCheck {
  key: 'resume' | 'profile' | 'skills' | 'location' | 'preferences' | 'github';
  label: string;
  detail: string;
  done: boolean;
  focus: string;
}

export function readinessScore(
  job: Job,
  profile: UserProfile,
  completionPct: number,
): { score: number; checks: ReadinessCheck[] } {
  const overlap = job.skills.filter((s) => profile.skills.some((p) => p.toLowerCase() === s.toLowerCase()));
  const needed = Math.min(2, job.skills.length);
  const locOk = job.workMode === 'Remote' || profile.preferredLocations.some((l) => job.location.includes(l) || l.includes(job.location));
  const prefOk = job.type === profile.jobType || (profile.workMode || '').toLowerCase().includes(job.workMode.toLowerCase());
  const checks: ReadinessCheck[] = [
    { key: 'resume', label: 'Resume uploaded', detail: profile.resumeName || 'No resume on file', done: !!profile.resumeName, focus: 'resume' },
    { key: 'profile', label: 'Profile complete', detail: `${completionPct}% complete`, done: completionPct >= 80, focus: 'professional' },
    { key: 'skills', label: 'Required skills detected', detail: `${overlap.length}/${job.skills.length} required skills found`, done: overlap.length >= needed, focus: 'skills' },
    { key: 'location', label: 'Location matches', detail: locOk ? job.location : 'Outside preferred areas', done: locOk, focus: 'preferences' },
    { key: 'preferences', label: 'Job preferences match', detail: `${job.type} · ${job.workMode}`, done: prefOk, focus: 'preferences' },
    { key: 'github', label: 'GitHub profile linked', detail: 'Demo check — link a profile to strengthen applications', done: false, focus: 'professional' },
  ];
  const weights = [20, 25, 25, 12, 10, 8];
  const score = Math.round(checks.reduce((a, c, i) => a + (c.done ? weights[i] : 0), 0));
  return { score, checks };
}

export interface ResumeMatchResult {
  matched: string[];
  partial: string[];
  gaps: string[];
  evidence: Record<string, string>;
  bars: Array<{ label: string; pct: number; note: string }>;
  overall: number;
}

export function resumeMatch(job: Job, profile: UserProfile): ResumeMatchResult {
  const expText = `${profile.experienceDetails || ''} ${profile.headline || ''} ${profile.currentRole || ''}`;
  const sentences = expText.split(/[.\n•-]+/).map((s) => s.trim()).filter((s) => s.length > 12);
  const lower = (s: string) => s.toLowerCase();
  const matched = job.skills.filter((s) => profile.skills.some((p) => lower(p) === lower(s)));
  const partial = job.skills.filter(
    (s) => !matched.includes(s) && sentences.some((sent) => lower(sent).includes(lower(s))),
  );
  const gaps = job.skills.filter((s) => !matched.includes(s) && !partial.includes(s));
  const evidence: Record<string, string> = {};
  for (const s of [...matched, ...partial]) {
    const hit = sentences.find((sent) => lower(sent).includes(lower(s)));
    evidence[s] = hit ? `“${hit.length > 110 ? `${hit.slice(0, 110)}…` : hit}”` : `Listed in the Skills section of ${profile.resumeName || 'your resume'}.`;
  }
  const levels = ['Entry', 'Mid', 'Senior', 'Lead'];
  const gap = Math.abs(levels.indexOf(job.experience) - levels.indexOf(profile.experienceLevel));
  const words = expText.trim().split(/\s+/).filter(Boolean).length;
  const bars = [
    { label: 'Skills', pct: Math.round((matched.length / Math.max(1, job.skills.length)) * 100), note: `${matched.length}/${job.skills.length} matched` },
    { label: 'Experience', pct: gap <= 0 ? 92 : gap === 1 ? 76 : 55, note: `${job.experience} role · you: ${profile.experienceLevel}` },
    { label: 'Projects', pct: Math.min(100, Math.round((words / 120) * 100)), note: `${words} words of experience detail` },
    { label: 'Education', pct: profile.education ? 85 : 35, note: profile.education || 'No education listed' },
    { label: 'Preferences', pct: job.workMode === 'Remote' ? 100 : 70, note: job.workMode },
  ];
  const overall = Math.round(bars.reduce((a, b) => a + b.pct, 0) / bars.length);
  return { matched, partial, gaps, evidence, bars, overall };
}

/* ------------------------------ generators ------------------------------ */

export function generateCoverDraft(job: Job, profile: UserProfile, variant: number): string {
  const first = (profile.firstName || 'Vansh');
  const top = job.skills.slice(0, 3).join(', ');
  const variants = [
    `Hi ${job.company} team,\n\nI'm ${first}, a ${profile.experienceYears || ''} ${profile.currentRole || 'engineer'} working with ${top}. The ${job.title} role stood out because it pairs product ownership with the exact stack I use daily.\n\nRecent work most relevant here: ${profile.experienceDetails ? profile.experienceDetails.split('.')[0] : `shipping production features with ${top}`}. I'd love to bring that momentum to ${job.company}.\n\nBest,\n${first}`,
    `Hello,\n\nApplying for ${job.title} at ${job.company}: my background in ${top} maps directly to what you're hiring for. ${profile.experienceDetails ? profile.experienceDetails.split('.')[0] : 'I ship reliable, well-tested features end to end'}. Happy to walk through specifics on a call.\n\nThanks,\n${first}`,
    `Hi there,\n\n${job.company}'s ${job.title} posting reads like my last year of work: ${top}, real users, measurable outcomes. ${profile.experienceDetails ? profile.experienceDetails.split('.')[0] : 'I care about craft, speed, and reliability'}. Would enjoy discussing the role.\n\n— ${first}`,
  ];
  return variants[variant % variants.length];
}

export function roleQuestion(job: Job): string {
  const t = `${job.title} ${job.skills.join(' ')}`.toLowerCase();
  if (/front|react|css|design/.test(t)) return 'Why are you interested in this position?';
  if (/ai|ml|llm|machine/.test(t)) return 'Describe a recent AI/ML project and the impact it had.';
  if (/backend|python|api|devops/.test(t)) return 'Describe a backend system you built or scaled, and what you learned.';
  return 'Why are you a strong fit for this role?';
}

export function generateQuestionDraft(job: Job, profile: UserProfile, variant: number): string {
  const top = job.skills.slice(0, 3).join(', ');
  const variants = [
    `I'm drawn to this ${job.title} role because ${job.company} works on problems I've already solved with ${top}. Recently, ${profile.experienceDetails ? profile.experienceDetails.split('.')[0].toLowerCase() : 'I shipped end-to-end features end to end'}. That experience maps directly to this team.`,
    `What excites me about ${job.company} is the combination of ownership and craft in this ${job.title} role. My work with ${top} has prepared me to contribute from week one, and I'm eager to go deeper on ${job.skills[0] ?? 'the core stack'}.`,
  ];
  return variants[variant % variants.length];
}

export function generateFollowup(recruiterName: string, company: string, role: string, firstName: string, variant: number): { subject: string; body: string } {
  const first = recruiterName.split(' ')[0];
  const subjects = [
    `Following up — ${role} opportunity`,
    `Quick bump — ${role} at ${company}`,
    `Still interested in ${role}`,
  ];
  const bodies = [
    `Hi ${first},\n\nI wanted to follow up on my previous message regarding the ${role} opportunity.\n\nI'm still very interested in the role and would be happy to share any additional information — recent work, references, or availability for a quick call.\n\nBest,\n${firstName}`,
    `Hi ${first},\n\nCircling back on the ${role} role at ${company} — is the position still open? I'd welcome 15 minutes to discuss how my background fits what you're hiring for.\n\nThanks,\n${firstName}`,
  ];
  return { subject: subjects[variant % subjects.length], body: bodies[variant % bodies.length] };
}

export function whyApplyContext(job: Job, overlap: string[], gaps: string[]): string {
  if (overlap.length === 0) {
    return `This role stretches beyond your current stack, which makes it a learning bet rather than a fit bet. The ${job.workMode.toLowerCase()} setup and ${job.type.toLowerCase()} format match your preferences, but expect a harder screen on ${gaps.slice(0, 2).join(' and ') || 'the core stack'}.`;
  }
  return `You match most of the core technical requirements${overlap.length ? ` (${overlap.slice(0, 3).join(', ')})` : ''}.${gaps.length > 0 ? ` The missing ${gaps.slice(0, 2).join(' and ')} experience may be a gap, but ` : ' '}the role's ${job.experience.toLowerCase()}-level scope aligns well with your current profile.`;
}
