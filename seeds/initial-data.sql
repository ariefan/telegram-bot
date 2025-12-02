-- BPJS Chatbot Seed Data
-- This file seeds the database with sample users and debts for testing

-- Sample Users with verified BPJS numbers
INSERT INTO users (telegram_id, name, bpjs_number, phone_number, is_verified) VALUES
  ('123456789', 'Budi Santoso', '0001234567890', '08123456789', true),
  ('987654321', 'Siti Rahayu', '0009876543210', '08198765432', true),
  ('555555555', 'Ahmad Wijaya', '0005555555555', '08155555555', true),
  ('111222333', 'Dewi Lestari', '0001112223330', '08111222333', true),
  ('444555666', 'Joko Widodo', '0004445556660', '08144455566', true);

-- Sample Debts with various due dates
-- Calculate dates relative to NOW()

-- User 1: Budi Santoso - Multiple debts with various due dates
INSERT INTO debts (user_id, bpjs_number, amount, due_date, status, description) VALUES
  (1, '0001234567890', 150000, NOW() + INTERVAL '1 day', 'unpaid', 'Iuran BPJS Januari 2025'),
  (1, '0001234567890', 150000, NOW() + INTERVAL '8 days', 'unpaid', 'Iuran BPJS Februari 2025'),
  (1, '0001234567890', 150000, NOW() - INTERVAL '5 days', 'overdue', 'Iuran BPJS Desember 2024');

-- User 2: Siti Rahayu - Debt due in 7 days (should trigger 7-day reminder)
INSERT INTO debts (user_id, bpjs_number, amount, due_date, status, description) VALUES
  (2, '0009876543210', 150000, NOW() + INTERVAL '7 days', 'unpaid', 'Iuran BPJS Februari 2025'),
  (2, '0009876543210', 150000, NOW() + INTERVAL '30 days', 'unpaid', 'Iuran BPJS Maret 2025');

-- User 3: Ahmad Wijaya - Debt due in 3 days (should trigger 3-day reminder)
INSERT INTO debts (user_id, bpjs_number, amount, due_date, status, description) VALUES
  (3, '0005555555555', 150000, NOW() + INTERVAL '3 days', 'unpaid', 'Iuran BPJS Februari 2025');

-- User 4: Dewi Lestari - Paid debt (should not trigger reminders)
INSERT INTO debts (user_id, bpjs_number, amount, due_date, status, description) VALUES
  (4, '0001112223330', 150000, NOW() + INTERVAL '5 days', 'paid', 'Iuran BPJS Februari 2025');

-- User 5: Joko Widodo - Debt due in 15 days (no reminders yet)
INSERT INTO debts (user_id, bpjs_number, amount, due_date, status, description) VALUES
  (5, '0004445556660', 150000, NOW() + INTERVAL '15 days', 'unpaid', 'Iuran BPJS Februari 2025');

-- Summary of seed data:
-- - 5 users with verified BPJS numbers
-- - User 1: Has debt due tomorrow (1-day reminder), 8 days (7-day reminder soon), and overdue
-- - User 2: Has debt due in exactly 7 days (7-day reminder)
-- - User 3: Has debt due in 3 days (3-day reminder)
-- - User 4: Has paid debt (should be ignored)
-- - User 5: Has debt due in 15 days (no reminders yet)
