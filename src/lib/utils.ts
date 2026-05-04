import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomPart}`;
}

export function csvExport(headers: string[], rows: string[][], filename: string): void {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    const crores = amount / 10000000;
    return `Rs. ${crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `Rs. ${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(2)}L`;
  } else if (amount >= 1000) {
    const thousands = amount / 1000;
    return `Rs. ${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`;
  } else {
    return `Rs. ${amount}`;
  }
}

export function formatCurrencyFull(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
