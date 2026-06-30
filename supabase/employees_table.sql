CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  sub_role TEXT,
  rank TEXT,
  phone TEXT,
  telegram TEXT,
  status TEXT NOT NULL DEFAULT 'Працює',
  shifts JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees viewable by everyone" ON employees FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Employees editable by everyone" ON employees FOR ALL USING (auth.role() = 'authenticated');
