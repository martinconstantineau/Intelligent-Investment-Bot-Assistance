/**
 * Fixes Issue #8: Expensive String Operations in Formatters
 * Cache Intl formatters at module level to avoid repeated instantiation
 */

const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 2
});

const numberFormatter = new Intl.NumberFormat("en-CA");

const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  dateStyle: "long",
  timeStyle: "short"
});

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  dateStyle: "short"
});

export function formatCurrency(value: number | null): string {
  return value === null ? "Not entered" : currencyFormatter.format(value);
}

export function formatNumber(value: number | null): string {
  return value === null ? "Not entered" : numberFormatter.format(value);
}

export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatEnum(value: string | null | undefined): string {
  return value ? value.replace(/_/g, " ") : "Not set";
}
