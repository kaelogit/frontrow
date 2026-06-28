-- Rename nexapay_ref to generic payment external id (WalletConnect Pay, future card PSP)
ALTER TABLE orders RENAME COLUMN nexapay_ref TO payment_external_id;
