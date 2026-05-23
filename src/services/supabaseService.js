import { createClient } from '@supabase/supabase-js';

// Fetch environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate that environment variables are set and are not placeholders
const hasPlaceholderUrl = supabaseUrl.includes('your-project-id') || !supabaseUrl || supabaseUrl === 'https://your-project-id.supabase.co';
const hasPlaceholderKey = supabaseAnonKey.includes('your-anon-key') || !supabaseAnonKey || supabaseAnonKey.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key');

export const isSupabaseConfigured = () => {
  return !hasPlaceholderUrl && !hasPlaceholderKey;
};

// Initialize Supabase Client if configured
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ========================================================
// LOCALSTORAGE SANDBOX FALLBACKS (For immediate demo use)
// ========================================================

const getSandboxTables = () => {
  const data = localStorage.getItem('lead_scraper_tables');
  return data ? JSON.parse(data) : [];
};

const saveSandboxTables = (tables) => {
  localStorage.setItem('lead_scraper_tables', JSON.stringify(tables));
};

const getSandboxTableData = (tableName) => {
  const data = localStorage.getItem(`lead_scraper_data_${tableName}`);
  return data ? JSON.parse(data) : [];
};

const saveSandboxTableData = (tableName, data) => {
  localStorage.setItem(`lead_scraper_data_${tableName}`, JSON.stringify(data));
};

// ========================================================
// REUSABLE DATABASE SERVICES
// ========================================================

/**
 * Dynamically creates a table in Supabase (or Sandbox) for the search query.
 */
export const createLeadsTable = async (tableName) => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.rpc('create_dynamic_leads_table', {
        table_name: tableName
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Supabase createLeadsTable RPC Error:', err.message);
      throw new Error(`Failed to create table in Supabase: ${err.message}. Make sure you ran the SQL setup script.`);
    }
  } else {
    // Sandbox Implementation
    const tables = getSandboxTables();
    if (!tables.some(t => t.table_name === tableName)) {
      const newTable = {
        table_name: tableName,
        row_count: 0,
        created_at: new Date().toISOString()
      };
      saveSandboxTables([...tables, newTable]);
      saveSandboxTableData(tableName, []);
    }
    return true;
  }
};

/**
 * Saves scraped lead rows to the specified table.
 */
export const saveLeads = async (tableName, leads) => {
  if (isSupabaseConfigured()) {
    try {
      // Loop through leads and insert them using the insert RPC to bypass standard SQL insert security on dynamic names
      for (const lead of leads) {
        const { error } = await supabase.rpc('insert_lead_into_table', {
          table_name: tableName,
          lead_data: lead
        });
        if (error) throw error;
      }
      return true;
    } catch (err) {
      console.error('Supabase saveLeads RPC Error:', err.message);
      throw new Error(`Failed to save leads to Supabase: ${err.message}`);
    }
  } else {
    // Sandbox Implementation
    const tables = getSandboxTables();
    const tableIndex = tables.findIndex(t => t.table_name === tableName);
    
    // Add IDs and timestamps
    const leadsWithMetadata = leads.map(l => ({
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      created_at: new Date().toISOString(),
      ...l
    }));

    if (tableIndex > -1) {
      const existingData = getSandboxTableData(tableName);
      const updatedData = [...leadsWithMetadata, ...existingData];
      saveSandboxTableData(tableName, updatedData);
      
      tables[tableIndex].row_count = updatedData.length;
      tables[tableIndex].created_at = new Date().toISOString();
      saveSandboxTables(tables);
    } else {
      saveSandboxTableData(tableName, leadsWithMetadata);
      saveSandboxTables([...tables, {
        table_name: tableName,
        row_count: leadsWithMetadata.length,
        created_at: new Date().toISOString()
      }]);
    }
    return true;
  }
};

/**
 * Retrieves lead records from a dynamically generated table.
 */
export const getLeads = async (tableName) => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.rpc('select_from_table', {
        table_name: tableName
      });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Supabase getLeads RPC Error:', err.message);
      throw new Error(`Failed to retrieve leads from Supabase: ${err.message}`);
    }
  } else {
    // Sandbox Implementation
    return getSandboxTableData(tableName);
  }
};

/**
 * Lists all dynamic leads tables from the database.
 */
export const getLeadsTables = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.rpc('list_lead_tables');
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Supabase list_lead_tables RPC Error:', err.message);
      throw new Error(`Failed to list leads tables from Supabase: ${err.message}`);
    }
  } else {
    // Sandbox Implementation
    return getSandboxTables();
  }
};

/**
 * Deletes a dynamically generated table.
 */
export const deleteLeadsTable = async (tableName) => {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.rpc('drop_lead_table', {
        table_name: tableName
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Supabase drop_lead_table RPC Error:', err.message);
      throw new Error(`Failed to delete table from Supabase: ${err.message}`);
    }
  } else {
    // Sandbox Implementation
    const tables = getSandboxTables();
    saveSandboxTables(tables.filter(t => t.table_name !== tableName));
    localStorage.removeItem(`lead_scraper_data_${tableName}`);
    return true;
  }
};
