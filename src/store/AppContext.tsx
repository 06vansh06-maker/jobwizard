import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type {
  Application, ApplicationStatus, AutomationService, AutomationSettings,
  ActivityItem, AppNotification, EmailDraft, FollowUp, Toast, UserProfile,
} from '../types';
import {
  DEFAULT_PROFILE, DEFAULT_SETTINGS, INITIAL_APPLICATIONS, INITIAL_ACTIVITY,
  INITIAL_AUTOMATION, INITIAL_NOTIFICATIONS, JOBS, RECRUITERS, RESPONSES,
} from '../data/mock';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* noop */ }
}

function todayStr() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

let seq = 100;
const nid = (p: string) => `${p}-${Date.now()}-${seq++}`;

interface AppState {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  /* profile */
  profile: UserProfile;
  updateProfile: (patch: Partial<UserProfile>) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  setResume: (name: string, size: string) => void;
  clearResume: () => void;
  profileCompletion: { pct: number; missing: string[] };
  /* jobs + saved + queue + compare */
  savedJobIds: string[];
  toggleSaveJob: (jobId: string) => void;
  queueJobIds: string[];
  toggleQueueJob: (jobId: string) => void;
  removeFromQueue: (jobId: string) => void;
  compareIds: string[];
  toggleCompareJob: (jobId: string) => void;
  clearCompare: () => void;
  compareOpen: boolean;
  setCompareOpen: (open: boolean) => void;
  /* applications */
  applications: Application[];
  appliedJobIds: Set<string>;
  applyToJob: (jobId: string) => boolean;
  updateApplicationStatus: (appId: string, status: ApplicationStatus) => void;
  withdrawApplication: (appId: string) => void;
  addApplicationNote: (appId: string, text: string) => void;
  /* outreach */
  recruiters: typeof RECRUITERS;
  emailsSent: number;
  sendOutreach: (recruiterId: string, subject: string, body: string) => void;
  saveDraft: (recruiterId: string, subject: string, body: string) => void;
  getDraft: (recruiterId: string) => EmailDraft | undefined;
  followUps: Record<string, FollowUp>;
  scheduleFollowUp: (recruiterId: string, data: { scheduledFor: string; subject: string; body: string }) => void;
  sendFollowUp: (recruiterId: string, subject: string, body: string) => void;
  dismissFollowUp: (recruiterId: string) => void;
  /* responses */
  responses: typeof RESPONSES;
  unreadResponseCount: number;
  markResponseRead: (id: string) => void;
  markAllResponsesRead: () => void;
  archiveResponse: (id: string) => void;
  restoreResponse: (id: string) => void;
  addResponseNote: (id: string, text: string) => void;
  sendReply: (id: string, text: string) => void;
  /* notifications + activity */
  notifications: AppNotification[];
  unreadNotifications: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  notify: (n: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
  activity: ActivityItem[];
  /* settings + automation */
  settings: AutomationSettings;
  updateSettings: (patch: Partial<AutomationSettings>) => void;
  automation: AutomationService[];
  toggleAutomation: (id: string) => void;
  /* feedback */
  toasts: Toast[];
  pushToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  confirmState: { title: string; description: string; confirmLabel?: string; onConfirm: () => void } | null;
  askConfirm: (c: { title: string; description: string; confirmLabel?: string; onConfirm: () => void }) => void;
  closeConfirm: () => void;
  /* command palette */
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
}

const Ctx = createContext<AppState | null>(null);

let toastSeq = 1;

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try { return localStorage.getItem('jw_auth') === '1'; } catch { return false; }
  });
  const [profile, setProfile] = useState<UserProfile>(() => load('jw_profile', DEFAULT_PROFILE));
  const [applications, setApplications] = useState<Application[]>(() => load('jw_apps', INITIAL_APPLICATIONS));
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => load('jw_saved', ['job-4']));
  const [queueJobIds, setQueueJobIds] = useState<string[]>(() => load('jw_queue', []));
  const [compareIds, setCompareIds] = useState<string[]>(() => load('jw_compare', []));
  const [compareOpen, setCompareOpen] = useState(false);
  const [followUps, setFollowUps] = useState<Record<string, FollowUp>>(() => load('jw_followups', {}));
  const [recruiters, setRecruiters] = useState(() => load('jw_recruiters', RECRUITERS));
  const [emailsSent, setEmailsSent] = useState<number>(() => load('jw_emails_sent', 22));
  const [drafts, setDrafts] = useState<Record<string, EmailDraft>>(() => load('jw_drafts', {}));
  const [responses, setResponses] = useState(() => load('jw_responses', RESPONSES));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => load('jw_notifications', INITIAL_NOTIFICATIONS));
  const [activity, setActivity] = useState<ActivityItem[]>(() => load('jw_activity', INITIAL_ACTIVITY));
  const [settings, setSettings] = useState<AutomationSettings>(() => load('jw_settings', DEFAULT_SETTINGS));
  const [automation, setAutomation] = useState<AutomationService[]>(() => load('jw_automation', INITIAL_AUTOMATION));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<AppState['confirmState']>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  /* ---------- feedback ---------- */
  const pushToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = `toast-${toastSeq++}`;
    setToasts((prev) => [...prev.slice(-2), { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const pushNotification = useCallback((n: Omit<AppNotification, 'id' | 'time' | 'read'>) => {
    setNotifications((prev) => {
      const out = [{ ...n, id: nid('notif'), time: 'Just now', read: false }, ...prev].slice(0, 30);
      save('jw_notifications', out);
      return out;
    });
  }, []);

  const addActivity = useCallback((a: Omit<ActivityItem, 'id' | 'time'>) => {
    setActivity((prev) => {
      const out = [{ ...a, id: nid('act'), time: 'Just now' }, ...prev].slice(0, 30);
      save('jw_activity', out);
      return out;
    });
  }, []);

  /* ---------- auth ---------- */
  const login = useCallback(() => {
    setIsAuthenticated(true);
    try { localStorage.setItem('jw_auth', '1'); } catch { /* noop */ }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try { localStorage.removeItem('jw_auth'); } catch { /* noop */ }
  }, []);

  /* ---------- profile ---------- */
  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      save('jw_profile', next);
      return next;
    });
  }, []);

  const addSkill = useCallback((skill: string) => {
    const s = skill.trim();
    if (!s) return;
    setProfile((prev) => {
      if (prev.skills.some((x) => x.toLowerCase() === s.toLowerCase())) return prev;
      const next = { ...prev, skills: [...prev.skills, s] };
      save('jw_profile', next);
      return next;
    });
  }, []);

  const removeSkill = useCallback((skill: string) => {
    setProfile((prev) => {
      const next = { ...prev, skills: prev.skills.filter((x) => x !== skill) };
      save('jw_profile', next);
      return next;
    });
  }, []);

  const setResume = useCallback((name: string, size: string) => {
    setProfile((prev) => {
      const next = { ...prev, resumeName: name, resumeSize: size, resumeUpdated: todayStr() };
      save('jw_profile', next);
      return next;
    });
  }, []);

  const clearResume = useCallback(() => {
    setProfile((prev) => {
      const next = { ...prev, resumeName: '', resumeSize: '', resumeUpdated: '' };
      save('jw_profile', next);
      return next;
    });
  }, []);

  const profileCompletion = useMemo(() => {
    const checks: Array<[boolean, string]> = [
      [!!(profile.name && profile.email && profile.phone && profile.location), 'Complete personal details'],
      [!!profile.headline, 'Add a professional headline'],
      [!!(profile.experienceYears && profile.currentRole), 'Add experience details'],
      [(profile.experienceDetails || '').trim().length >= 40, 'Describe a recent project or achievement'],
      [profile.skills.length >= 8, `Add ${Math.max(0, 8 - profile.skills.length)} more skill${8 - profile.skills.length === 1 ? '' : 's'}`],
      [profile.preferredRoles.length >= 2, 'Add a preferred role'],
      [profile.preferredLocations.length >= 2, 'Add a preferred location'],
      [!!(profile.salaryRange && profile.workMode && profile.jobType), 'Set salary and work preferences'],
      [!!profile.resumeName, 'Upload your resume'],
    ];
    const done = checks.filter(([ok]) => ok).length;
    return { pct: Math.round((done / checks.length) * 100), missing: checks.filter(([ok]) => !ok).map(([, label]) => label) };
  }, [profile]);

  /* ---------- saved jobs ---------- */
  const toggleSaveJob = useCallback((jobId: string) => {
    const job = JOBS.find((j) => j.id === jobId);
    setSavedJobIds((prev) => {
      const saved = prev.includes(jobId);
      const out = saved ? prev.filter((id) => id !== jobId) : [...prev, jobId];
      save('jw_saved', out);
      return out;
    });
    const isSaving = !savedJobIds.includes(jobId);
    if (job) {
      if (isSaving) {
        pushToast({ title: 'Job saved', description: `${job.title} at ${job.company}`, kind: 'success' });
        addActivity({ text: `Saved ${job.title}`, detail: `${job.company} · ${job.matchScore.toFixed(1)} match`, kind: 'save' });
      } else {
        pushToast({ title: 'Job removed from saved jobs', description: `${job.title} at ${job.company}`, kind: 'info' });
      }
    }
  }, [savedJobIds, pushToast, addActivity]);

  /* ---------- application queue + compare ---------- */
  const toggleQueueJob = useCallback((jobId: string) => {
    const job = JOBS.find((j) => j.id === jobId);
    setQueueJobIds((prev) => {
      const queued = prev.includes(jobId);
      const out = queued ? prev.filter((id) => id !== jobId) : [...prev, jobId];
      save('jw_queue', out);
      return out;
    });
    const isAdding = !queueJobIds.includes(jobId);
    if (job) {
      if (isAdding) {
        pushToast({ title: 'Added to application queue', description: `${job.title} at ${job.company}`, kind: 'success' });
        addActivity({ text: 'Added to application queue', detail: `${job.title} at ${job.company}`, kind: 'system' });
      } else {
        pushToast({ title: 'Removed from queue', description: `${job.title} at ${job.company}`, kind: 'info' });
      }
    }
  }, [queueJobIds, pushToast, addActivity]);

  const removeFromQueue = useCallback((jobId: string) => {
    setQueueJobIds((prev) => {
      if (!prev.includes(jobId)) return prev;
      const out = prev.filter((id) => id !== jobId);
      save('jw_queue', out);
      return out;
    });
  }, []);

  const toggleCompareJob = useCallback((jobId: string) => {
    const job = JOBS.find((j) => j.id === jobId);
    if (compareIds.includes(jobId)) {
      const out = compareIds.filter((id) => id !== jobId);
      setCompareIds(out);
      save('jw_compare', out);
      return;
    }
    if (compareIds.length >= 3) {
      pushToast({ title: 'Compare up to 3 jobs', description: 'Remove one to add another.', kind: 'error' });
      return;
    }
    const out = [...compareIds, jobId];
    setCompareIds(out);
    save('jw_compare', out);
    if (job) pushToast({ title: 'Added to compare', description: `${job.title} (${out.length}/3)`, kind: 'info' });
  }, [compareIds, pushToast]);

  const clearCompare = useCallback(() => {
    setCompareIds([]);
    save('jw_compare', []);
  }, []);

  /* ---------- applications ---------- */
  const applyToJob = useCallback((jobId: string): boolean => {
    const job = JOBS.find((j) => j.id === jobId);
    if (!job) return false;
    if (applications.some((a) => a.jobId === jobId && a.status !== 'Withdrawn')) {
      pushToast({ title: 'Already applied', description: `${job.title} at ${job.company}`, kind: 'info' });
      return false;
    }
    const limit = settings.dailyApplicationLimit;
    const todayCount = applications.filter((a) => a.appliedDate === todayStr()).length;
    if (todayCount >= limit) {
      pushToast({ title: 'Daily application limit reached', description: `Limit is ${limit} per day — raise it in Automation.`, kind: 'error' });
      return false;
    }
    const app: Application = {
      id: nid('app'),
      jobId,
      title: job.title,
      company: job.company,
      location: job.location,
      matchScore: job.matchScore,
      status: 'Applied',
      appliedDate: todayStr(),
      resumeUsed: profile.resumeName || 'Vansh_Resume_2026.pdf',
      timeline: [
        { label: 'Application created', date: 'Just now', done: true },
        { label: 'Application submitted', date: 'Just now', done: true, current: true },
      ],
      notes: [],
    };
    setApplications((prev) => {
      const out = [app, ...prev];
      save('jw_apps', out);
      return out;
    });
    setAutomation((prev) => {
      const out = prev.map((s) => (s.id === 'applications' ? { ...s, usage: Math.min(s.limit, s.usage + 1), lastRun: 'Just now' } : s));
      save('jw_automation', out);
      return out;
    });
    setQueueJobIds((prev) => {
      if (!prev.includes(jobId)) return prev;
      const out = prev.filter((id) => id !== jobId);
      save('jw_queue', out);
      return out;
    });
    addActivity({ text: `Applied to ${job.title}`, detail: `${job.company} · ${job.matchScore.toFixed(1)} match`, kind: 'apply' });
    pushNotification({ title: 'Application submitted successfully', body: `${job.title} at ${job.company} — track it in Applications.`, link: '/app/applications', kind: 'application' });
    pushToast({ title: 'Application submitted successfully', description: `${job.title} at ${job.company}`, kind: 'success' });
    return true;
  }, [applications, settings.dailyApplicationLimit, profile.resumeName, pushToast, addActivity, pushNotification]);

  const statusTimelineLabel: Record<ApplicationStatus, string> = {
    Applied: 'Application submitted',
    'Under Review': 'Application viewed',
    Interview: 'Interview scheduled',
    Offer: 'Offer received',
    Rejected: 'Decision: rejected',
    Withdrawn: 'Application withdrawn',
  };

  const updateApplicationStatus = useCallback((appId: string, status: ApplicationStatus) => {
    setApplications((prev) => {
      const out = prev.map((a) => {
        if (a.id !== appId) return a;
        const timeline = [
          ...a.timeline.map((t) => ({ ...t, current: false })),
          { label: statusTimelineLabel[status], date: 'Just now', done: true, current: true },
        ];
        return { ...a, status, timeline };
      });
      save('jw_apps', out);
      return out;
    });
    const app = applications.find((a) => a.id === appId);
    if (app) {
      addActivity({ text: `Status → ${status}`, detail: `${app.title} at ${app.company}`, kind: 'apply' });
      if (status === 'Interview' || status === 'Offer') {
        pushNotification({ title: status === 'Interview' ? 'Interview scheduled' : 'Offer received', body: `${app.title} at ${app.company}`, link: '/app/applications', kind: 'application' });
      }
      pushToast({ title: `Status updated to ${status}`, description: `${app.title} at ${app.company}`, kind: 'success' });
    }
  }, [applications, addActivity, pushNotification, pushToast]);

  const withdrawApplication = useCallback((appId: string) => {
    const app = applications.find((a) => a.id === appId);
    setApplications((prev) => {
      const out = prev.map((a) => (a.id === appId ? {
        ...a,
        status: 'Withdrawn' as ApplicationStatus,
        timeline: [...a.timeline.map((t) => ({ ...t, current: false })), { label: 'Application withdrawn', date: 'Just now', done: true }],
      } : a));
      save('jw_apps', out);
      return out;
    });
    if (app) addActivity({ text: `Withdrew application`, detail: `${app.title} at ${app.company}`, kind: 'apply' });
    pushToast({ title: 'Application withdrawn', kind: 'info' });
  }, [applications, addActivity, pushToast]);

  const addApplicationNote = useCallback((appId: string, text: string) => {
    const t = text.trim();
    if (!t) return;
    setApplications((prev) => {
      const out = prev.map((a) => (a.id === appId ? { ...a, notes: [...a.notes, { id: nid('note'), text: t, date: 'Just now' }] } : a));
      save('jw_apps', out);
      return out;
    });
    pushToast({ title: 'Note added', kind: 'success' });
  }, [pushToast]);

  /* ---------- outreach ---------- */
  const sendOutreach = useCallback((recruiterId: string, subject: string, body: string) => {
    const r = recruiters.find((x) => x.id === recruiterId);
    setRecruiters((prev) => {
      const out = prev.map((x) => (x.id === recruiterId ? { ...x, status: 'Sent' as const, date: todayStr() } : x));
      save('jw_recruiters', out);
      return out;
    });
    setEmailsSent((prev) => {
      const out = prev + 1;
      save('jw_emails_sent', out);
      return out;
    });
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[recruiterId];
      save('jw_drafts', next);
      return next;
    });
    setFollowUps((prev) => {
      if (prev[recruiterId]) return prev;
      const out = { ...prev, [recruiterId]: { status: 'suggested' as const, scheduledFor: 'In 4 days' } };
      save('jw_followups', out);
      return out;
    });
    setAutomation((prev) => {
      const out = prev.map((s) => (s.id === 'outreach' ? { ...s, usage: Math.min(s.limit, s.usage + 1), lastRun: 'Just now' } : s));
      save('jw_automation', out);
      return out;
    });
    if (r) addActivity({ text: 'Outreach email sent', detail: `${r.name} at ${r.company} — ${subject}`, kind: 'email' });
    if (r) pushNotification({ title: 'Recruiter email sent', body: `${r.name} at ${r.company} — reply tracking is on.`, link: '/app/outreach', kind: 'system' });
    pushToast({ title: 'Email sent', description: r ? `To ${r.name}` : undefined, kind: 'success' });
  }, [recruiters, addActivity, pushNotification, pushToast]);

  const saveDraft = useCallback((recruiterId: string, subject: string, body: string) => {
    setDrafts((prev) => {
      const out = { ...prev, [recruiterId]: { subject, body, updatedAt: 'Just now' } };
      save('jw_drafts', out);
      return out;
    });
    pushToast({ title: 'Draft saved', description: 'Resume it anytime from the recruiter row.', kind: 'success' });
  }, [pushToast]);

  const getDraft = useCallback((recruiterId: string) => drafts[recruiterId], [drafts]);

  /* ---------- follow-ups ---------- */
  const scheduleFollowUp = useCallback((recruiterId: string, data: { scheduledFor: string; subject: string; body: string }) => {
    setFollowUps((prev) => {
      const out = { ...prev, [recruiterId]: { status: 'scheduled' as const, ...data } };
      save('jw_followups', out);
      return out;
    });
    setAutomation((prev) => {
      const out = prev.map((s) => (s.id === 'monitoring' ? { ...s, usage: Math.min(s.limit, s.usage + 1), lastRun: 'Just now' } : s));
      save('jw_automation', out);
      return out;
    });
    const r = recruiters.find((x) => x.id === recruiterId);
    addActivity({ text: 'Follow-up scheduled', detail: r ? `${r.name} at ${r.company} — ${data.scheduledFor}` : data.scheduledFor, kind: 'email' });
    pushToast({ title: 'Follow-up scheduled', description: data.scheduledFor, kind: 'success' });
  }, [recruiters, addActivity, pushToast]);

  const sendFollowUp = useCallback((recruiterId: string, subject: string, body: string) => {
    const r = recruiters.find((x) => x.id === recruiterId);
    setFollowUps((prev) => {
      const out = { ...prev, [recruiterId]: { status: 'sent' as const, subject, body, sentAt: todayStr() } };
      save('jw_followups', out);
      return out;
    });
    setEmailsSent((prev) => {
      const out = prev + 1;
      save('jw_emails_sent', out);
      return out;
    });
    setRecruiters((prev) => {
      const out = prev.map((x) => (x.id === recruiterId ? { ...x, date: todayStr() } : x));
      save('jw_recruiters', out);
      return out;
    });
    setAutomation((prev) => {
      const out = prev.map((s) => (s.id === 'outreach' ? { ...s, usage: Math.min(s.limit, s.usage + 1), lastRun: 'Just now' } : s));
      save('jw_automation', out);
      return out;
    });
    if (r) addActivity({ text: 'Follow-up sent', detail: `${r.name} at ${r.company} — ${subject}`, kind: 'email' });
    if (r) pushNotification({ title: 'Follow-up sent', body: `${r.name} at ${r.company} — reply tracking continues.`, link: '/app/outreach', kind: 'system' });
    pushToast({ title: 'Follow-up sent', description: r ? `To ${r.name}` : undefined, kind: 'success' });
  }, [recruiters, addActivity, pushNotification, pushToast]);

  const dismissFollowUp = useCallback((recruiterId: string) => {
    setFollowUps((prev) => {
      const out = { ...prev, [recruiterId]: { ...(prev[recruiterId] ?? { subject: '', body: '' }), status: 'dismissed' as const } };
      save('jw_followups', out);
      return out;
    });
    pushToast({ title: 'Follow-up dismissed', kind: 'info' });
  }, [pushToast]);

  /* ---------- responses ---------- */
  const markResponseRead = useCallback((id: string) => {
    setResponses((prev) => {
      const out = prev.map((r) => (r.id === id ? { ...r, read: true } : r));
      save('jw_responses', out);
      return out;
    });
  }, []);

  const markAllResponsesRead = useCallback(() => {
    setResponses((prev) => {
      const out = prev.map((r) => ({ ...r, read: true }));
      save('jw_responses', out);
      return out;
    });
    pushToast({ title: 'Response marked as read', description: 'Inbox is clear.', kind: 'success' });
  }, [pushToast]);

  const archiveResponse = useCallback((id: string) => {
    setResponses((prev) => {
      const out = prev.map((r) => (r.id === id ? { ...r, archived: true, read: true } : r));
      save('jw_responses', out);
      return out;
    });
    pushToast({ title: 'Response archived', kind: 'info' });
  }, [pushToast]);

  const restoreResponse = useCallback((id: string) => {
    setResponses((prev) => {
      const out = prev.map((r) => (r.id === id ? { ...r, archived: false } : r));
      save('jw_responses', out);
      return out;
    });
    pushToast({ title: 'Response restored to inbox', kind: 'success' });
  }, [pushToast]);

  const addResponseNote = useCallback((id: string, text: string) => {
    const t = text.trim();
    if (!t) return;
    setResponses((prev) => {
      const out = prev.map((r) => (r.id === id ? { ...r, notes: [...r.notes, { id: nid('rnote'), text: t, date: 'Just now' }] } : r));
      save('jw_responses', out);
      return out;
    });
    pushToast({ title: 'Note added', kind: 'success' });
  }, [pushToast]);

  const sendReply = useCallback((id: string, text: string) => {
    const r = responses.find((x) => x.id === id);
    setResponses((prev) => {
      const out = prev.map((x) => (x.id === id ? { ...x, replied: true, read: true } : x));
      save('jw_responses', out);
      return out;
    });
    if (r) addActivity({ text: 'Replied to recruiter', detail: `${r.recruiterName} at ${r.company}`, kind: 'response' });
    pushToast({ title: 'Response sent', description: r ? `To ${r.recruiterName}` : undefined, kind: 'success' });
  }, [responses, addActivity, pushToast]);

  const unreadResponseCount = useMemo(
    () => responses.filter((r) => !r.read && !r.archived).length,
    [responses]
  );

  /* ---------- notifications ---------- */
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const out = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      save('jw_notifications', out);
      return out;
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => {
      const out = prev.map((n) => ({ ...n, read: true }));
      save('jw_notifications', out);
      return out;
    });
  }, []);

  const unreadNotifications = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  /* ---------- settings + automation ---------- */
  const updateSettings = useCallback((patch: Partial<AutomationSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      save('jw_settings', next);
      return next;
    });
  }, []);

  const toggleAutomation = useCallback((id: string) => {
    setAutomation((prev) => {
      const out = prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled, lastRun: !s.enabled ? 'Just now' : s.lastRun } : s));
      save('jw_automation', out);
      return out;
    });
    const svc = automation.find((s) => s.id === id);
    if (svc) pushToast({ title: svc.enabled ? `${svc.title} paused` : `${svc.title} activated`, kind: 'info' });
  }, [automation, pushToast]);

  /* ---------- confirm ---------- */
  const askConfirm = useCallback((c: { title: string; description: string; confirmLabel?: string; onConfirm: () => void }) => {
    setConfirmState(c);
  }, []);
  const closeConfirm = useCallback(() => setConfirmState(null), []);

  const appliedJobIds = useMemo(() => new Set(applications.filter((a) => a.status !== 'Withdrawn').map((a) => a.jobId)), [applications]);

  const value: AppState = {
    isAuthenticated, login, logout,
    profile, updateProfile, addSkill, removeSkill, setResume, clearResume, profileCompletion,
    savedJobIds, toggleSaveJob,
    queueJobIds, toggleQueueJob, removeFromQueue,
    compareIds, toggleCompareJob, clearCompare, compareOpen, setCompareOpen,
    applications, appliedJobIds, applyToJob, updateApplicationStatus, withdrawApplication, addApplicationNote,
    recruiters, emailsSent, sendOutreach, saveDraft, getDraft,
    followUps, scheduleFollowUp, sendFollowUp, dismissFollowUp,
    responses, unreadResponseCount, markResponseRead, markAllResponsesRead, archiveResponse, restoreResponse, addResponseNote, sendReply,
    notifications, unreadNotifications, markNotificationRead, markAllNotificationsRead, notify: pushNotification,
    activity,
    settings, updateSettings,
    automation, toggleAutomation,
    toasts, pushToast, dismissToast,
    confirmState, askConfirm, closeConfirm,
    paletteOpen, setPaletteOpen,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
