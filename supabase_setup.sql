-- ==========================================
-- SUPABASE DATABASE SETUP & RPC FUNCTIONS
-- ==========================================
-- Run this script in the Supabase SQL Editor to enable dynamic table
-- creation directly from the React frontend.
-- ==========================================

-- 1. Create Dynamic Leads Table RPC
-- Creates a new table for a specific query if it doesn't already exist.
-- Security definer runs with database owner privileges to bypass standard public DDL restrictions.
CREATE OR REPLACE FUNCTION create_dynamic_leads_table(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate table name to prevent SQL injection (only allow lowercase, numbers, and underscores)
  IF table_name !~ '^[a-z0-9_]+$' THEN
    RAISE EXCEPTION 'Invalid table name format. Only lowercase alphanumeric and underscores are allowed.';
  END IF;

  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      business_name TEXT NOT NULL,
      phone_number TEXT,
      address TEXT,
      website TEXT,
      rating NUMERIC(3,2),
      category TEXT,
      city TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL
    )',
    table_name
  );

  -- Disable Row Level Security (RLS) on the newly created table so frontend can write/read it,
  -- or you can configure standard public access. By default, newly created tables have RLS disabled
  -- in Postgres unless configured otherwise. Just to be safe, we explicitly set it.
  EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', table_name);
END;
$$;


-- 2. Insert Lead Into Dynamic Table RPC
-- Inserts a row of lead data into a dynamically named table.
CREATE OR REPLACE FUNCTION insert_lead_into_table(table_name text, lead_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate table name to prevent SQL injection
  IF table_name !~ '^[a-z0-9_]+$' THEN
    RAISE EXCEPTION 'Invalid table name format.';
  END IF;

  EXECUTE format(
    'INSERT INTO %I (business_name, phone_number, address, website, rating, category, city)
     VALUES ($1, $2, $3, $4, $5, $6, $7)',
     table_name
  ) USING 
    (lead_data->>'business_name'),
    (lead_data->>'phone_number'),
    (lead_data->>'address'),
    (lead_data->>'website'),
    (lead_data->>'rating')::numeric,
    (lead_data->>'category'),
    (lead_data->>'city');
END;
$$;


-- 3. Select From Dynamic Table RPC
-- Queries and returns all rows from a dynamically created table.
CREATE OR REPLACE FUNCTION select_from_table(table_name text)
RETURNS TABLE (
  id UUID,
  business_name TEXT,
  phone_number TEXT,
  address TEXT,
  website TEXT,
  rating NUMERIC,
  category TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate table name to prevent SQL injection
  IF table_name !~ '^[a-z0-9_]+$' THEN
    RAISE EXCEPTION 'Invalid table name format.';
  END IF;

  RETURN QUERY EXECUTE format(
    'SELECT id, business_name, phone_number, address, website, rating, category, city, created_at 
     FROM %I 
     ORDER BY created_at DESC', 
    table_name
  );
END;
$$;


-- 4. List Lead Tables RPC
-- Lists all user-created tables that begin with the 'leads_' prefix.
CREATE OR REPLACE FUNCTION list_lead_tables()
RETURNS TABLE (
  table_name text,
  row_count bigint,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::text,
    COALESCE(
      (xpath('/row/cnt/text()', xmlparse(document query_to_xml(format('select count(*) as cnt from %I', t.table_name), false, true, ''))))[1]::text::bigint, 
      0::bigint
    ) as row_count,
    -- We can fetch table creation timestamp if metadata exists, or default to current date.
    -- To keep it simple, we default to the first record's created_at, or standard now()
    now() as created_at
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name LIKE 'leads_%'
  ORDER BY t.table_name ASC;
END;
$$;


-- 5. Drop Lead Table RPC
-- Deletes a dynamically created lead table.
CREATE OR REPLACE FUNCTION drop_lead_table(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate table name to prevent SQL injection
  IF table_name !~ '^[a-z0-9_]+$' THEN
    RAISE EXCEPTION 'Invalid table name format.';
  END IF;

  EXECUTE format('DROP TABLE IF EXISTS %I', table_name);
END;
$$;
