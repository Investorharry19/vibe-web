"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import type {
  Message,
  VibeCreatedEvent,
  VibeExpiredEvent,
  RequestReceivedEvent,
  RequestRespondedEvent,
} from "@/types";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3000";

// Singleton socket — persists across component remounts
let globalSocket: Socket | null = null;

export interface SocketEvents {
  vibe_created: (e: VibeCreatedEvent) => void;
  vibe_expired: (e: VibeExpiredEvent) => void;
  request_received: (e: RequestReceivedEvent) => void;
  request_approved: (e: RequestRespondedEvent) => void;
  request_rejected: (e: RequestRespondedEvent) => void;
  message_history: (messages: Message[]) => void;
  receive_message: (message: Message) => void;
  error: (e: { message: string }) => void;
}

export function useSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    if (!globalSocket || globalSocket.disconnected) {
      globalSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }
    socketRef.current = globalSocket;
  }, [token]);

  const joinRoom = useCallback((vibeId: string) => {
    socketRef.current?.emit("join_room", { vibeId });
  }, []);

  const leaveRoom = useCallback((vibeId: string) => {
    socketRef.current?.emit("leave_room", { vibeId });
  }, []);

  const sendMessage = useCallback((vibeId: string, message: string) => {
    socketRef.current?.emit("send_message", { vibeId, message });
  }, []);

  function on<K extends keyof SocketEvents>(
    event: K,
    handler: SocketEvents[K],
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socketRef.current?.on(event, handler as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return () => socketRef.current?.off(event, handler as any);
  }

  return { joinRoom, leaveRoom, sendMessage, on };
}

export function disconnectSocket() {
  globalSocket?.disconnect();
  globalSocket = null;
}
