import type { Vibe, Message, User } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? data.errors?.[0]?.msg ?? "Request failed");
  }
  return data as T;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  google: (idToken: string) =>
    request<{ token: string; user: User; isNew: boolean }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),

  me: (token: string) => request<{ user: User }>("/auth/me", {}, token),
};

// ── Vibes ─────────────────────────────────────────────────────────────────────

export const vibeApi = {
  create: (
    token: string,
    body: {
      title: string;
      intent: string;
      coordinates: [number, number];
      maxPeople: number;
      durationMinutes: number;
    },
  ) =>
    request<{ vibe: Vibe }>(
      "/vibes",
      { method: "POST", body: JSON.stringify(body) },
      token,
    ),

  getNearby: (
    token: string,
    lat: number,
    lng: number,
    params?: { radius?: number; intent?: string },
  ) => {
    const qs = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      ...(params?.radius ? { radius: String(params.radius) } : {}),
      ...(params?.intent ? { intent: params.intent } : {}),
    }).toString();
    return request<{ vibes: Vibe[] }>(`/vibes/nearby?${qs}`, {}, token);
  },

  getById: (token: string, id: string) =>
    request<{ vibe: Vibe }>(`/vibes/${id}`, {}, token),

  getMine: (token: string) =>
    request<{ vibes: Vibe[] }>("/vibes/mine", {}, token),

  getRequested: (token: string) =>
    request<{ vibes: Vibe[] }>("/vibes/requested", {}, token),

  delete: (token: string, id: string) =>
    request<{ message: string }>(`/vibes/${id}`, { method: "DELETE" }, token),
};

// ── Requests ──────────────────────────────────────────────────────────────────

export const requestApi = {
  send: (token: string, vibeId: string) =>
    request<{ message: string }>(
      `/vibes/${vibeId}/request`,
      { method: "POST" },
      token,
    ),

  approve: (token: string, vibeId: string, userId: string) =>
    request<{ message: string }>(
      `/vibes/${vibeId}/approve`,
      { method: "POST", body: JSON.stringify({ userId }) },
      token,
    ),

  reject: (token: string, vibeId: string, userId: string) =>
    request<{ message: string }>(
      `/vibes/${vibeId}/reject`,
      { method: "POST", body: JSON.stringify({ userId }) },
      token,
    ),
};

// ── Moderation ────────────────────────────────────────────────────────────────

export const moderationApi = {
  report: (token: string, targetUserId: string, reason: string) =>
    request<{ message: string }>(
      "/report",
      { method: "POST", body: JSON.stringify({ targetUserId, reason }) },
      token,
    ),

  block: (token: string, targetUserId: string) =>
    request<{ message: string }>(
      "/block",
      { method: "POST", body: JSON.stringify({ targetUserId }) },
      token,
    ),
};
