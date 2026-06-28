import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/admin";

export async function releaseExpiredInventory(): Promise<number> {
  if (!hasSupabaseConfig()) return 0;

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("release_expired_inventory");

  if (error) {
    console.error("[inventory] release_expired_inventory:", error);
    return 0;
  }

  return typeof data === "number" ? data : 0;
}

export async function reserveListingInventory(
  listingId: string,
  orderId: string,
  quantity: number,
  expiresAt: string
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("reserve_listing_inventory", {
    p_listing_id: listingId,
    p_order_id: orderId,
    p_quantity: quantity,
    p_expires_at: expiresAt,
  });

  if (error) {
    console.error("[inventory] reserve_listing_inventory:", error);
    return false;
  }

  return data === true;
}

export async function reserveCategoryInventory(
  categoryId: string,
  orderId: string,
  quantity: number,
  expiresAt: string
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("reserve_category_inventory", {
    p_category_id: categoryId,
    p_order_id: orderId,
    p_quantity: quantity,
    p_expires_at: expiresAt,
  });

  if (error) {
    console.error("[inventory] reserve_category_inventory:", error);
    return false;
  }

  return data === true;
}

export async function releaseOrderInventory(orderId: string): Promise<number> {
  if (!hasSupabaseConfig()) return 0;

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("release_order_inventory", {
    p_order_id: orderId,
  });

  if (error) {
    console.error("[inventory] release_order_inventory:", error);
    return 0;
  }

  return typeof data === "number" ? data : 0;
}

export async function finalizeOrderInventory(orderId: string): Promise<number> {
  if (!hasSupabaseConfig()) return 0;

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("finalize_order_inventory", {
    p_order_id: orderId,
  });

  if (error) {
    console.error("[inventory] finalize_order_inventory:", error);
    return 0;
  }

  return typeof data === "number" ? data : 0;
}

export async function extendOrderHold(
  orderId: string,
  expiresAt: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.rpc("extend_order_hold", {
    p_order_id: orderId,
    p_expires_at: expiresAt,
  });

  if (error) {
    console.error("[inventory] extend_order_hold:", error);
  }
}

export async function reserveCheckoutItems(
  orderId: string,
  items: {
    listingId?: string;
    categoryId?: string;
    quantity: number;
  }[],
  expiresAt: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  for (const item of items) {
    if (item.listingId) {
      const ok = await reserveListingInventory(
        item.listingId,
        orderId,
        item.quantity,
        expiresAt
      );
      if (!ok) {
        await releaseOrderInventory(orderId);
        return {
          ok: false,
          message: "Those tickets are no longer available. Please choose another listing.",
        };
      }
      continue;
    }

    if (item.categoryId) {
      const ok = await reserveCategoryInventory(
        item.categoryId,
        orderId,
        item.quantity,
        expiresAt
      );
      if (!ok) {
        await releaseOrderInventory(orderId);
        return {
          ok: false,
          message: "Those tickets are no longer available. Please choose another option.",
        };
      }
    }
  }

  return { ok: true };
}
