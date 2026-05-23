import React from 'react';
import { FiDatabase, FiGrid, FiTrash2, FiClock, FiSettings, FiHelpCircle, FiArrowRight } from 'react-icons/fi';
import { formatTableName } from '../utils/helpers';

const Sidebar = ({ 
  tables, 
  activeTable, 
  onSelectTable, 
  onDeleteTable, 
  onOpenConfigWizard,
  onResetSearch
}) => {
  return (
    <aside class="w-full md:w-64 shrink-0 bg-[#060419] border-r border-white/5 flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Dynamic Actions */}
      <div class="p-4 border-b border-white/5">
        <button
          onClick={onResetSearch}
          class="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/12 rounded-xl text-xs font-semibold text-white tracking-wide transition-all duration-200"
        >
          <FiGrid class="w-4 h-4 text-primary-400" />
          <span>New Scraping Session</span>
        </button>
      </div>

      {/* History Log Title */}
      <div class="px-5 pt-5 pb-2">
        <div class="flex items-center gap-1.5 text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
          <FiClock class="w-3.5 h-3.5" />
          <span>Scraping History ({tables.length})</span>
        </div>
      </div>

      {/* Scrape Tables List */}
      <div class="flex-1 overflow-y-auto px-3 space-y-1">
        {tables.length > 0 ? (
          tables.map((table) => {
            const isActive = activeTable === table.table_name;
            return (
              <div
                key={table.table_name}
                class={`group flex items-center justify-between rounded-lg p-2.5 transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-primary-500/10 border border-primary-500/20 text-white'
                    : 'border border-transparent hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <button
                  onClick={() => onSelectTable(table.table_name)}
                  class="flex-1 flex flex-col min-w-0 pr-2"
                >
                  <span class="text-xs font-medium truncate block">
                    {formatTableName(table.table_name)}
                  </span>
                  <span class="text-[10px] text-zinc-500 font-mono mt-0.5">
                    {table.row_count} leads • {table.table_name.replace(/^leads_/, '')}
                  </span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTable(table.table_name);
                  }}
                  class="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all duration-150"
                  title="Drop dynamic table"
                >
                  <FiTrash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        ) : (
          <div class="text-center py-8 px-4 text-zinc-600">
            <FiDatabase class="w-8 h-8 mx-auto mb-2 text-zinc-700 opacity-60" />
            <p class="text-[11px] font-medium">No tables created yet.</p>
            <p class="text-[10px] mt-0.5 text-zinc-500">Run a lead search to create your first dynamic table.</p>
          </div>
        )}
      </div>

      {/* Footer Settings & Config */}
      <div class="p-4 border-t border-white/5 bg-black/20 space-y-2">
        <button
          onClick={onOpenConfigWizard}
          class="w-full flex items-center justify-between p-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <span class="flex items-center gap-2">
            <FiSettings class="w-4 h-4 text-zinc-500" />
            <span>Database Setup</span>
          </span>
          <FiArrowRight class="w-3.5 h-3.5 text-zinc-600" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
