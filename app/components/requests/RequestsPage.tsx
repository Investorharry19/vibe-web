"use client";

import { useState, useEffect, useCallback } from "react";
import type { Vibe, User } from "@/types";
import { useAuth } from "@/store/auth";
import { vibeApi, requestApi } from "@/lib/api";
import { IntentBadge, Spinner } from "@/components/ui";
import { getTimeLeft } from "@/lib/time";

type Tab = "received" | "sent";

interface RequestedVibe extends Vibe {
  myRequestStatus?: "pending" | "approved" | "rejected";
}

function getRequestUserId(userId: User | string) {
  return typeof userId === "object" ? userId._id : userId;
}

function getRequestAvatarLabel(userId: User | string) {
  if (typeof userId === "object") {
    return (userId.name || userId._id).slice(0, 2).toUpperCase();
  }
  return userId.slice(-2).toUpperCase();
}

export default function RequestsPage() {
  const { token, user } = useAuth();
  const [tab, setTab] = useState<Tab>("received");
  const [receivedVibes, setReceivedVibes] = useState<Vibe[]>([]);
  const [sentVibes, setSentVibes] = useState<RequestedVibe[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    try {
      const [{ vibes: myVibes }, { vibes: requestedVibes }] = await Promise.all(
        [vibeApi.getMine(token), vibeApi.getRequested(token)],
      );

      // Received = my hosted vibes with pending requests
      const received = myVibes.filter((v) =>
        (v.requests ?? []).some((r) => r.status === "pending"),
      );

      // Sent = vibes where I requested, annotated with my request status
      const sent: RequestedVibe[] = requestedVibes.reduce<RequestedVibe[]>(
        (acc, v) => {
          const myReq = (v.requests ?? []).find(
            (r) => getRequestUserId(r.userId) === user._id,
          );
          acc.push({ ...v, myRequestStatus: myReq?.status ?? "pending" });
          return acc;
        },
        [],
      );

      setReceivedVibes(received);
      setSentVibes(sent);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    load();
  }, [load]);

  const receivedPending = receivedVibes.reduce(
    (n, v) =>
      n + (v.requests ?? []).filter((r) => r.status === "pending").length,
    0,
  );

  return (
    <div
      style={{
        height: "100%",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: 28,
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          requests
        </h1>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "var(--bg-2)",
            border: "1px solid #2a2a2a",
            borderRadius: 10,
            padding: 4,
          }}
        >
          {(["received", "sent"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 7,
                border: "none",
                background: tab === t ? "var(--bg-3)" : "transparent",
                color: tab === t ? "var(--ink)" : "var(--ink-3)",
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {t}
              {t === "received" && receivedPending > 0 && (
                <span
                  style={{
                    background: "#ff4d4d",
                    color: "#fff",
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    fontSize: 10,
                    padding: "1px 6px",
                    borderRadius: 100,
                  }}
                >
                  {receivedPending}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 100px" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: 60,
            }}
          >
            <Spinner className="border-t-[#e8ff47]" />
          </div>
        ) : tab === "received" ? (
          receivedVibes.length === 0 ? (
            <EmptyState
              icon="📬"
              title="no pending requests"
              sub="when someone wants to join your vibe, they'll show up here"
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {receivedVibes.map((vibe) => (
                <ReceivedVibeCard
                  key={vibe._id}
                  vibe={vibe}
                  token={token!}
                  onAction={load}
                />
              ))}
            </div>
          )
        ) : sentVibes.length === 0 ? (
          <EmptyState
            icon="✈️"
            title="no sent requests"
            sub="vibes you've requested to join will appear here"
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sentVibes.map((vibe) => (
              <SentVibeCard key={vibe._id} vibe={vibe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Received card — host view ─────────────────────────────────────────────────

function ReceivedVibeCard({
  vibe,
  token,
  onAction,
}: {
  vibe: Vibe;
  token: string;
  onAction: () => void;
}) {
  const pending = (vibe.requests ?? []).filter((r) => r.status === "pending");

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid #2a2a2a",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Vibe header */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #1a1a1a" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <IntentBadge intent={vibe.intent} />
          <span
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 11,
              color: "var(--ink-3)",
            }}
          >
            {getTimeLeft(vibe.expiresAt)}
          </span>
        </div>
        <p
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: "var(--ink)",
          }}
        >
          {vibe.title}
        </p>
      </div>

      {/* Request rows */}
      <div style={{ padding: "8px 0" }}>
        {pending.map((req) => (
          <RequestRow
            key={`${getRequestUserId(req.userId)}-${req.createdAt}`}
            vibeId={vibe._id}
            req={req}
            token={token}
            onAction={onAction}
          />
        ))}
      </div>
    </div>
  );
}

function RequestRow({
  vibeId,
  req,
  token,
  onAction,
}: {
  vibeId: string;
  req: { userId: User | string; status: string; createdAt: string };
  token: string;
  onAction: () => void;
}) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);
  const requestUserId = getRequestUserId(req.userId);

  async function respond(action: "approve" | "reject") {
    setLoading(action);
    try {
      if (action === "approve")
        await requestApi.approve(token, vibeId, requestUserId);
      else await requestApi.reject(token, vibeId, requestUserId);
      setDone(action === "approve" ? "approved" : "rejected");
      onAction();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "var(--bg-3)",
          border: "1px solid #2a2a2a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Syne, sans-serif",
          fontWeight: 700,
          fontSize: 11,
          color: "var(--ink-3)",
          flexShrink: 0,
        }}
      >
        {getRequestAvatarLabel(req.userId)}
      </div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13,
            color: "var(--ink)",
          }}
        >
          user wants in
        </p>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 11,
            color: "var(--ink-3)",
          }}
        >
          {new Date(req.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      {done ? (
        <span
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: 11,
            color: done === "approved" ? "#e8ff47" : "var(--ink-3)",
          }}
        >
          {done === "approved" ? "✓ approved" : "× rejected"}
        </span>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => respond("approve")}
            disabled={!!loading}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "1px solid #e8ff4733",
              background: "#e8ff4712",
              color: "#e8ff47",
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 11,
              cursor: "pointer",
              opacity: loading === "approve" ? 0.5 : 1,
            }}
          >
            {loading === "approve" ? "..." : "yes"}
          </button>
          <button
            onClick={() => respond("reject")}
            disabled={!!loading}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "1px solid #ff4d4d33",
              background: "#ff4d4d12",
              color: "#ff4d4d",
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 11,
              cursor: "pointer",
              opacity: loading === "reject" ? 0.5 : 1,
            }}
          >
            {loading === "reject" ? "..." : "no"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sent card — requester view ────────────────────────────────────────────────

function SentVibeCard({ vibe }: { vibe: RequestedVibe }) {
  const status = vibe.myRequestStatus ?? "pending";
  const statusColor = {
    pending: "var(--ink-3)",
    approved: "#e8ff47",
    rejected: "#ff4d4d",
  }[status];
  const statusLabel = {
    pending: "⏳ pending",
    approved: "✓ approved",
    rejected: "× rejected",
  }[status];

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid #2a2a2a",
        borderRadius: 14,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 5,
          }}
        >
          <IntentBadge intent={vibe.intent} />
          <span
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 11,
              color: "var(--ink-3)",
            }}
          >
            {getTimeLeft(vibe.expiresAt)}
          </span>
        </div>
        <p
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: "var(--ink)",
            marginBottom: 3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {vibe.title}
        </p>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
            color: "var(--ink-3)",
          }}
        >
          by{" "}
          {typeof vibe.hostId === "object"
            ? (vibe.hostId as User).name
            : "someone"}
        </p>
      </div>
      <span
        style={{
          fontFamily: "Syne, sans-serif",
          fontWeight: 700,
          fontSize: 11,
          color: statusColor,
          letterSpacing: "0.04em",
          flexShrink: 0,
        }}
      >
        {statusLabel}
      </span>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  sub,
}: {
  icon: string;
  title: string;
  sub: string;
}) {
  return (
    <div
      style={{
        paddingTop: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 36 }}>{icon}</div>
      <p
        style={{
          fontFamily: "Syne, sans-serif",
          fontWeight: 700,
          fontSize: 16,
          color: "var(--ink)",
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: 13,
          color: "var(--ink-3)",
          maxWidth: 260,
        }}
      >
        {sub}
      </p>
    </div>
  );
}
