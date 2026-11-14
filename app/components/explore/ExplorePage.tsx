"use client";

import { useState, useEffect, useCallback } from "react";
import type { Vibe } from "@/types";
import type { Position } from "@/hooks/useGeoLocation";
import { useAuth } from "@/store/auth";
import { vibeApi, requestApi } from "@/lib/api";
import SwipeCard from "./SwipeCard";
import { Spinner } from "@/components/ui";

interface Props {
  position: Position | null;
}

export default function ExplorePage({ position }: Props) {
  const { token } = useAuth();
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    msg: string;
    type: "join" | "skip";
  } | null>(null);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!token || !position) return;
    setLoading(true);
    try {
      const { vibes } = await vibeApi.getNearby(
        token,
        position.lat,
        position.lng,
        { radius: 10 },
      );
      setVibes(vibes);
      setIndex(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, position]);

  useEffect(() => {
    if (position) load();
    else setLoading(true); // keep spinner while waiting for position
  }, [load, position]);

  function showToast(msg: string, type: "join" | "skip") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2000);
  }

  async function handleSwipeRight(vibe: Vibe) {
    setIndex((i) => i + 1);
    setJoined((s) => new Set(s).add(vibe._id));
    showToast("Request sent!", "join");
    if (!token) return;
    try {
      await requestApi.send(token, vibe._id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("already")) console.error(err);
    }
  }

  function handleSwipeLeft(vibe: Vibe) {
    setIndex((i) => i + 1);
    setSkipped((s) => new Set(s).add(vibe._id));
    showToast("Skipped", "skip");
  }

  const remaining = vibes.slice(index);
  const allDone = !loading && remaining.length === 0;

  return (
    <div
      style={{
        height: "100%",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 20px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexShrink: 0,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: 28,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            explore
          </h1>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 12,
              color: "var(--ink-3)",
              marginTop: 4,
            }}
          >
            {loading
              ? "finding vibes..."
              : `${remaining.length} vibe${remaining.length !== 1 ? "s" : ""} nearby`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <StatChip
            icon="✓"
            count={joined.size}
            color="#e8ff47"
            label="joined"
          />
          <StatChip
            icon="×"
            count={skipped.size}
            color="var(--ink-3)"
            label="skipped"
          />
        </div>
      </div>

      {/* Card stack */}
      <div
        style={{ flex: 1, position: "relative", padding: "24px 20px 100px" }}
      >
        {loading ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <Spinner className="border-t-[#e8ff47]" />
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 12,
                color: "var(--ink-4)",
              }}
            >
              {!position
                ? "waiting for your location..."
                : "finding vibes near you..."}
            </p>
          </div>
        ) : allDone ? (
          <EmptyState onRefresh={load} />
        ) : (
          // Render top 3 cards in reverse order so top card is on top
          [...remaining]
            .slice(0, 3)
            .reverse()
            .map((vibe, i, arr) => (
              <SwipeCard
                key={vibe._id}
                vibe={vibe}
                stackIndex={arr.length - 1 - i}
                isTop={i === arr.length - 1}
                onSwipeRight={() => handleSwipeRight(vibe)}
                onSwipeLeft={() => handleSwipeLeft(vibe)}
              />
            ))
        )}
      </div>

      {/* Action buttons */}
      {!loading && !allDone && (
        <div
          style={{
            position: "absolute",
            bottom: 96,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 20,
            alignItems: "center",
          }}
        >
          <ActionButton
            color="#ff4d4d"
            onClick={() => handleSwipeLeft(remaining[0])}
            label="Skip"
          >
            <svg viewBox="0 0 24 24" fill="#ff4d4d" width={22} height={22}>
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </ActionButton>
          <ActionButton
            color="#e8ff47"
            onClick={() => handleSwipeRight(remaining[0])}
            label="Join"
            large
          >
            <svg viewBox="0 0 24 24" fill="#000" width={26} height={26}>
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </ActionButton>
          <ActionButton color="#4db6ff" onClick={load} label="Refresh">
            <svg viewBox="0 0 24 24" fill="#4db6ff" width={22} height={22}>
              <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
          </ActionButton>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.type === "join" ? "#e8ff4718" : "var(--bg-3)",
            border: `1px solid ${toast.type === "join" ? "#e8ff4733" : "var(--border)"}`,
            color: toast.type === "join" ? "#e8ff47" : "var(--ink-3)",
            padding: "8px 20px",
            borderRadius: 100,
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.06em",
            animation: "fadeUp 200ms ease",
            whiteSpace: "nowrap",
            zIndex: 100,
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  color,
  onClick,
  label,
  large,
  children,
}: {
  color: string;
  onClick: () => void;
  label: string;
  large?: boolean;
  children: React.ReactNode;
}) {
  const size = large ? 64 : 52;
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `1px solid ${color}33`,
        background: color + "12",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        boxShadow: `0 4px 16px ${color}20`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
        e.currentTarget.style.boxShadow = `0 6px 20px ${color}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = `0 4px 16px ${color}20`;
      }}
    >
      {children}
    </button>
  );
}

function StatChip({
  icon,
  count,
  color,
  label,
}: {
  icon: string;
  count: number;
  color: string;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 10px",
        borderRadius: 100,
        background: "var(--bg-3)",
        border: "1px solid #2a2a2a",
      }}
    >
      <span
        style={{
          fontFamily: "Syne, sans-serif",
          fontWeight: 700,
          fontSize: 11,
          color,
        }}
      >
        {icon} {count}
      </span>
      <span
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: 10,
          color: "var(--ink-3)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <div style={{ fontSize: 48 }}>🌙</div>
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: 18,
            color: "var(--ink)",
            marginBottom: 6,
          }}
        >
          all caught up
        </p>
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13,
            color: "var(--ink-3)",
          }}
        >
          no more vibes nearby right now
        </p>
      </div>
      <button
        onClick={onRefresh}
        style={{
          padding: "10px 24px",
          borderRadius: 100,
          background: "var(--bg-3)",
          border: "1px solid #2a2a2a",
          color: "var(--ink-3)",
          fontFamily: "Syne, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          cursor: "pointer",
          letterSpacing: "0.06em",
        }}
      >
        check again
      </button>
    </div>
  );
}
