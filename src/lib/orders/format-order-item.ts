import type { AdminOrderItem } from "@/lib/orders/demo-store";

export function formatOrderItemLabel(item: AdminOrderItem): string {
  const parts: string[] = [];

  if (item.sectionNumber) {
    parts.push(`Section ${item.sectionNumber}`);
  }
  if (item.rowLabel) {
    parts.push(`Row ${item.rowLabel}`);
  }

  if (parts.length) return parts.join(" · ");

  if (item.categoryName?.trim()) {
    return item.categoryName.trim();
  }

  return "Ticket";
}
