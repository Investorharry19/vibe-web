"use client";

import { useRef, useState } from "react";
import type { Vibe, User, Intent } from "@/types";
import { getTimeLeft } from "@/lib/time";

const intentColors: Record<Intent, string> = {
  drinks: "#ffb74d",
  party: "#e8ff47",
  chill: "#4db6ff",
  hookup: "#ff4d78",
};

interface Props {
  vibe: Vibe;
  onSwipeRight: () => void; // request to join
  onSwipeLeft: () => void; // skip
  isTop: boolean;
  stackIndex: number; // 0 = top, 1 = below, 2 = further
}

export default function SwipeCard({
  vibe,
  onSwipeRight,
  onSwipeLeft,
  isTop,
  stackIndex,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startX: 0, startY: 0, x: 0, isDragging: false });
  const [pos, setPos] = useState({ x: 0, rotate: 0 });
  const [leaving, setLeaving] = useState<"left" | "right" | null>(null);
  const [animating, setAnimating] = useState(false);

  const host = typeof vibe.hostId === "object" ? (vibe.hostId as User) : null;
  const spotsLeft = vibe.maxPeople - vibe.participants.length;
  const color = intentColors[vibe.intent];

  const SWIPE_THRESHOLD = 100;

  function onPointerDown(e: React.PointerEvent) {
    if (!isTop || animating) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      x: 0,
      isDragging: true,
    };
    cardRef.current?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current.isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    dragRef.current.x = dx;
    setPos({ x: dx, rotate: dx * 0.08 });
  }

  function onPointerUp() {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    const dx = dragRef.current.x;

    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      const dir = dx > 0 ? "right" : "left";
      flyOut(dir);
    } else {
      // snap back
      setPos({ x: 0, rotate: 0 });
    }
  }

  function flyOut(dir: "left" | "right") {
    setAnimating(true);
    setLeaving(dir);
    setPos({
      x: dir === "right" ? 600 : -600,
      rotate: dir === "right" ? 30 : -30,
    });
    setTimeout(() => {
      if (dir === "right") onSwipeRight();
      else onSwipeLeft();
    }, 350);
  }

  // Stack visual offset for cards behind the top one
  const stackScale = 1 - stackIndex * 0.04;
  const stackY = stackIndex * -10;
  const isVisible = stackIndex < 3;

  if (!isVisible) return null;

  const swipeProgress = Math.min(Math.abs(pos.x) / SWIPE_THRESHOLD, 1);
  const showRight = pos.x > 20;
  const showLeft = pos.x < -20;

  return (
    <div
      ref={cardRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: "absolute",
        width: "100%",
        maxWidth: 360,
        left: "50%",
        top: "50%",
        transform: isTop
          ? `translateX(calc(-50% + ${pos.x}px)) translateY(calc(-50% + ${stackY}px)) rotate(${pos.rotate}deg)`
          : `translateX(-50%) translateY(calc(-50% + ${stackY}px)) scale(${stackScale})`,
        transition:
          animating || !dragRef.current.isDragging
            ? "transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)"
            : "none",
        cursor: isTop
          ? dragRef.current.isDragging
            ? "grabbing"
            : "grab"
          : "default",
        userSelect: "none",
        touchAction: "none",
        zIndex: 10 - stackIndex,
      }}
    >
      <div
        style={{
          background: "var(--bg-2)",
          border: `1px solid ${isTop ? "var(--border)" : "var(--border)"}`,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: isTop
            ? "0 20px 60px rgba(0,0,0,0.5)"
            : "0 8px 24px rgba(0,0,0,0.3)",
        }}
      >
        {/* Color band header */}
        <div style={{ height: 6, background: color }} />

        {/* Content */}
        <div style={{ padding: 24 }}>
          {/* Intent + time */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color,
                padding: "4px 10px",
                borderRadius: 4,
                background: color + "18",
                border: `1px solid ${color}33`,
              }}
            >
              {vibe.intent}
            </span>
            <span
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 12,
                color: "var(--ink-3)",
              }}
            >
              {getTimeLeft(vibe.expiresAt)}
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: 26,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              marginBottom: 12,
            }}
          >
            {vibe.title}
          </h2>

          {/* Host */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: color + "30",
                border: `1px solid ${color}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 11,
                color,
              }}
            >
              {(host?.name ?? "?")[0].toUpperCase()}
            </div>
            <div>
              <p
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 13,
                  color: "var(--ink)",
                }}
              >
                {host?.name ?? "someone"}
              </p>
              <p
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 11,
                  color: "var(--ink-3)",
                }}
              >
                host
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <StatPill
              icon="👥"
              label={`${vibe.participants.length}/${vibe.maxPeople} joined`}
            />
            <StatPill
              icon="🎯"
              label={`${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
              urgent={spotsLeft <= 2}
            />
          </div>

          {/* Swipe hint */}
          {isTop && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  opacity: showLeft ? swipeProgress : 0.25,
                  transition: "opacity 0.1s",
                }}
              >
                <span
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    fontSize: 11,
                    color: "#ff4d4d",
                    letterSpacing: "0.06em",
                  }}
                >
                  ← SKIP
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  opacity: showRight ? swipeProgress : 0.25,
                  transition: "opacity 0.1s",
                }}
              >
                <span
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontWeight: 700,
                    fontSize: 11,
                    color: "#e8ff47",
                    letterSpacing: "0.06em",
                  }}
                >
                  JOIN →
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Join / Skip overlay indicators */}
        {isTop && showRight && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 20,
              background: "rgba(232,255,71,0.08)",
              border: "2px solid rgba(232,255,71,0.3)",
              opacity: swipeProgress,
              transition: "opacity 0.1s",
              pointerEvents: "none",
            }}
          />
        )}
        {isTop && showLeft && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 20,
              background: "rgba(255,77,77,0.08)",
              border: "2px solid rgba(255,77,77,0.3)",
              opacity: swipeProgress,
              transition: "opacity 0.1s",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  urgent,
}: {
  icon: string;
  label: string;
  urgent?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 100,
        background: "var(--bg-3)",
        border: "1px solid #2a2a2a",
      }}
    >
      <span style={{ fontSize: 12 }}>{icon}</span>
      <span
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: 12,
          color: urgent ? "#ff4d4d" : "var(--ink-3)",
        }}
      >
        {label}
      </span>
    </div>
  );
}
