import L from "leaflet";
import type { Intent } from "@/types";

const intentColors: Record<Intent, string> = {
  drinks: "#ffb74d",
  party: "#4285F4",
  chill: "#4db6ff",
  hookup: "#ff4d78",
};

function makePin(color: string, size = 14) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2.5px solid #0a0a0a;
      box-shadow:0 0 0 3px ${color}33;
      transition:transform 0.15s;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export const intentPins: Record<Intent, L.DivIcon> = {
  drinks: makePin(intentColors.drinks),
  party: makePin(intentColors.party),
  chill: makePin(intentColors.chill),
  hookup: makePin(intentColors.hookup),
};

export const myPin = makePin("#ffffff", 12);
export const createPin = makePin("#4285F4", 16);
