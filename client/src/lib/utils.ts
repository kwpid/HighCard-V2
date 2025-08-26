import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getLocalStorage = (key: string): any =>
  JSON.parse(window.localStorage.getItem(key) || "null");
const setLocalStorage = (key: string, value: any): void =>
  window.localStorage.setItem(key, JSON.stringify(value));

export { getLocalStorage, setLocalStorage };

/**
 * Get the rank image path for a given rank and division
 * @param rankName - The rank name (e.g., "Bronze", "Silver")
 * @param division - The division (e.g., "I", "II", "III") or null for ranks without divisions
 * @returns The path to the rank image
 */
export const getRankImagePath = (rankName: string, division: string | null): string => {
  if (!division) {
    // For ranks without divisions (like Supersonic Legend)
    const rankKey = rankName.toLowerCase().replace(' ', '-');
    return `/ranks/${rankKey}.png`;
  }
  
  // For ranks with divisions, format: bronze-div-i.png, silver-div-ii.png, etc.
  const rankKey = rankName.toLowerCase().replace(' ', '-');
  const divisionKey = division.toLowerCase();
  return `/ranks/${rankKey}-div-${divisionKey}.png`;
};

/**
 * Get the rank image path for display purposes (with fallback)
 * @param rankName - The rank name
 * @param division - The division or null
 * @returns The path to the rank image
 */
export const getRankImagePathWithFallback = (rankName: string, division: string | null): string => {
  return getRankImagePath(rankName, division);
};
