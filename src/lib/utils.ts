import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a CSS rule for custom table colors by injecting a style tag into the document head
 * @param color The custom color to apply
 * @returns A unique identifier for the color (for debugging/reference)
 */
export function createCustomTableColor(color: string): string {
  // Only run in client environment
  if (typeof document === 'undefined') return '';

  const id = `custom-table-color-${color.replace('#', '')}`;

  // Check if we've already created this style
  if (document.getElementById(id)) return id;

  // Create style element
  const style = document.createElement('style');
  style.id = id;
  style.innerHTML = `
    [data-table-color="${color}"] {
      --table-color: ${color};
    }
  `;

  // Add to document head
  document.head.appendChild(style);

  return id;
}
