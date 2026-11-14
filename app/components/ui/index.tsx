import clsx from "clsx";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import type { Intent } from "@/types";

// ── Spinner ───────────────────────────────────────────────────────────────────

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "w-5 h-5 rounded-full border-2 border-transparent border-t-current animate-spin",
        className,
      )}
    />
  );
}

// ── Buttons ───────────────────────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
}

export function PrimaryButton({
  loading,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        "w-full flex items-center justify-center gap-2 px-6 py-3",
        "bg-accent text-black font-display font-bold text-xs uppercase tracking-widest rounded-sm",
        "transition-opacity active:scale-[0.97]",
        disabled || loading
          ? "opacity-40 cursor-not-allowed"
          : "hover:opacity-90",
        className,
      )}
    >
      {loading ? <Spinner className="border-t-black" /> : children}
    </button>
  );
}

export function GhostButton({ children, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "w-full flex items-center justify-center gap-2 px-4 py-2.5",
        "bg-transparent text-ink-2 border border-border rounded-sm",
        "font-body text-sm transition-colors active:scale-[0.97]",
        "hover:border-border-light hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function DangerButton({ children, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "w-full flex items-center justify-center gap-2 px-4 py-2.5",
        "bg-red-500/10 text-red-400 border border-red-500/20 rounded-sm",
        "font-body text-sm transition-opacity active:scale-[0.97]",
        "hover:opacity-80",
        className,
      )}
    >
      {children}
    </button>
  );
}

// ── Intent badge ──────────────────────────────────────────────────────────────

const intentStyles: Record<Intent, string> = {
  drinks: "bg-[rgba(255,183,77,0.15)] text-[#ffb74d]",
  party: "bg-accent-dim text-accent",
  chill: "bg-[rgba(77,182,255,0.12)] text-[#4db6ff]",
  hookup: "bg-[rgba(255,77,120,0.12)] text-[#ff4d78]",
};

export function IntentBadge({ intent }: { intent: Intent }) {
  return (
    <span
      className={clsx(
        "inline-block px-2 py-0.5 rounded font-display font-bold text-[10px] uppercase tracking-[0.08em]",
        intentStyles[intent],
      )}
    >
      {intent}
    </span>
  );
}

// ── Error message ─────────────────────────────────────────────────────────────

export function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="px-3.5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm text-sm animate-fade-in">
      {message}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────

const avatarColors = [
  "bg-purple-900",
  "bg-blue-900",
  "bg-teal-900",
  "bg-rose-900",
  "bg-amber-900",
];

export function Avatar({
  name,
  photo,
  size = "md",
  index = 0,
}: {
  name: string;
  photo?: string;
  size?: "sm" | "md";
  index?: number;
}) {
  const sizeClass = size === "sm" ? "w-7 h-7 text-[10px]" : "w-8 h-8 text-xs";
  const color = avatarColors[index % avatarColors.length];

  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={name}
        className={clsx(
          "rounded-full border-2 border-bg-2 object-cover",
          sizeClass,
        )}
      />
    );
  }

  return (
    <div
      className={clsx(
        "rounded-full border-2 border-bg-2 flex items-center justify-center font-semibold text-ink",
        sizeClass,
        color,
      )}
    >
      {name[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

// ── Capacity bar ──────────────────────────────────────────────────────────────

export function CapacityBar({
  current,
  max,
}: {
  current: number;
  max: number;
}) {
  const pct = Math.min((current / max) * 100, 100);
  const isAlmostFull = pct >= 80;

  return (
    <div className="h-1 bg-bg-3 rounded-full overflow-hidden">
      <div
        className={clsx(
          "h-full rounded-full transition-all duration-300",
          isAlmostFull ? "bg-red-400" : "bg-accent",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
