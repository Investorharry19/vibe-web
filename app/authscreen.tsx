"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useAuth } from "@/store/auth";
import { authApi } from "@/lib/api";
import { Spinner, ErrorMessage } from "@/components/ui";

const INTENTS = [
  { label: "drinks nearby", color: "#ffb74d" },
  { label: "chill · 3 spots", color: "#4db6ff" },
  { label: "party · open", color: "#e8ff47" },
];

export default function AuthScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vibeCount] = useState(() => Math.floor(Math.random() * 20) + 8);

  async function handleSuccess(credentialResponse: { credential?: string }) {
    if (!credentialResponse.credential) {
      setError("No credential returned from Google");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await authApi.google(
        credentialResponse.credential,
      );
      login(token, user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="h-full w-full flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(232,255,71,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#e8ff47 1px, transparent 1px), linear-gradient(90deg, #e8ff47 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {[
        "top-5 left-5 border-t border-l",
        "top-5 right-5 border-t border-r",
        "bottom-5 left-5 border-b border-l",
        "bottom-5 right-5 border-b border-r",
      ].map((cls, i) => (
        <div
          key={i}
          className={`absolute w-5 h-5 ${cls} opacity-20`}
          style={{ borderColor: "#e8ff47" }}
        />
      ))}

      <div
        className="relative z-10 flex flex-col items-center w-full px-8"
        style={{
          maxWidth: 340,
          gap: 32,
          animation: "fadeUp 500ms ease forwards",
        }}
      >
        <div className="flex flex-col items-center" style={{ gap: 10 }}>
          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: 80,
              color: "#e8ff47",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            vibe
          </h1>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 300,
              fontSize: 12,
              color: "var(--ink-3)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            find your people
          </p>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {INTENTS.map(({ label, color }) => (
            <span
              key={label}
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 11,
                color: "var(--ink-3)",
                padding: "4px 12px",
                borderRadius: 100,
                border: "1px solid #1e1e1e",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ color, fontSize: 8 }}>●</span>
              {label}
            </span>
          ))}
        </div>

        <div className="w-full flex items-center gap-3">
          <div
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, #2a2a2a, transparent)",
            }}
          />
          <div
            style={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "var(--ink-4)",
            }}
          />
          <div
            className="flex-1 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, #2a2a2a, transparent)",
            }}
          />
        </div>

        <div className="w-full flex flex-col items-center" style={{ gap: 12 }}>
          {loading ? (
            <div className="flex flex-col items-center" style={{ gap: 10 }}>
              <Spinner className="border-t-[#e8ff47]" />
              <p
                style={{
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 12,
                  color: "var(--ink-3)",
                }}
              >
                signing you in...
              </p>
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => setError("Google sign in failed")}
                theme="filled_black"
                shape="pill"
                size="large"
                text="continue_with"
                width="280"
              />
            </div>
          )}

          {!loading && (
            <div
              className="flex items-center"
              style={{
                gap: 7,
                fontFamily: "DM Sans, sans-serif",
                fontSize: 12,
                color: "var(--ink-3)",
                padding: "6px 14px",
                borderRadius: 100,
                border: "1px solid #1a1a1a",
              }}
            >
              <LiveDot />
              {vibeCount} vibes happening right now
            </div>
          )}

          <ErrorMessage message={error} />
        </div>

        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 11,
            color: "#3a3a3a",
            textAlign: "center",
            lineHeight: 1.8,
          }}
        >
          by signing in you agree to our terms.
          <br />
          vibes expire. good times don&apos;t.
        </p>
      </div>
    </div>
  );
}

function LiveDot() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "#e8ff47",
        animation: "pulse 2s ease-in-out infinite",
        flexShrink: 0,
      }}
    />
  );
}
