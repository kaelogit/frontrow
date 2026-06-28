-- Optional "was" price for viagogo-style deal display
ALTER TABLE ticket_listings ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(12, 2);
