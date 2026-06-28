import { formatOrderItemLabel } from "@/lib/orders/format-order-item";
import { formatPrice } from "@/lib/utils";
import { escapeHtml } from "@/emails/utils";
import type { EmailOrderItem } from "@/emails/types";

function lineTotal(item: EmailOrderItem): number {
  return item.quantity * item.unitPrice;
}

export function formatEmailItemsText(
  items: EmailOrderItem[],
  currency = "USD"
): string {
  return items
    .map((item) => {
      const label = formatOrderItemLabel(item);
      const detail =
        item.categoryName && label !== item.categoryName
          ? `${label} (${item.categoryName})`
          : label;
      return `  • ${detail} × ${item.quantity} — ${formatPrice(lineTotal(item), currency)}`;
    })
    .join("\n");
}

export function renderEmailItemsTable(
  items: EmailOrderItem[],
  currency = "USD"
): string {
  const rows = items
    .map((item) => {
      const label = escapeHtml(formatOrderItemLabel(item));
      const category =
        item.categoryName &&
        formatOrderItemLabel(item) !== item.categoryName.trim()
          ? `<div style="margin:4px 0 0;font-size:13px;color:#64748b;">${escapeHtml(item.categoryName)}</div>`
          : "";
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;vertical-align:top;">
            <div style="font-size:15px;font-weight:600;color:#0f172a;">${label}</div>
            ${category}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #e2e8f0;text-align:center;color:#0f172a;font-size:15px;">${item.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;text-align:right;color:#0f172a;font-size:15px;white-space:nowrap;">${escapeHtml(formatPrice(lineTotal(item), currency))}</td>
        </tr>`;
    })
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <thead>
        <tr>
          <th align="left" style="padding:0 0 8px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;">Seats</th>
          <th align="center" style="padding:0 8px 8px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;">Qty</th>
          <th align="right" style="padding:0 0 8px;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;">Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}
