import React from 'react';
import { FiDatabase, FiCpu, FiCloud, FiCloudOff, FiTrendingUp } from 'react-icons/fi';
import { isSupabaseConfigured } from '../services/supabaseService';

const Navbar = ({ totalLeads, tableCount, onOpenConfigWizard }) => {
  const isConnected = isSupabaseConfigured();

  return (
    <header class="glass-panel border-x-0 border-t-0 border-b border-white/5 sticky top-0 z-40 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div class="flex items-center gap-2.5">
          <div class="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-primary-400/20">
            <FiCpu class="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span class="text-md font-bold font-display text-white tracking-wide">
              Lead<span class="text-primary-400">Flow</span>
            </span>
            <span class="block text-[9px] text-zinc-500 font-semibold tracking-widest uppercase">
              B2B Data Extractor
            </span>
          </div>
        </div>

        {/* Dynamic Database Connection Indicator */}
        <div class="flex items-center gap-4">
          {/* Quick Stat Summary (Hidden on Mobile) */}
          <div class="hidden sm:flex items-center gap-4 border-r border-white/5 pr-4">
            <div class="text-right">
              <span class="block text-[10px] text-zinc-500 uppercase font-semibold">Total Leads</span>
              <span class="text-xs font-bold text-white font-mono flex items-center justify-end gap-1">
                <FiTrendingUp class="w-3.5 h-3.5 text-emerald-400" />
                {totalLeads}
              </span>
            </div>
            <div class="text-right">
              <span class="block text-[10px] text-zinc-500 uppercase font-semibold">Tables Created</span>
              <span class="text-xs font-bold text-white font-mono">{tableCount}</span>
            </div>
          </div>

          {/* Connection Status pill */}
          <button
            onClick={onOpenConfigWizard}
            class={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-200 ${
              isConnected
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/15'
            }`}
          >
            <span class={`w-2 h-2 rounded-full ${isConnected ? 'status-dot-active' : 'status-dot-warning'}`}></span>
            <span class="font-mono">
              {isConnected ? 'Supabase connected' : 'Sandbox Mode'}
            </span>
            {isConnected ? (
              <FiCloud class="w-3.5 h-3.5 shrink-0 opacity-75" />
            ) : (
              <FiCloudOff class="w-3.5 h-3.5 shrink-0 opacity-75 animate-bounce" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
