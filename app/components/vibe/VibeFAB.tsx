"use client";

import { useState, useCallback } from "react";

const RippleStyle = `
@keyframes fab-ripple {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}
`;

interface Props {
  onDropVibe: () => void; // open create flow
  onLocate: () => void; // recenter map on user
  onRefresh: () => void; // reload nearby vibes
}

interface FabOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  onAction: () => void;
}

export default function VibeFAB({ onDropVibe, onLocate, onRefresh }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [rippling, setRippling] = useState(false);

  const triggerRipple = useCallback(() => {
    setRippling(false);
    requestAnimationFrame(() => setRippling(true));
    setTimeout(() => setRippling(false), 600);
  }, []);

  const handleMain = () => {
    triggerRipple();
    setIsOpen((o) => !o);
  };

  const closeAndRun = (cb: () => void) => {
    setIsOpen(false);
    cb();
  };

  const options: FabOption[] = [
    {
      id: "drop",
      label: "Drop a vibe",
      icon: (
        <svg viewBox="0 0 24 24" fill="#e8ff47" width={22} height={22}>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      ),
      onAction: () => closeAndRun(onDropVibe),
    },
    {
      id: "refresh",
      label: "Refresh vibes",
      icon: (
        <svg viewBox="0 0 24 24" fill="#e8ff47" width={22} height={22}>
          <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
        </svg>
      ),
      onAction: () => closeAndRun(onRefresh),
    },
    {
      id: "locate",
      label: "Find my location",
      icon: (
        <svg viewBox="0 0 24 24" fill="#e8ff47" width={22} height={22}>
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
        </svg>
      ),
      onAction: () => closeAndRun(onLocate),
    },
  ];

  return (
    <>
      <style>{RippleStyle}</style>
      <div style={{ position: "absolute", bottom: 32, right: 20, zIndex: 900 }}>
        {/* Option buttons */}
        <div
          style={{
            position: "absolute",
            bottom: 68,
            right: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 14,
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "translateY(0)" : "translateY(10px)",
            pointerEvents: isOpen ? "all" : "none",
            transition: "opacity 0.25s ease, transform 0.25s ease",
          }}
        >
          {options.map((opt) => (
            <FabOptionRow key={opt.id} option={opt} />
          ))}
        </div>

        {/* Main FAB */}
        <button
          onClick={handleMain}
          aria-label={isOpen ? "Close options" : "Open vibe options"}
          aria-expanded={isOpen}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            backgroundColor: "#e8ff47",
            boxShadow: "0 6px 20px rgba(232,255,71,0.25)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
            transition:
              "transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
            e.currentTarget.style.boxShadow =
              "0 10px 24px rgba(232,255,71,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
            e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(232,255,71,0.25)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.97)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "";
          }}
        >
          {/* Shimmer */}
          <span
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at center, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* Icon — plus rotates to × */}
          <svg
            viewBox="0 0 24 24"
            fill="#000"
            width={24}
            height={24}
            style={{
              zIndex: 2,
              transition: "transform 0.3s ease",
              transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
            }}
          >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>

          {/* Ripple */}
          {rippling && (
            <span
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 160,
                height: 160,
                backgroundColor: "rgba(0,0,0,0.15)",
                borderRadius: "50%",
                animation: "fab-ripple 0.6s forwards",
                zIndex: 0,
              }}
            />
          )}
        </button>
      </div>
    </>
  );
}

function FabOptionRow({ option }: { option: FabOption }) {
  const [labelVisible, setLabelVisible] = useState(false);

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 10 }}
      onMouseEnter={() => setLabelVisible(true)}
      onMouseLeave={() => setLabelVisible(false)}
    >
      {/* Label */}
      <span
        style={{
          backgroundColor: "var(--bg-2)",
          border: "1px solid #2a2a2a",
          color: "var(--ink)",
          padding: "6px 12px",
          borderRadius: 6,
          fontFamily: "DM Sans, sans-serif",
          fontSize: 12,
          whiteSpace: "nowrap",
          opacity: labelVisible ? 1 : 0,
          transform: labelVisible ? "translateX(0)" : "translateX(8px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {option.label}
      </span>

      {/* Option button */}
      <button
        onClick={option.onAction}
        aria-label={option.label}
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          backgroundColor: "var(--bg-2)",
          border: "1px solid #2a2a2a",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          flexShrink: 0,
          transition:
            "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(232,255,71,0.15)";
          e.currentTarget.style.borderColor = "#e8ff4744";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
          e.currentTarget.style.borderColor = "var(--border)";
        }}
      >
        {option.icon}
      </button>
    </div>
  );
}
