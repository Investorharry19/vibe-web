"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { LatLng } from "leaflet";
import type { Vibe, Intent, User } from "@/types";
import { useAuth } from "@/store/auth";
import { useGeolocation } from "@/hooks/useGeoLocation";
import { useSocket, disconnectSocket } from "@/hooks/useSocket";
import { vibeApi } from "@/lib/api";
import { intentPins, myPin, createPin } from "@/lib/pins";
import VibePanel from "@/components/vibe/VibePanel";
import CreateVibeDrawer from "@/components/vibe/CreateVibeDrawer";
import RequestQueue from "@/components/vibe/RequestQueue";
import ChatPanel from "@/components/chat/ChatPanel";
import VibeFAB from "@/components/vibe/VibeFAB";

const FILTERS: Array<Intent | "all"> = [
  "all",
  "drinks",
  "party",
  "chill",
  "hookup",
];

interface PendingRequest {
  vibeId: string;
  userId: string;
}

function RecenterOnce({
  position,
}: {
  position: { lat: number; lng: number };
}) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (!done.current) {
      map.setView([position.lat, position.lng], 15);
      done.current = true;
    }
  }, [map, position]);
  return null;
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (latlng: LatLng) => void;
}) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

export default function MapClient({
  onModalChange,
}: {
  onModalChange?: (open: boolean) => void;
}) {
  const { token, user, logout } = useAuth();
  const { position } = useGeolocation();
  const { on } = useSocket(token);

  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [filter, setFilter] = useState<Intent | "all">("all");
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
  const [activeChat, setActiveChat] = useState<Vibe | null>(null);
  const [creating, setCreating] = useState(false);
  const [createPos, setCreatePos] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loadingVibes, setLoadingVibes] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const loadVibes = useCallback(async () => {
    if (!token || !position) return;
    setLoadingVibes(true);
    try {
      const params = filter !== "all" ? { intent: filter } : {};
      const { vibes } = await vibeApi.getNearby(
        token,
        position.lat,
        position.lng,
        params,
      );
      setVibes(vibes);
    } catch (err) {
      console.error("[map] failed to load vibes:", err);
    } finally {
      setLoadingVibes(false);
    }
  }, [token, position, filter]);

  useEffect(() => {
    loadVibes();
  }, [loadVibes]);

  // Socket listeners
  useEffect(() => {
    const offCreated = on("vibe_created", () => loadVibes());
    const offExpired = on("vibe_expired", ({ vibeId }) => {
      setVibes((v) => v.filter((x) => x._id !== vibeId));
      if (selectedVibe?._id === vibeId) setSelectedVibe(null);
      if (activeChat?._id === vibeId) setActiveChat(null);
    });
    const offReqReceived = on("request_received", ({ vibeId, userId }) => {
      const isMyVibe = vibes.some((v) => {
        const hostId =
          typeof v.hostId === "object" ? (v.hostId as User)._id : v.hostId;
        return v._id === vibeId && hostId === user?._id;
      });
      if (isMyVibe)
        setPendingRequests((p) => [
          ...p.filter((r) => r.userId !== userId),
          { vibeId, userId },
        ]);
    });
    const offApproved = on("request_approved", () => loadVibes());
    return () => {
      offCreated();
      offExpired();
      offReqReceived();
      offApproved();
    };
  }, [vibes, user?._id, selectedVibe, activeChat]);

  function handleMapClick(latlng: LatLng) {
    if (creating) {
      setCreatePos({ lat: latlng.lat, lng: latlng.lng });
    } else {
      setSelectedVibe(null);
      onModalChange?.(false);
    }
  }

  async function handlePinClick(vibe: Vibe) {
    if (!token) return;
    try {
      const { vibe: full } = await vibeApi.getById(token, vibe._id);
      setSelectedVibe(full);
    } catch {
      setSelectedVibe(vibe);
    }
    setCreating(false);
    onModalChange?.(true);
  }

  function handleVibeCreated(vibe: Vibe) {
    setVibes((v) => [vibe, ...v]);
    setCreating(false);
    setCreatePos(null);
    onModalChange?.(false);
  }

  function handleClosePanel() {
    setSelectedVibe(null);
    onModalChange?.(false);
  }

  function handleOpenChat(vibe: Vibe) {
    setActiveChat(vibe);
    setSelectedVibe(null);
    onModalChange?.(true);
  }

  function handleCloseChat() {
    setActiveChat(null);
    onModalChange?.(false);
  }

  function handleLogout() {
    disconnectSocket();
    logout();
  }

  const filtered =
    filter === "all" ? vibes : vibes.filter((v) => v.intent === filter);
  const defaultCenter: [number, number] = position
    ? [position.lat, position.lng]
    : [51.505, -0.09];

  if (activeChat) {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <ChatPanel vibe={activeChat} onClose={handleCloseChat} />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Map */}
      <MapContainer
        center={defaultCenter}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        ref={mapRef as React.RefObject<L.Map>}
      >
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {position && <RecenterOnce position={position} />}
        <MapClickHandler onMapClick={handleMapClick} />

        {/* My position */}
        {position && (
          <Marker position={[position.lat, position.lng]} icon={myPin} />
        )}

        {/* Drop preview pin */}
        {createPos && (
          <Marker position={[createPos.lat, createPos.lng]} icon={createPin} />
        )}

        {/* Vibe pins */}
        {filtered.map((vibe) => (
          <Marker
            key={vibe._id}
            position={[
              vibe.location.coordinates[1],
              vibe.location.coordinates[0],
            ]}
            icon={intentPins[vibe.intent]}
            eventHandlers={{ click: () => handlePinClick(vibe) }}
          />
        ))}
      </MapContainer>

      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          display: "flex",
          gap: 8,
          zIndex: 800,
          pointerEvents: "none",
        }}
      >
        {/* Logo */}
        <div
          style={{
            background: "var(--bg-2)",
            border: "1px solid #2a2a2a",
            borderRadius: 8,
            padding: "8px 14px",
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: 18,
            color: "#e8ff47",
            pointerEvents: "auto",
            flexShrink: 0,
          }}
        >
          vibe
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            flex: 1,
            pointerEvents: "auto",
            scrollbarWidth: "none",
          }}
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setSelectedVibe(null);
              }}
              style={{
                background: filter === f ? "#e8ff47" : "var(--bg-2)",
                color: filter === f ? "#000" : "var(--ink-3)",
                border: `1px solid ${filter === f ? "transparent" : "var(--border)"}`,
                padding: "8px 12px",
                borderRadius: 8,
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* User / logout */}
        <button
          onClick={handleLogout}
          style={{
            background: "var(--bg-2)",
            border: "1px solid #2a2a2a",
            borderRadius: 8,
            padding: "8px 12px",
            color: "var(--ink-3)",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
            cursor: "pointer",
            pointerEvents: "auto",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          {user?.name?.split(" ")[0] ?? "me"} ↗
        </button>
      </div>

      {/* Vibe count */}
      <div
        style={{
          position: "absolute",
          bottom: selectedVibe || (creating && createPos) ? 320 : 100,
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--bg-2)",
          border: "1px solid #2a2a2a",
          borderRadius: 100,
          padding: "6px 14px",
          fontFamily: "DM Sans, sans-serif",
          fontSize: 12,
          color: "var(--ink-3)",
          zIndex: 800,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          transition: "bottom 250ms ease",
        }}
      >
        {loadingVibes
          ? "loading..."
          : `${filtered.length} vibe${filtered.length !== 1 ? "s" : ""} nearby`}
      </div>

      {/* Create hint */}
      {creating && !createPos && (
        <div
          style={{
            position: "absolute",
            bottom: 110,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--bg-2)",
            border: "1px solid #2a2a2a",
            borderRadius: 100,
            padding: "8px 16px",
            fontFamily: "DM Sans, sans-serif",
            fontSize: 12,
            color: "var(--ink-3)",
            zIndex: 800,
            whiteSpace: "nowrap",
            animation: "fadeIn 200ms ease",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          tap the map to drop your vibe
          <button
            onClick={() => setCreating(false)}
            style={{
              background: "none",
              border: "none",
              color: "var(--ink-3)",
              cursor: "pointer",
              fontSize: 16,
              lineHeight: 1,
              padding: 0,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* FAB */}
      {!selectedVibe && (
        <VibeFAB
          onDropVibe={() => {
            setCreating(true);
            setSelectedVibe(null);
            setCreatePos(null);
            onModalChange?.(true);
          }}
          onLocate={() => {
            if (position && mapRef.current)
              mapRef.current.setView([position.lat, position.lng], 15);
          }}
          onRefresh={() => loadVibes()}
        />
      )}

      {/* Pending requests */}
      {pendingRequests.length > 0 && !selectedVibe && !creating && (
        <RequestQueue
          requests={pendingRequests}
          onUpdate={() => {
            setPendingRequests([]);
            loadVibes();
          }}
        />
      )}

      {/* Create drawer */}
      {creating && createPos && (
        <CreateVibeDrawer
          position={createPos}
          onClose={() => {
            setCreating(false);
            setCreatePos(null);
            onModalChange?.(false);
          }}
          onCreated={handleVibeCreated}
        />
      )}

      {/* Vibe detail panel */}
      {selectedVibe && !creating && (
        <VibePanel
          vibe={selectedVibe}
          onClose={handleClosePanel}
          onOpenChat={handleOpenChat}
          onRequestSent={handleClosePanel}
        />
      )}
    </div>
  );
}
