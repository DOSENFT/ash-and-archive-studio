import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names using clsx and merges Tailwind classes intelligently.
 * This prevents class conflicts (e.g., "px-4 px-6" becomes "px-6").
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
