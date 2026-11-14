"use client";

import { useState } from "react";
import { AuthProvider, useAuth } from "@/store/auth";
import { useGeolocation } from "@/hooks/useGeoLocation";
import AuthScreen from "./authscreen";
import MapView from "@/components/map/mapView";
import ExplorePage from "@/components/explore/ExplorePage";
import RequestsPage from "@/components/requests/RequestsPage";
import ProfilePage from "@/components/profile/ProfilePage";
import FloatingNav from "@/components/nav/FloatingNav";
import type { Page } from "@/types";

function AppShell() {
  const { isAuthed } = useAuth();
  const [page, setPage] = useState<Page>("map");
  const [navHidden, setNavHidden] = useState(false);

  // Hoist geolocation so position is ready before explore/map mount
  const { position } = useGeolocation();

  if (!isAuthed) return <AuthScreen />;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Map — always mounted to preserve socket/geo state */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          visibility: page === "map" ? "visible" : "hidden",
          zIndex: page === "map" ? 1 : 0,
        }}
      >
        <MapView onModalChange={setNavHidden} />
      </div>

      {page === "explore" && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <ExplorePage position={position} />
        </div>
      )}

      {page === "requests" && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <RequestsPage />
        </div>
      )}

      {page === "profile" && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <ProfilePage />
        </div>
      )}

      <FloatingNav
        current={page}
        onChange={(p) => {
          setPage(p);
          setNavHidden(false);
        }}
        hidden={navHidden}
      />
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <main className="h-full w-full">
        <AppShell />
      </main>
    </AuthProvider>
  );
}
