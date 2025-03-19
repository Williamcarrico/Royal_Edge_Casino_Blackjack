/**
 * @module lib/utils/format
 * @description Formatting utility functions for displaying values
 */

/**
 * Format a number as a currency string
 * @param amount The amount to format
 * @param currency The currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return formatter.format(amount);
};

/**
 * Format a number as a percentage string
 * @param value The value to format (0-1)
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format a date as a relative time string (e.g., "5 minutes ago")
 * @param date The date to format
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Convert milliseconds to appropriate time unit
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    if (hours > 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    if (minutes > 0) {
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    return 'Just now';
};

/**
 * Format a date to a readable string
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Format a number with commas for thousands separators
 * @param value The number to format
 * @returns Formatted number string
 */
export const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format a time duration in seconds to a readable string
 * @param seconds The duration in seconds
 * @returns Formatted duration string (e.g., "2m 30s")
 */
export const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (minutes === 0) {
        return `${remainingSeconds}s`;
    }

    return `${minutes}m ${remainingSeconds}s`;
};