-- Inventory holds: prevent double-booking on reservation / pending payment (item 45)

CREATE TABLE inventory_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES ticket_listings(id) ON DELETE CASCADE,
  category_id UUID REFERENCES ticket_categories(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT inventory_holds_target_check CHECK (
    (listing_id IS NOT NULL AND category_id IS NULL)
    OR (listing_id IS NULL AND category_id IS NOT NULL)
  )
);

CREATE INDEX idx_inventory_holds_order_active
  ON inventory_holds(order_id)
  WHERE released_at IS NULL;

CREATE INDEX idx_inventory_holds_expires_active
  ON inventory_holds(expires_at)
  WHERE released_at IS NULL;

ALTER TABLE inventory_holds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No public inventory_holds" ON inventory_holds FOR ALL USING (false);

-- Atomically reserve listing quantity for an order
CREATE OR REPLACE FUNCTION reserve_listing_inventory(
  p_listing_id UUID,
  p_order_id UUID,
  p_quantity INTEGER,
  p_expires_at TIMESTAMPTZ
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_available INTEGER;
BEGIN
  SELECT quantity_available INTO v_available
  FROM ticket_listings
  WHERE id = p_listing_id
    AND status IN ('available', 'reserved')
  FOR UPDATE;

  IF NOT FOUND OR v_available < p_quantity THEN
    RETURN FALSE;
  END IF;

  UPDATE ticket_listings
  SET
    quantity_available = quantity_available - p_quantity,
    status = CASE
      WHEN quantity_available - p_quantity <= 0 THEN 'reserved'::ticket_status
      ELSE status
    END
  WHERE id = p_listing_id;

  INSERT INTO inventory_holds (order_id, listing_id, quantity, expires_at)
  VALUES (p_order_id, p_listing_id, p_quantity, p_expires_at);

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION reserve_category_inventory(
  p_category_id UUID,
  p_order_id UUID,
  p_quantity INTEGER,
  p_expires_at TIMESTAMPTZ
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_available INTEGER;
BEGIN
  SELECT quantity_available INTO v_available
  FROM ticket_categories
  WHERE id = p_category_id
  FOR UPDATE;

  IF NOT FOUND OR v_available < p_quantity THEN
    RETURN FALSE;
  END IF;

  UPDATE ticket_categories
  SET quantity_available = quantity_available - p_quantity
  WHERE id = p_category_id;

  INSERT INTO inventory_holds (order_id, category_id, quantity, expires_at)
  VALUES (p_order_id, p_category_id, p_quantity, p_expires_at);

  RETURN TRUE;
END;
$$;

-- Restore inventory for a single order (cancel / expiry)
CREATE OR REPLACE FUNCTION release_order_inventory(p_order_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  r RECORD;
  n INTEGER := 0;
BEGIN
  FOR r IN
    SELECT id, listing_id, category_id, quantity
    FROM inventory_holds
    WHERE order_id = p_order_id AND released_at IS NULL
    FOR UPDATE
  LOOP
    IF r.listing_id IS NOT NULL THEN
      UPDATE ticket_listings
      SET
        quantity_available = quantity_available + r.quantity,
        status = 'available'::ticket_status
      WHERE id = r.listing_id;
    ELSIF r.category_id IS NOT NULL THEN
      UPDATE ticket_categories
      SET quantity_available = quantity_available + r.quantity
      WHERE id = r.category_id;
    END IF;

    UPDATE inventory_holds SET released_at = now() WHERE id = r.id;
    n := n + 1;
  END LOOP;

  RETURN n;
END;
$$;

-- Paid orders: close holds without restoring stock
CREATE OR REPLACE FUNCTION finalize_order_inventory(p_order_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  r RECORD;
  n INTEGER := 0;
BEGIN
  FOR r IN
    SELECT id, listing_id
    FROM inventory_holds
    WHERE order_id = p_order_id AND released_at IS NULL
    FOR UPDATE
  LOOP
    IF r.listing_id IS NOT NULL THEN
      UPDATE ticket_listings
      SET status = 'sold'::ticket_status
      WHERE id = r.listing_id AND quantity_available <= 0;
    END IF;

    UPDATE inventory_holds SET released_at = now() WHERE id = r.id;
    n := n + 1;
  END LOOP;

  RETURN n;
END;
$$;

-- Expire stale orders and release their holds
CREATE OR REPLACE FUNCTION release_expired_inventory()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  r RECORD;
  n INTEGER := 0;
BEGIN
  FOR r IN
    SELECT id
    FROM orders
    WHERE reserved_until IS NOT NULL
      AND reserved_until < now()
      AND status IN ('reservation_requested', 'pending_payment')
  LOOP
    PERFORM release_order_inventory(r.id);
    UPDATE orders SET status = 'expired'::order_status WHERE id = r.id;
    n := n + 1;
  END LOOP;

  RETURN n;
END;
$$;

-- Extend hold window on order + active holds
CREATE OR REPLACE FUNCTION extend_order_hold(
  p_order_id UUID,
  p_expires_at TIMESTAMPTZ
) RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE orders SET reserved_until = p_expires_at WHERE id = p_order_id;
  UPDATE inventory_holds
  SET expires_at = p_expires_at
  WHERE order_id = p_order_id AND released_at IS NULL;
END;
$$;
