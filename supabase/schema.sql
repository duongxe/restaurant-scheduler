-- ================================================================
-- Sushi Revolution Roster — Supabase Schema
-- Run this entire file in the Supabase SQL Editor.
-- ================================================================

-- ================================================================
-- EMPLOYEES
-- (id = auth.users.id — managed via Vercel API routes)
-- ================================================================
CREATE TABLE IF NOT EXISTS employees (
  id         UUID    PRIMARY KEY,
  name       TEXT    NOT NULL,
  username   TEXT    UNIQUE NOT NULL,
  role       TEXT    NOT NULL,
  roles      TEXT[]  NOT NULL,
  level      INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 0 AND 4),
  is_owner   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- HELPER: check if current user is the owner
-- (must be created AFTER the employees table)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_owner()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM employees
    WHERE id = auth.uid() AND is_owner = TRUE
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE POLICY "authenticated_read_employees" ON employees
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "owner_write_employees" ON employees
  FOR ALL USING (is_owner());

-- ================================================================
-- PAY LEVEL RATES
-- ================================================================
CREATE TABLE IF NOT EXISTS pay_level_rates (
  level       INTEGER      PRIMARY KEY CHECK (level BETWEEN 0 AND 4),
  hourly_rate DECIMAL(10,2) NOT NULL
);

ALTER TABLE pay_level_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_pay_level_rates" ON pay_level_rates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "owner_write_pay_level_rates" ON pay_level_rates
  FOR ALL USING (is_owner());

INSERT INTO pay_level_rates (level, hourly_rate) VALUES
  (0, 23.50), (1, 25.00), (2, 27.00), (3, 30.00), (4, 32.00)
ON CONFLICT (level) DO NOTHING;

-- ================================================================
-- PENALTY RATES  (single row, id = 1)
-- ================================================================
CREATE TABLE IF NOT EXISTS penalty_rates (
  id             INTEGER      PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  weekday        DECIMAL(5,3) NOT NULL DEFAULT 1.0,
  saturday       DECIMAL(5,3) NOT NULL DEFAULT 1.25,
  sunday         DECIMAL(5,3) NOT NULL DEFAULT 1.5,
  public_holiday DECIMAL(5,3) NOT NULL DEFAULT 2.25
);

ALTER TABLE penalty_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_penalty_rates" ON penalty_rates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "owner_write_penalty_rates" ON penalty_rates
  FOR ALL USING (is_owner());

INSERT INTO penalty_rates (id, weekday, saturday, sunday, public_holiday)
  VALUES (1, 1.0, 1.25, 1.5, 2.25)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- WEEK SCHEDULES
-- ================================================================
CREATE TABLE IF NOT EXISTS week_schedules (
  id              UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start      DATE  UNIQUE NOT NULL,
  night_end_times JSONB NOT NULL DEFAULT '{}',
  public_holidays TEXT[] NOT NULL DEFAULT '{}'
);

ALTER TABLE week_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_week_schedules" ON week_schedules
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "owner_write_week_schedules" ON week_schedules
  FOR ALL USING (is_owner());

-- ================================================================
-- SHIFT ASSIGNMENTS
-- ================================================================
CREATE TABLE IF NOT EXISTS shift_assignments (
  id               TEXT NOT NULL PRIMARY KEY,
  week_schedule_id UUID NOT NULL REFERENCES week_schedules(id) ON DELETE CASCADE,
  day              TEXT NOT NULL CHECK (day IN ('mon','tue','wed','thu','fri','sat','sun')),
  role             TEXT NOT NULL CHECK (role IN ('waiter','sushi maker','kitchen')),
  shift_type       TEXT NOT NULL CHECK (shift_type IN ('morning','night')),
  UNIQUE (week_schedule_id, day, role, shift_type)
);

ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_shift_assignments" ON shift_assignments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "owner_write_shift_assignments" ON shift_assignments
  FOR ALL USING (is_owner());

-- ================================================================
-- ASSIGNED SHIFT EMPLOYEES
-- ================================================================
CREATE TABLE IF NOT EXISTS assigned_shift_employees (
  id                   UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_assignment_id  TEXT    NOT NULL REFERENCES shift_assignments(id) ON DELETE CASCADE,
  employee_id          UUID    NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  start_time           TEXT    NOT NULL,
  end_time             TEXT    NOT NULL,
  break_hours          DECIMAL(5,2) NOT NULL DEFAULT 0,
  break_edited         BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (shift_assignment_id, employee_id)
);

ALTER TABLE assigned_shift_employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_assigned_shift_employees" ON assigned_shift_employees
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "owner_write_assigned_shift_employees" ON assigned_shift_employees
  FOR ALL USING (is_owner());

-- ================================================================
-- AVAILABILITIES
-- ================================================================
CREATE TABLE IF NOT EXISTS availabilities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  week_start  DATE NOT NULL,
  days        JSONB NOT NULL DEFAULT '{}',
  UNIQUE (employee_id, week_start)
);

ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_availabilities" ON availabilities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "owner_write_availabilities" ON availabilities
  FOR ALL USING (is_owner());

CREATE POLICY "employee_write_own_availability" ON availabilities
  FOR ALL USING (employee_id = auth.uid());

-- ================================================================
-- SETUP INSTRUCTIONS
-- ================================================================
-- After running this schema, create the owner account:
--
-- 1. Go to Supabase Dashboard → Authentication → Users → Add user → Create new user
--    Email: sohn@sushirevolution.internal
--    Password: 88888888
--
-- 2. Copy the new user's UUID, then run in SQL Editor:
--    INSERT INTO employees (id, name, username, role, roles, level, is_owner)
--    VALUES ('<paste-uuid-here>', 'Sohn', 'sohn', 'waiter', ARRAY['waiter'], 0, TRUE);
--
-- 3. Employees are added via the app's "Add employee" button.
--    Each employee gets a Supabase Auth account automatically.
-- ================================================================
