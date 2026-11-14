"use client";

import { useState } from "react";
import type { Vibe, User } from "@/types";
import { useAuth } from "@/store/auth";
import { requestApi } from "@/lib/api";
import {
  IntentBadge,
  Avatar,
  CapacityBar,
  ErrorMessage,
} from "@/components/ui";
import { getTimeLeft } from "@/lib/time";

interface Props {
  vibe: Vibe;
  onClose: () => void;
  onOpenChat: (vibe: Vibe) => void;
  onRequestSent: () => void;
}

export default function VibePanel({
  vibe,
  onClose,
  onOpenChat,
  onRequestSent,
}: Props) {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);

  const hostId =
    typeof vibe.hostId === "object" ? (vibe.hostId as User)._id : vibe.hostId;
  const host = typeof vibe.hostId === "object" ? (vibe.hostId as User) : null;
  const isHost = hostId === user?._id;
  const isParticipant = vibe.participants.some(
    (p) => (typeof p === "object" ? (p as User)._id : p) === user?._id,
  );
  const spotsLeft = vibe.maxPeople - vibe.participants.length;
  const isFull = spotsLeft <= 0;

  async function handleRequest() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await requestApi.send(token, vibe._id);
      setRequested(true);
      onRequestSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="drawer" onClick={(e) => e.stopPropagation()}>
      <div className="drawer-handle" />

      {/* Header */}
      <div
        style={{
          padding: "0 20px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
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
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 22,
              color: "var(--ink)",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
              marginBottom: 8,
            }}
          >
            {vibe.title}
          </h2>
          <div
            style={{
              display: "flex",
              gap: 16,
              fontFamily: "DM Sans, sans-serif",
              fontSize: 13,
              color: "#666",
            }}
          >
            <span>
              by{" "}
              <strong style={{ color: "var(--ink)" }}>
                {host?.name ?? "someone"}
              </strong>
            </span>
            <span style={{ color: spotsLeft <= 2 ? "#ff4d4d" : "#666" }}>
              {isFull
                ? "full"
                : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "var(--bg-3)",
            border: "none",
            color: "#666",
            width: 32,
            height: 32,
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginLeft: 12,
          }}
        >
          ×
        </button>
      </div>

      {/* Capacity bar */}
      <div style={{ padding: "0 20px 16px" }}>
        <CapacityBar current={vibe.participants.length} max={vibe.maxPeople} />
      </div>

      {/* Participants */}
      {vibe.participants.length > 0 && (
        <div
          style={{
            padding: "0 20px 20px",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {vibe.participants.slice(0, 7).map((p, i) => {
            const participant = typeof p === "object" ? (p as User) : null;
            return (
              <div key={i} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                <Avatar
                  name={participant?.name ?? "?"}
                  photo={participant?.photo}
                  size="sm"
                  index={i}
                />
              </div>
            );
          })}
          {vibe.participants.length > 7 && (
            <span
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 11,
                color: "var(--ink-3)",
                marginLeft: 6,
              }}
            >
              +{vibe.participants.length - 7} more
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: "0 20px 12px" }}>
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Action */}
      <div style={{ padding: "0 20px 32px" }}>
        {isParticipant || isHost ? (
          <button
            onClick={() => onOpenChat(vibe)}
            style={{
              width: "100%",
              padding: "13px",
              background: "#e8ff47",
              color: "#000",
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            open chat →
          </button>
        ) : requested ? (
          <div
            style={{
              width: "100%",
              padding: "13px",
              background: "var(--bg-3)",
              color: "var(--ink-3)",
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              borderRadius: 8,
              textAlign: "center",
              border: "1px solid #2a2a2a",
            }}
          >
            request sent ✓
          </div>
        ) : isFull ? (
          <div
            style={{
              width: "100%",
              padding: "13px",
              background: "var(--bg-3)",
              color: "var(--ink-3)",
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 13,
              textTransform: "uppercase",
              borderRadius: 8,
              textAlign: "center",
              border: "1px solid #2a2a2a",
            }}
          >
            this vibe is full
          </div>
        ) : (
          <button
            onClick={handleRequest}
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              background: loading ? "var(--ink-4)" : "#e8ff47",
              color: loading ? "#666" : "#000",
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              border: "none",
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {loading ? "sending..." : "request to join"}
          </button>
        )}
      </div>
    </div>
  );
}
