import { type ClassValue } from "clsx";
/**
 * Combines class names with tailwind-merge for conflict resolution
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export declare function cn(...inputs: ClassValue[]): string;
/**
 * Calculates gross rental yield as a percentage
 * Formula: (weeklyRent * 52 / price) * 100
 * @param price - Property purchase price
 * @param weeklyRent - Weekly rental income
 * @returns Gross yield percentage
 */
export declare function calculateGrossYield(price: number, weeklyRent: number): number;
/**
 * Formats a number as Australian Dollar currency
 * @param amount - Amount to format
 * @returns Formatted AUD string (e.g., "$1,234,567.00")
 */
export declare function formatAUD(amount: number): string;
/**
 * Formats a number as a percentage
 * @param value - Value to format (already as percentage, e.g., 5.5 for 5.5%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., "5.50%")
 */
export declare function formatPercent(value: number, decimals?: number): string;
//# sourceMappingURL=index.d.ts.map