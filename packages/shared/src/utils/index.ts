import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with tailwind-merge for conflict resolution
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Calculates gross rental yield as a percentage
 * Formula: (weeklyRent * 52 / price) * 100
 * @param price - Property purchase price
 * @param weeklyRent - Weekly rental income
 * @returns Gross yield percentage
 */
export function calculateGrossYield(price: number, weeklyRent: number): number {
  if (price <= 0) {
    return 0;
  }
  return ((weeklyRent * 52) / price) * 100;
}

/**
 * Formats a number as Australian Dollar currency
 * @param amount - Amount to format
 * @returns Formatted AUD string (e.g., "$1,234,567.00")
 */
export function formatAUD(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a number as a percentage
 * @param value - Value to format (already as percentage, e.g., 5.5 for 5.5%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., "5.50%")
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
