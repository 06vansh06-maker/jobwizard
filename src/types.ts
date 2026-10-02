export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  salaryMin: number;
  type: string; // Full-time, Contract, Part-time
  workMode: 'Remote' | 'Hybrid' | 'On-site';
  experience: string; // Entry, Mid, Senior, Lead
  matchScore: number; // 0 - 10
  skills: string[];
  postedAt: string;
  postedDaysAgo: number;
  description: string;
  whyMatches?: string[];
}

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Interview'
  | 'Rejected'
  | 'Offer'
  | 'Withdrawn';

export interface ApplicationTimelineItem {
  label: string;
  date: string;
  done: boolean;
  current?: boolean;
}

export interface ApplicationNote {
  id: string;
  text: string;
  date: string;
}

export interface Application {
  id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  status: ApplicationStatus;
  appliedDate: string;
  resumeUsed: string;
  timeline: ApplicationTimelineItem[];
  notes: ApplicationNote[];
}

export type OutreachStatus =
  | 'Not Contacted'
  | 'Sent'
  | 'Opened'
  | 'Replied'
  | 'Interested';

export interface Recruiter {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  status: OutreachStatus;
  date: string;
  initials: string;
}

export interface EmailDraft {
  subject: string;
  body: string;
  updatedAt: string;
}

export type FollowUpStatus = 'suggested' | 'scheduled' | 'sent' | 'dismissed';

export interface FollowUp {
  status: FollowUpStatus;
  scheduledFor?: string;
  subject?: string;
  body?: string;
  sentAt?: string;
}

export type ResponseClassification =
  | 'Interested'
  | 'Not Interested'
  | 'Needs Action';

export interface ResponseNote {
  id: string;
  text: string;
  date: string;
}

export interface RecruiterResponse {
  id: string;
  recruiterName: string;
  recruiterTitle: string;
  company: string;
  initials: string;
  subject: string;
  preview: string;
  message: string;
  timestamp: string;
  classification: ResponseClassification;
  confidence: number; // 0-100, mock/demo AI confidence
  suggestedResponse: string;
  read: boolean;
  archived: boolean;
  replied: boolean;
  notes: ResponseNote[];
}

export interface UserProfile {
  name: string;
  firstName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  experienceYears: string;
  experienceLevel: string; // Entry, Mid, Senior, Lead
  experienceDetails: string;
  education: string;
  currentRole: string;
  skills: string[];
  preferredRoles: string[];
  preferredLocations: string[];
  salaryRange: string;
  salaryMin: number;
  workMode: string;
  jobType: string;
  resumeName: string;
  resumeSize: string;
  resumeUpdated: string;
}

export interface AutomationSettings {
  autoFetchJobs: boolean;
  dailyApplicationLimit: number;
  outreachLimit: number;
  responseMonitoring: boolean;
  emailNotifications: boolean;
  weeklyDigest: boolean;
  instantAlerts: boolean;
}

export interface AutomationService {
  id: 'discovery' | 'applications' | 'outreach' | 'monitoring';
  title: string;
  description: string;
  enabled: boolean;
  lastRun: string;
  usage: number;
  limit: number;
  unit: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  link: string;
  time: string;
  read: boolean;
  kind: 'application' | 'response' | 'match' | 'system';
}

export interface ActivityItem {
  id: string;
  text: string;
  detail?: string;
  time: string;
  kind: 'apply' | 'save' | 'email' | 'response' | 'profile' | 'system';
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  kind: 'success' | 'error' | 'info';
}
