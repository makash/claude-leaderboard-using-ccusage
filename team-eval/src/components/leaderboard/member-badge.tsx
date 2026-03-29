"use client";

type TitleTier =
  | "Getting Started"
  | "Active User"
  | "Heavy Hitter"
  | "Power User"
  | "AI Architect";

interface TierConfig {
  label: TitleTier;
  bg: string;
  text: string;
  ring: string;
}

const TIERS: TierConfig[] = [
  {
    label: "AI Architect",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    ring: "ring-amber-500/30",
  },
  {
    label: "Power User",
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    ring: "ring-purple-500/30",
  },
  {
    label: "Heavy Hitter",
    bg: "bg-cyan-500/15",
    text: "text-cyan-400",
    ring: "ring-cyan-500/30",
  },
  {
    label: "Active User",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    ring: "ring-emerald-500/30",
  },
  {
    label: "Getting Started",
    bg: "bg-zinc-500/15",
    text: "text-zinc-400",
    ring: "ring-zinc-500/30",
  },
];

export function getTier(spend: number): TierConfig {
  if (spend >= 1000) return TIERS[0];
  if (spend >= 500) return TIERS[1];
  if (spend >= 100) return TIERS[2];
  if (spend >= 25) return TIERS[3];
  return TIERS[4];
}

interface MemberBadgeProps {
  spend: number;
}

export function MemberBadge({ spend }: MemberBadgeProps) {
  const tier = getTier(spend);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${tier.bg} ${tier.text} ${tier.ring}`}
    >
      {tier.label}
    </span>
  );
}
