export type Intent = "drinks" | "party" | "chill" | "hookup";
export type Page = "map" | "explore" | "requests" | "profile";

export interface User {
  _id: string;
  name: string;
  photo?: string;
  googleId: string;
  isVerified: boolean;
  rating: number;
  isBanned: boolean;
  createdAt: string;
}

export interface VibeRequest {
  userId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Vibe {
  _id: string;
  hostId: User | string;
  title: string;
  intent: Intent;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  maxPeople: number;
  participants: (User | string)[];
  requests?: VibeRequest[];
  expiresAt: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  vibeId: string;
  senderId: { _id: string; name: string } | string;
  message: string;
  createdAt: string;
  expiresAt: string;
}

// Socket event payloads
export interface VibeCreatedEvent {
  vibeId: string;
  title: string;
  intent: Intent;
  coordinates: [number, number];
  expiresAt: string;
}

export interface RequestReceivedEvent {
  vibeId: string;
  userId: string;
}

export interface RequestRespondedEvent {
  vibeId: string;
  userId: string;
}

export interface VibeExpiredEvent {
  vibeId: string;
}
