import { cn } from "@/lib/utils";

const TIER_STYLES: Record<string, string> = {
  priority: "bg-purple text-white",
  qualified: "bg-purple/10 text-purple",
  nurture: "bg-black/[0.06] text-neutral-600",
};

const STATUS_STYLES: Record<string, string> = {
  partial: "bg-amber-100 text-amber-800",
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-indigo-100 text-indigo-800",
  "call-booked": "bg-purple/10 text-purple",
  won: "bg-emerald-100 text-emerald-800",
  lost: "bg-red-100 text-red-800",
  nurture: "bg-black/[0.06] text-neutral-600",
};

export const TierBadge = ({ tier }: { tier?: string }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
      TIER_STYLES[tier ?? ""] ?? "bg-black/[0.06] text-neutral-600"
    )}
  >
    {tier ?? "unscored"}
  </span>
);

export const StatusBadge = ({ status }: { status?: string }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
      STATUS_STYLES[status ?? ""] ?? "bg-black/[0.06] text-neutral-600"
    )}
  >
    {(status ?? "unknown").replace("-", " ")}
  </span>
);
