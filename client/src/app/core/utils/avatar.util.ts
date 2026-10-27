/**
 * CareerOrbit - Deterministic avatar initials & color palette generator.
 * Provides consistent visuals for company logos and candidate placeholders.
 */

export function getInitials(name?: string | null, fallback = 'CO'): string {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

const AVATAR_PALETTE = [
  { bg: 'rgba(99, 102, 241, 0.12)', text: '#818CF8' }, // Indigo
  { bg: 'rgba(236, 72, 153, 0.12)', text: '#F472B6' }, // Pink
  { bg: 'rgba(16, 185, 129, 0.12)', text: '#34D399' }, // Emerald
  { bg: 'rgba(245, 158, 11, 0.12)', text: '#FBBF24' }, // Amber
  { bg: 'rgba(6, 182, 212, 0.12)', text: '#22D3EE' },  // Cyan
  { bg: 'rgba(139, 92, 246, 0.12)', text: '#A78BFA' }  // Violet
];

function hashString(str?: string | null): number {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getCompanyBg(name?: string | null): string {
  const idx = hashString(name) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx].bg;
}

export function getCompanyTextColor(name?: string | null): string {
  const idx = hashString(name) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx].text;
}
