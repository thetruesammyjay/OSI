const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");

export type LayerInfo = { number: number; name: string; dataUnit: string; description: string; protocols: { name: string }[]; hardware: string[]; functions: string[] };
export type MCQ = { id: string; question: string; options: string[]; correct_answer: number; explanation?: string | null; category?: string | null; order_index: number };
export type DragDropQuestion = { id: string; title: string; description?: string | null; items: string[]; categories: string[]; correct_mappings: Record<string, string>; explanation?: string | null; order_index: number };
export type AttemptResult = { id: string; user_id: string | null; score: number; total_questions: number; answers: Record<string, unknown>; completed_at: string };
export type FeedbackInput = { experience?: string; difficulties?: string; suggestions?: string; educational_value?: string; ratings?: Record<string, number> };
export type FAQ = { id: string; question: string; answer: string; category?: string | null; order_index: number; created_at: string; updated_at: string };
export type FAQInput = Pick<FAQ, "question" | "answer" | "category" | "order_index">;

function csrfToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie.split("; ").find((part) => part.startsWith("osi_csrf_token="))?.split("=").slice(1).join("=");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = csrfToken();
  if (token && init.method && init.method !== "GET") headers.set("X-CSRF-Token", token);
  const response = await fetch(`${API_URL}/${path.replace(/^\//, "")}`, { ...init, headers, credentials: "include" });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const body = await response.json() as { error?: string; detail?: string }; message = body.error ?? body.detail ?? message; } catch { /* preserve status message */ }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string; timestamp: string }>("health"),
  ready: () => request<{ status: string; timestamp: string }>("ready"),
  feedback: (input: FeedbackInput) => request<{ accepted: boolean }>("feedback", { method: "POST", body: JSON.stringify(input) }),
  encapsulate: (payload: string) => request<{ data: Record<string, unknown> }>("pdu/encapsulate", { method: "POST", body: JSON.stringify({ payload }) }),
  decapsulate: (encapsulatedData: Record<string, unknown>) => request<{ data: Record<string, unknown> }>("pdu/decapsulate", { method: "POST", body: JSON.stringify({ encapsulatedData }) }),
  layers: () => request<{ data: LayerInfo[] }>("pdu/layers"),
  faqs: () => request<FAQ[]>("faq"),
  questions: () => request<MCQ[]>("quiz/questions"),
  dragDrop: () => request<DragDropQuestion[]>("quiz/drag-drop"),
  submitAttempt: (answers: Record<string, unknown>) => request<AttemptResult>("quiz/attempt", { method: "POST", body: JSON.stringify({ answers }) }),
  login: (username: string, password: string) => request<{ token: null; user: { id: string; username: string } }>("auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  verify: () => request<{ valid: boolean; user: { id: string; username: string } }>("auth/verify"),
  logout: () => request<void>("auth/logout", { method: "POST" }),
  createFaq: (input: FAQInput) => request<FAQ>("faq", { method: "POST", body: JSON.stringify(input) }),
  updateFaq: (id: string, input: FAQInput) => request<FAQ>(`faq/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteFaq: (id: string) => request<{ deleted: boolean }>(`faq/${id}`, { method: "DELETE" }),
};
