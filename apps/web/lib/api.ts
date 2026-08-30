const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export type FeedbackInput = {
  experience?: string;
  difficulties?: string;
  suggestions?: string;
  educational_value?: string;
  ratings?: Record<string, number>;
};

export const api = {
  health: () => request<{ status: string; timestamp: string }>("health"),
  feedback: (input: FeedbackInput) => request<{ accepted: boolean }>("feedback", { method: "POST", body: JSON.stringify(input) }),
  encapsulate: (payload: string) => request("pdu/encapsulate", { method: "POST", body: JSON.stringify({ payload }) }),
};
