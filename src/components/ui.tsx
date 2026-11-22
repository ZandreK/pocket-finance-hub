import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const styles: Record<string, string> = {
    primary: "bg-brand text-black font-semibold hover:bg-brand-600",
    ghost: "bg-surface-2 text-white hover:bg-border",
    danger: "bg-rose-500/90 text-white hover:bg-rose-500",
  };
  return (
    <button
      className={`rounded-xl px-4 py-2.5 text-sm transition-colors disabled:opacity-40 ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-app rounded-t-3xl border border-border bg-surface p-5 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-muted hover:text-white"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-white outline-none focus:border-brand";

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-muted">
      {children}
    </h2>
  );
}
