export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

export const COMPETITION_COLORS: Record<"low" | "medium" | "high", string> = {
  low: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border border-amber-200",
  high: "bg-rose-50 text-rose-700 border border-rose-200",
};

export const STATUS_COLORS = {
  ok: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  error: "bg-rose-50 text-rose-700 border border-rose-200",
};
