"use client";

import type { Page } from "@/types";

interface Props {
  current: Page;
  onChange: (page: Page) => void;
  requestCount?: number;
  hidden?: boolean;
}

const TABS: { id: Page; label: string; icon: React.ReactNode }[] = [
  {
    id: "map",
    label: "Map",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20}>
        <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
      </svg>
    ),
  },
  {
    id: "explore",
    label: "Explore",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20}>
        <path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z" />
      </svg>
    ),
  },
  {
    id: "requests",
    label: "Requests",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20}>
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20}>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
];

export default function FloatingNav({
  current,
  onChange,
  requestCount = 0,
  hidden = false,
}: Props) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 32,
        left: "50%",
        transform: `translateX(-50%) translateY(${hidden ? 120 : 0}px)`,
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto",
        transition:
          "transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
        zIndex: 800,
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 100,
        padding: "6px 8px",
        display: "flex",
        alignItems: "center",
        gap: 2,
        boxShadow: "0 8px 32px var(--shadow)",
        backdropFilter: "blur(12px)",
      }}
    >
      {TABS.map((tab) => {
        const isActive = current === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            aria-label={tab.label}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: isActive ? 7 : 0,
              padding: isActive ? "9px 18px" : "9px 14px",
              borderRadius: 100,
              border: "none",
              background: isActive ? "#e8ff47" : "transparent",
              color: isActive ? "#000" : "var(--ink-3)",
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.175,0.885,0.32,1.275)",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {tab.icon}

            {/* Label — only shown when active */}
            <span
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.04em",
                maxWidth: isActive ? 80 : 0,
                opacity: isActive ? 1 : 0,
                overflow: "hidden",
                transition: "max-width 0.25s ease, opacity 0.2s ease",
              }}
            >
              {tab.label}
            </span>

            {/* Request badge */}
            {tab.id === "requests" && requestCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  right: isActive ? 12 : 6,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#ff4d4d",
                  border: "2px solid #111",
                  transition: "right 0.25s ease",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
