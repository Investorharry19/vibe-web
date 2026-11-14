"use client";

import { useState } from "react";
import type { Intent, Vibe } from "@/types";
import { useAuth } from "@/store/auth";
import { vibeApi } from "@/lib/api";
import { ErrorMessage } from "@/components/ui";

const INTENTS: Intent[] = ["drinks", "party", "chill", "hookup"];
const DURATIONS = [
  { label: "30m", value: 30 },
  { label: "1h", value: 60 },
  { label: "2h", value: 120 },
  { label: "4h", value: 240 },
];

const intentColors: Record<Intent, string> = {
  drinks: "#ffb74d",
  party: "#e8ff47",
  chill: "#4db6ff",
  hookup: "#ff4d78",
};

interface Props {
  position: { lat: number; lng: number };
  onClose: () => void;
  onCreated: (vibe: Vibe) => void;
}

export default function CreateVibeDrawer({
  position,
  onClose,
  onCreated,
}: Props) {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [intent, setIntent] = useState<Intent>("chill");
  const [maxPeople, setMaxPeople] = useState(6);
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!title.trim() || !token) return;
    setLoading(true);
    setError(null);
    try {
      const { vibe } = await vibeApi.create(token, {
        title: title.trim(),
        intent,
        coordinates: [position.lng, position.lat],
        maxPeople,
        durationMinutes: duration,
      });
      onCreated(vibe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create vibe");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="drawer" onClick={(e) => e.stopPropagation()}>
      <div className="drawer-handle" />

      <div
        style={{
          padding: "0 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "var(--ink)",
          }}
        >
          drop a vibe
        </h2>
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
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          padding: "0 20px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {/* Title */}
        <input
          autoFocus
          placeholder="what's the vibe?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          style={{
            background: "var(--bg-3)",
            border: "1px solid #2a2a2a",
            borderRadius: 8,
            color: "var(--ink)",
            padding: "12px 14px",
            fontSize: 15,
            fontFamily: "DM Sans, sans-serif",
            outline: "none",
            width: "100%",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#e8ff47")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />

        {/* Intent */}
        <div>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 10,
              color: "var(--ink-3)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            intent
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {INTENTS.map((i) => (
              <button
                key={i}
                onClick={() => setIntent(i)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 6,
                  border: `1px solid ${intent === i ? intentColors[i] + "44" : "var(--border)"}`,
                  background:
                    intent === i ? intentColors[i] + "18" : "transparent",
                  color: intent === i ? intentColors[i] : "var(--ink-3)",
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Capacity */}
        <div>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 10,
              color: "var(--ink-3)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            capacity — <span style={{ color: "#e8ff47" }}>{maxPeople}</span>{" "}
            people
          </p>
          <input
            type="range"
            min={2}
            max={20}
            value={maxPeople}
            onChange={(e) => setMaxPeople(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#e8ff47" }}
          />
        </div>

        {/* Duration */}
        <div>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 10,
              color: "var(--ink-3)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            duration
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                style={{
                  flex: 1,
                  padding: "9px 4px",
                  borderRadius: 6,
                  border: `1px solid ${duration === d.value ? "#e8ff4744" : "var(--border)"}`,
                  background:
                    duration === d.value ? "#e8ff4718" : "transparent",
                  color: duration === d.value ? "#e8ff47" : "var(--ink-3)",
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        <button
          onClick={handleCreate}
          disabled={!title.trim() || loading}
          style={{
            width: "100%",
            padding: "13px",
            background: !title.trim() || loading ? "var(--bg-3)" : "#e8ff47",
            color: !title.trim() || loading ? "var(--ink-3)" : "#000",
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            border: "none",
            borderRadius: 8,
            cursor: !title.trim() || loading ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {loading ? "creating..." : "create vibe"}
        </button>
      </div>
    </div>
  );
}
