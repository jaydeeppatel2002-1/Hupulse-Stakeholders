const BASE = '/api/v1';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

function qs(params: Record<string, unknown>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

// ── Stakeholders ────────────────────────────────────────────

export interface Stakeholder {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  company?: string;
  department?: string;
  type?: string;
  status?: string;
  powerScore?: number;
  interestScore?: number;
  sentiment?: string;
  notes?: string;
  tags?: { tag: { id: string; name: string; color?: string } }[];
  engagementScores?: { score: number; calculatedAt: string }[];
  createdAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const stakeholdersApi = {
  list: (params: Record<string, unknown> = {}) =>
    request<PaginatedResponse<Stakeholder>>(`/stakeholders${qs(params)}`),
  get: (id: string) => request<Stakeholder>(`/stakeholders/${id}`),
  stats: () => request<Record<string, unknown>>('/stakeholders/stats'),
  matrix: () => request<Stakeholder[]>('/stakeholders/matrix'),
  create: (data: Record<string, unknown>) =>
    request<Stakeholder>('/stakeholders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request<Stakeholder>(`/stakeholders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/stakeholders/${id}`, { method: 'DELETE' }),
};

// ── Communications ──────────────────────────────────────────

export interface Communication {
  id: string;
  channel: string;
  direction?: string;
  subject?: string;
  body: string;
  summary?: string;
  sentiment?: string;
  occurredAt?: string;
  createdAt?: string;
  stakeholders?: Stakeholder[];
}

export const communicationsApi = {
  list: (params: Record<string, unknown> = {}) =>
    request<PaginatedResponse<Communication>>(`/communications${qs(params)}`),
  stats: () => request<Record<string, unknown>>('/communications/stats'),
  get: (id: string) => request<Communication>(`/communications/${id}`),
  create: (data: Record<string, unknown>) =>
    request<Communication>('/communications', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request<Communication>(`/communications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/communications/${id}`, { method: 'DELETE' }),
};

// ── Surveys / Feedback ──────────────────────────────────────

export interface Survey {
  id: string;
  title: string;
  description?: string;
  type?: string;
  status?: string;
  questions?: unknown;
  startsAt?: string;
  endsAt?: string;
  createdAt?: string;
  _count?: { responses: number };
}

export const surveysApi = {
  list: (params: Record<string, unknown> = {}) =>
    request<PaginatedResponse<Survey>>(`/surveys${qs(params)}`),
  alerts: () => request<Record<string, unknown>>('/surveys/alerts'),
  get: (id: string) => request<Survey>(`/surveys/${id}`),
  results: (id: string) => request<Record<string, unknown>>(`/surveys/${id}/results`),
  create: (data: Record<string, unknown>) =>
    request<Survey>('/surveys', { method: 'POST', body: JSON.stringify(data) }),
  respond: (id: string, data: Record<string, unknown>) =>
    request<unknown>(`/surveys/${id}/responses`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request<Survey>(`/surveys/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/surveys/${id}`, { method: 'DELETE' }),
};

// ── Learning / Courses ──────────────────────────────────────

export interface Course {
  id: string;
  title: string;
  description?: string;
  status?: string;
  durationHours?: number;
  thumbnailUrl?: string;
  objectives?: string[];
  createdAt?: string;
}

export const coursesApi = {
  list: (params: Record<string, unknown> = {}) =>
    request<PaginatedResponse<Course>>(`/courses${qs(params)}`),
  teamProgress: () => request<Record<string, unknown>>('/courses/team-progress'),
  get: (id: string) => request<Course>(`/courses/${id}`),
  create: (data: Record<string, unknown>) =>
    request<Course>('/courses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request<Course>(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/courses/${id}`, { method: 'DELETE' }),
};

// ── Analytics ───────────────────────────────────────────────

export const analyticsApi = {
  dashboard: () => request<Record<string, unknown>>('/analytics/dashboard'),
  engagement: () => request<Record<string, unknown>>('/analytics/engagement'),
  risk: () => request<Record<string, unknown>>('/analytics/risk'),
  departments: () => request<Record<string, unknown>>('/analytics/departments'),
  communication: () => request<Record<string, unknown>>('/analytics/communication'),
  predictive: () => request<Record<string, unknown>>('/analytics/predictive'),
};

// ── Notifications ───────────────────────────────────────────

export const notificationsApi = {
  list: (unreadOnly?: boolean) =>
    request<unknown[]>(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`),
  unreadCount: () => request<{ count: number }>('/notifications/unread-count'),
  markRead: (id: string) =>
    request<unknown>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () =>
    request<unknown>('/notifications/mark-all-read', { method: 'POST' }),
};

// ── Tags ────────────────────────────────────────────────────

export const tagsApi = {
  list: () => request<{ id: string; name: string; color?: string }[]>('/tags'),
  create: (data: { name: string; color?: string }) =>
    request<unknown>('/tags', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Users ───────────────────────────────────────────────────

export const usersApi = {
  me: () => request<Record<string, unknown>>('/users/me'),
  list: () => request<Record<string, unknown>[]>('/users'),
  update: (id: string, data: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Organizations ───────────────────────────────────────────

export const organizationsApi = {
  current: () => request<Record<string, unknown>>('/organizations/current'),
  update: (data: Record<string, unknown>) =>
    request<Record<string, unknown>>('/organizations/current', { method: 'PUT', body: JSON.stringify(data) }),
};
