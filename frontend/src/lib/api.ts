import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  email: string;
  role: string;
}

export interface Workflow {
  id: number;
  name: string;
  description?: string;
  json: any;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowRun {
  id: number;
  workflow_id: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  trigger_data?: any;
  result?: any;
  error?: string;
  started_at: string;
  finished_at?: string;
}

export interface RunStep {
  id: number;
  node_id: string;
  type: string;
  status: string;
  input?: any;
  output?: any;
  error?: string;
  logs: any[];
  started_at?: string;
  finished_at?: string;
}

export interface Credential {
  id: number;
  provider: string;
  name: string;
  scopes?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// Auth API
export const authApi = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }).then((res) => res.data),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((res) => res.data),
};

// Workflows API
export const workflowsApi = {
  getAll: () =>
    api.get<{ workflows: Workflow[] }>('/workflows').then((res) => res.data.workflows),

  getById: (id: number) =>
    api.get<{ workflow: Workflow }>(`/workflows/${id}`).then((res) => res.data.workflow),

  create: (data: { name: string; description?: string; json: any }) =>
    api.post<{ workflow: Workflow }>('/workflows', data).then((res) => res.data.workflow),

  update: (id: number, data: Partial<Workflow>) =>
    api.put<{ workflow: Workflow }>(`/workflows/${id}`, data).then((res) => res.data.workflow),

  delete: (id: number) =>
    api.delete(`/workflows/${id}`).then((res) => res.data),
};

// Executions API
export const executionsApi = {
  execute: (workflowId: number, triggerData?: any) =>
    api.post(`/executions/workflows/${workflowId}/execute`, { triggerData }).then((res) => res.data),

  getRuns: (workflowId: number) =>
    api.get<{ runs: WorkflowRun[] }>(`/executions/workflows/${workflowId}/runs`).then((res) => res.data.runs),

  getRunDetails: (runId: number) =>
    api.get<{ run: WorkflowRun; steps: RunStep[]; toolExecutions: any[] }>(`/executions/runs/${runId}`).then((res) => res.data),

  getRunLogs: (runId: number) =>
    api.get(`/executions/runs/${runId}/logs`).then((res) => res.data),
};

// Credentials API
export const credentialsApi = {
  getAll: () =>
    api.get<{ credentials: Credential[] }>('/credentials').then((res) => res.data.credentials),

  create: (data: { provider: string; name: string; tokens: any; scopes?: string }) =>
    api.post<{ credential: Credential }>('/credentials', data).then((res) => res.data.credential),

  update: (id: number, data: any) =>
    api.put<{ credential: Credential }>(`/credentials/${id}`, data).then((res) => res.data.credential),

  delete: (id: number) =>
    api.delete(`/credentials/${id}`).then((res) => res.data),
};

export default api;
