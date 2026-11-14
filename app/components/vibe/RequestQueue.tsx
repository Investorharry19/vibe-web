"use client";

import { useState } from "react";
import { useAuth } from "@/store/auth";
import { requestApi } from "@/lib/api";

interface PendingRequest {
  vibeId: string;
  userId: string;
}

interface Props {
  requests: PendingRequest[];
  onUpdate: () => void;
}

export default function RequestQueue({ requests, onUpdate }: Props) {
  if (requests.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 76,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: 380,
        background: "var(--bg-2)",
        border: "1px solid #2a2a2a",
        borderRadius: 12,
        padding: 16,
        zIndex: 900,
        animation: "fadeUp 250ms ease",
      }}
    >
      <p
        style={{
          fontFamily: "Syne, sans-serif",
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--ink-3)",
          marginBottom: 12,
        }}
      >
        {requests.length} request{requests.length !== 1 ? "s" : ""} waiting
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {requests.map((req) => (
          <RequestRow key={req.userId} req={req} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  );
}

function RequestRow({
  req,
  onUpdate,
}: {
  req: PendingRequest;
  onUpdate: () => void;
}) {
  const { token } = useAuth();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function respond(action: "approve" | "reject") {
    if (!token) return;
    setLoading(action);
    try {
      if (action === "approve")
        await requestApi.approve(token, req.vibeId, req.userId);
      else await requestApi.reject(token, req.vibeId, req.userId);
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 32,
          height: 32,
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
        {req.userId.slice(-2).toUpperCase()}
      </div>
      <span
        style={{
          flex: 1,
          fontFamily: "DM Sans, sans-serif",
          fontSize: 13,
          color: "#666",
        }}
      >
        wants to join
      </span>
      <button
        onClick={() => respond("approve")}
        disabled={!!loading}
        style={{
          padding: "5px 14px",
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
          padding: "5px 14px",
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
  );
}
