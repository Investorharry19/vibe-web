"use client";

import Image from "next/image";
import { useAuth } from "@/store/auth";
import { disconnectSocket } from "@/hooks/useSocket";
import { useTheme } from "@/hooks/useTheme";
import { Avatar } from "@/components/ui";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  function handleLogout() {
    disconnectSocket();
    logout();
  }

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
      {/* Header glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 200,
          background:
            "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(232,255,71,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px 20px 120px",
          position: "relative",
        }}
      >
        {/* Avatar + name */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "2px solid #2a2a2a",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {user?.photo ? (
              <Image
                src={user.photo}
                alt={user.name}
                width={80}
                height={80}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "#e8ff4718",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  fontSize: 28,
                  color: "#e8ff47",
                }}
              >
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>
          <div style={{ textAlign: "center" }}>
            <h2
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 22,
                color: "var(--ink)",
                letterSpacing: "-0.01em",
              }}
            >
              {user?.name ?? "you"}
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                marginTop: 4,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#e8ff47",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 12,
                  color: "var(--ink-3)",
                }}
              >
                active
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 28,
          }}
        >
          <StatCard value="—" label="vibes created" />
          <StatCard value="—" label="vibes joined" />
          <StatCard
            value={user?.rating?.toFixed(1) ?? "5.0"}
            label="rating"
            accent
          />
        </div>

        {/* Info section */}
        <Section title="account">
          <InfoRow label="signed in with" value="Google" />
          <InfoRow label="verified" value={user?.isVerified ? "yes ✓" : "no"} />
          <InfoRow
            label="member since"
            value={
              user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "—"
            }
          />
        </Section>

        <Section title="preferences">
          <ThemeToggleRow theme={theme} onToggle={toggleTheme} />
          <ToggleRow label="request notifications" defaultOn />
          <ToggleRow label="show me in explore" defaultOn />
        </Section>

        <Section title="account actions">
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "13px",
              background: "transparent",
              border: "1px solid #ff4d4d33",
              borderRadius: 8,
              color: "#ff4d4d",
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#ff4d4d12")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            sign out
          </button>
        </Section>
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid #1e1e1e",
        borderRadius: 12,
        padding: "14px 12px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "Syne, sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: accent ? "#e8ff47" : "var(--ink)",
          letterSpacing: "-0.02em",
          marginBottom: 4,
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: 10,
          color: "var(--ink-3)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: 10,
          color: "var(--ink-4)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {title}
      </p>
      <div
        style={{
          background: "var(--bg-2)",
          border: "1px solid #1e1e1e",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid #1a1a1a",
      }}
    >
      <span
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: 13,
          color: "var(--ink-3)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: 13,
          color: "var(--ink)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ThemeToggleRow({
  theme,
  onToggle,
}: {
  theme: "dark" | "light";
  onToggle: () => void;
}) {
  const isLight = theme === "light";
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 16 }}>{isLight ? "☀️" : "🌙"}</span>
        <span
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 13,
            color: "var(--ink-3)",
          }}
        >
          {isLight ? "light mode" : "dark mode"}
        </span>
      </div>
      <div
        style={{
          width: 36,
          height: 20,
          borderRadius: 100,
          background: isLight ? "var(--accent)" : "var(--border)",
          position: "relative",
          transition: "background 0.25s",
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: isLight ? "#000" : "var(--ink-3)",
            position: "absolute",
            top: 3,
            left: isLight ? 19 : 3,
            transition: "left 0.25s, background 0.25s",
          }}
        />
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  defaultOn,
}: {
  label: string;
  defaultOn?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid #1a1a1a",
      }}
    >
      <span
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: 13,
          color: "var(--ink-3)",
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: 36,
          height: 20,
          borderRadius: 100,
          background: defaultOn ? "#e8ff47" : "var(--border)",
          position: "relative",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: defaultOn ? "#000" : "var(--ink-3)",
            position: "absolute",
            top: 3,
            left: defaultOn ? 19 : 3,
            transition: "left 0.2s",
          }}
        />
      </div>
    </div>
  );
}
