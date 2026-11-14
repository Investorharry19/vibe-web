"use client";

import { useState, useEffect, useRef } from "react";
import type { Vibe, Message, User } from "@/types";
import { useAuth } from "@/store/auth";
import { useSocket } from "@/hooks/useSocket";
import { IntentBadge } from "@/components/ui";
import { getTimeLeft, formatTime } from "@/lib/time";

interface Props {
  vibe: Vibe;
  onClose: () => void;
}

export default function ChatPanel({ vibe, onClose }: Props) {
  const { token, user } = useAuth();
  const { joinRoom, leaveRoom, sendMessage, on } = useSocket(token);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    joinRoom(vibe._id);
    const offHistory = on("message_history", (history) => setMessages(history));
    const offMsg = on("receive_message", (msg) =>
      setMessages((prev) => [...prev, msg]),
    );
    const offExpired = on("vibe_expired", ({ vibeId }) => {
      if (vibeId === vibe._id) onClose();
    });

    return () => {
      offHistory();
      offMsg();
      offExpired();
      leaveRoom(vibe._id);
    };
  }, [vibe._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    sendMessage(vibe._id, input.trim());
    setInput("");
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--bg)",
        zIndex: 1100,
        display: "flex",
        flexDirection: "column",
        animation: "fadeIn 200ms ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #1a1a1a",
          background: "var(--bg-2)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--ink-3)",
            fontSize: 20,
            cursor: "pointer",
            lineHeight: 1,
            padding: "0 4px",
            flexShrink: 0,
          }}
        >
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IntentBadge intent={vibe.intent} />
            <span
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: "var(--ink)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {vibe.title}
            </span>
          </div>
          <p
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 11,
              color: "var(--ink-3)",
              marginTop: 2,
            }}
          >
            {getTimeLeft(vibe.expiresAt)} · {vibe.participants.length} people
          </p>
        </div>
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#e8ff47",
            flexShrink: 0,
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {messages.length === 0 ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 28 }}>👋</div>
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 13,
                color: "var(--ink-3)",
                textAlign: "center",
              }}
            >
              be the first to say something
            </p>
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: 11,
                color: "var(--ink-4)",
                textAlign: "center",
              }}
            >
              messages vanish when the vibe ends
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const senderId =
              typeof msg.senderId === "object"
                ? (msg.senderId as { _id: string })._id
                : msg.senderId;
            const senderName =
              typeof msg.senderId === "object"
                ? (msg.senderId as { _id: string; name: string }).name
                : "someone";
            const isMe = senderId === user?._id;
            const prevSenderId =
              i > 0
                ? typeof messages[i - 1].senderId === "object"
                  ? (messages[i - 1].senderId as { _id: string })._id
                  : messages[i - 1].senderId
                : null;
            const showName = !isMe && senderId !== prevSenderId;

            return (
              <div
                key={msg._id ?? i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMe ? "flex-end" : "flex-start",
                  marginBottom: 4,
                  animation: "fadeUp 150ms ease",
                }}
              >
                {showName && (
                  <span
                    style={{
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: 11,
                      color: "var(--ink-3)",
                      marginBottom: 2,
                      marginLeft: 4,
                    }}
                  >
                    {senderName}
                  </span>
                )}
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "8px 12px",
                    fontSize: 14,
                    lineHeight: 1.4,
                    fontFamily: "DM Sans, sans-serif",
                    background: isMe ? "#e8ff47" : "var(--bg-3)",
                    color: isMe ? "#000" : "var(--ink)",
                    fontWeight: isMe ? 500 : 400,
                    borderRadius: isMe
                      ? "14px 14px 4px 14px"
                      : "14px 14px 14px 4px",
                  }}
                >
                  {msg.message}
                </div>
                <span
                  style={{
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: 10,
                    color: "var(--ink-4)",
                    marginTop: 2,
                    marginLeft: 4,
                    marginRight: 4,
                  }}
                >
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "12px 16px 32px",
          borderTop: "1px solid #1a1a1a",
          background: "var(--bg-2)",
          display: "flex",
          gap: 8,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="say something..."
          maxLength={500}
          style={{
            flex: 1,
            background: "var(--bg-3)",
            border: "1px solid #2a2a2a",
            borderRadius: 8,
            color: "var(--ink)",
            padding: "10px 14px",
            fontSize: 14,
            fontFamily: "DM Sans, sans-serif",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#e8ff47")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: input.trim() ? "#e8ff47" : "var(--bg-3)",
            color: input.trim() ? "#000" : "var(--ink-3)",
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            cursor: input.trim() ? "pointer" : "not-allowed",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}
