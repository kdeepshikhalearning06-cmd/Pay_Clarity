/*
# Create profiles, workspaces, and workspace_members tables

## Purpose
Connect PayClarity's authenticated (non-demo) experience to Supabase so that
user profiles, company/workspace data, and team members persist across sessions
instead of being hardcoded constants.

## 1. New Tables

### workspaces
Stores company/workspace-level information shown on the Company Profile page,
Settings > Company tab, and the assessment context banner.
- id (uuid, primary key)
- name (text, not null) — company name
- industry (text, default 'Technology')
- company_size (text, default '100-250')
- country (text, default 'Germany')
- countries (text[], default '{}') — countries the company operates in
- currency (text, default 'EUR')
- fiscal_year (text, default 'FY2026')
- assessment_name (text)
- assessment_status (text, default 'In Progress')
- readiness (integer, default 0)
- employees (integer, default 0)
- overall_gap (numeric, default 0)
- median_gap (numeric, default 0)
- assessment_date (text)
- reports_generated (integer, default 0)
- created_at / updated_at (timestamptz)

### profiles
One row per authenticated user. Existing AuthContext queries this table with
select("*").eq("id", userId) and maps columns: id, name, email, job_title,
department, role, language, avatar, workspace_id.
- id (uuid PK, references auth.users ON DELETE CASCADE)
- email, name, job_title, department, avatar (text)
- role (text, default 'HR Analyst')
- language (text, default 'English (UK)')
- timezone (text, default 'Europe/Berlin (CET)')
- workspace_id (uuid FK -> workspaces, ON DELETE SET NULL)
- created_at / updated_at (timestamptz)

### workspace_members
Replaces the hardcoded TEAM_MEMBERS array on Settings > Team tab.
- id (uuid PK)
- workspace_id (uuid NOT NULL FK -> workspaces ON DELETE CASCADE)
- user_id (uuid FK -> auth.users ON DELETE SET NULL, nullable for invites)
- name, email (text NOT NULL)
- role (text NOT NULL, default 'Reviewer')
- status (text NOT NULL, default 'Invited')
- created_at / updated_at (timestamptz)

## 2. Security (RLS)
All tables have RLS enabled. Policies use auth.uid() for ownership.
- profiles: user can CRUD only their own row (auth.uid() = id).
- workspaces: readable/updatable/deletable by workspace members.
- workspace_members: members of the same workspace can CRUD all member rows.
  INSERT allows user_id = auth.uid() (self-join) for initial workspace creation.

## 3. Indexes
- profiles.workspace_id, workspace_members.workspace_id, workspace_members.user_id

## 4. Triggers
- updated_at auto-update trigger on all three tables.
*/

-- ==========================================================
-- Create all tables first
-- ==========================================================

CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text NOT NULL DEFAULT 'Technology',
  company_size text NOT NULL DEFAULT '100-250',
  country text NOT NULL DEFAULT 'Germany',
  countries text[] NOT NULL DEFAULT '{}',
  currency text NOT NULL DEFAULT 'EUR',
  fiscal_year text NOT NULL DEFAULT 'FY2026',
  assessment_name text,
  assessment_status text NOT NULL DEFAULT 'In Progress',
  readiness integer NOT NULL DEFAULT 0,
  employees integer NOT NULL DEFAULT 0,
  overall_gap numeric NOT NULL DEFAULT 0,
  median_gap numeric NOT NULL DEFAULT 0,
  assessment_date text,
  reports_generated integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text,
  job_title text,
  department text,
  role text NOT NULL DEFAULT 'HR Analyst',
  language text NOT NULL DEFAULT 'English (UK)',
  timezone text NOT NULL DEFAULT 'Europe/Berlin (CET)',
  avatar text,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'Reviewer',
  status text NOT NULL DEFAULT 'Invited',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ==========================================================
-- Enable RLS
-- ==========================================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- workspaces policies
-- ==========================================================
DROP POLICY IF EXISTS "select_own_workspace" ON workspaces;
CREATE POLICY "select_own_workspace"
ON workspaces FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "insert_workspace" ON workspaces;
CREATE POLICY "insert_workspace"
ON workspaces FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "update_own_workspace" ON workspaces;
CREATE POLICY "update_own_workspace"
ON workspaces FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "delete_own_workspace" ON workspaces;
CREATE POLICY "delete_own_workspace"
ON workspaces FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
  )
);

-- ==========================================================
-- profiles policies
-- ==========================================================
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- ==========================================================
-- workspace_members policies
-- ==========================================================
DROP POLICY IF EXISTS "select_workspace_members" ON workspace_members;
CREATE POLICY "select_workspace_members"
ON workspace_members FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "insert_workspace_member" ON workspace_members;
CREATE POLICY "insert_workspace_member"
ON workspace_members FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "update_workspace_member" ON workspace_members;
CREATE POLICY "update_workspace_member"
ON workspace_members FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "delete_workspace_member" ON workspace_members;
CREATE POLICY "delete_workspace_member"
ON workspace_members FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid()
  )
);

-- ==========================================================
-- Indexes
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_profiles_workspace_id ON profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);

-- ==========================================================
-- updated_at triggers
-- ==========================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_workspaces_updated_at ON workspaces;
CREATE TRIGGER trg_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_workspace_members_updated_at ON workspace_members;
CREATE TRIGGER trg_workspace_members_updated_at
  BEFORE UPDATE ON workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();