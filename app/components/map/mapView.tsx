"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div
      className="h-full w-full flex items-center justify-center"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="flex flex-col items-center" style={{ gap: 12 }}>
        <Spinner className="border-t-[#e8ff47]" />
        <p
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
            color: "var(--ink-3)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          locating you...
        </p>
      </div>
    </div>
  ),
});

interface Props {
  onModalChange?: (open: boolean) => void;
}

export default function MapView({ onModalChange }: Props) {
  return <MapClient onModalChange={onModalChange} />;
}
