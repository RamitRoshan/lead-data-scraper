import React, { useState, useEffect } from 'react';
import { FiTerminal, FiLoader, FiGlobe, FiShield, FiDatabase } from 'react-icons/fi';

const LoadingSpinner = ({ currentLog, isComplete }) => {
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0.0);

  useEffect(() => {
    let progressInterval;
    let timeInterval;

    if (!isComplete) {
      // Simulate progress bar moving up to 98%
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev + 0.1 > 98 ? 98 : prev + 0.1;
          return prev + Math.random() * 5 + 2;
        });
      }, 300);

      // Timer
      timeInterval = setInterval(() => {
        setElapsed((prev) => parseFloat((prev + 0.1).toFixed(1)));
      }, 100);
    } else {
      setProgress(100);
    }

    return () => {
      clearInterval(progressInterval);
      clearInterval(timeInterval);
    };
  }, [isComplete]);

  return (
    <div class="glass-panel rounded-2xl p-6 md:p-8 max-w-2xl mx-auto border border-primary-500/20 relative overflow-hidden shadow-2xl">
      {/* Background soft glow blobs */}
      <div class="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div class="flex flex-col items-center justify-center text-center pb-6 border-b border-white/5">
        <div class="relative mb-4">
          {/* Outer rotating ring */}
          <div class="w-16 h-16 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin"></div>
          {/* Inner pulsing icon */}
          <div class="absolute inset-0 flex items-center justify-center">
            <FiLoader class="w-6 h-6 text-primary-400 animate-pulse" />
          </div>
        </div>

        <h3 class="text-xl font-semibold font-display text-white mb-1">
          {isComplete ? 'Scraping Completed' : 'Scraping Business Leads'}
        </h3>
        <p class="text-sm text-zinc-400 max-w-sm">
          Please wait while our engine queries map nodes and extracts B2B contact coordinates.
        </p>
      </div>

      {/* Statistics Row */}
      <div class="grid grid-cols-3 gap-4 my-6 text-left">
        <div class="bg-white/5 border border-white/5 rounded-xl p-3">
          <div class="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <FiShield class="w-3.5 h-3.5 text-emerald-400" />
            <span>Proxy Pool</span>
          </div>
          <span class="text-sm font-semibold text-white font-mono">Active (128 IP)</span>
        </div>
        
        <div class="bg-white/5 border border-white/5 rounded-xl p-3">
          <div class="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <FiGlobe class="w-3.5 h-3.5 text-primary-400" />
            <span>Threads</span>
          </div>
          <span class="text-sm font-semibold text-white font-mono">16 Workers</span>
        </div>

        <div class="bg-white/5 border border-white/5 rounded-xl p-3">
          <div class="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
            <FiDatabase class="w-3.5 h-3.5 text-indigo-400" />
            <span>Time Elapsed</span>
          </div>
          <span class="text-sm font-semibold text-white font-mono">{elapsed.toFixed(1)}s</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs font-semibold text-primary-400 uppercase tracking-wider">Engine Progress</span>
          <span class="text-xs font-mono font-bold text-white">{Math.floor(progress)}%</span>
        </div>
        <div class="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
          <div 
            class="h-full bg-gradient-to-r from-violet-600 via-primary-500 to-indigo-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(139,92,246,0.5)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Live Console Output */}
      <div class="bg-black/50 border border-white/5 rounded-xl p-4 font-mono text-left max-h-[160px] overflow-y-auto">
        <div class="flex items-center gap-2 text-xs text-zinc-400 pb-2 mb-2 border-b border-white/5">
          <FiTerminal class="w-4.5 h-4.5 text-primary-400" />
          <span>LIVE CONSOLE STREAM</span>
        </div>
        <div class="space-y-1.5 text-xs text-zinc-300">
          <div class="text-zinc-500">[SYSTEM] Session node initialized.</div>
          <div class="text-zinc-500">[NETWORK] Established SSL Tunnel.</div>
          <div class="text-primary-300 font-semibold flex items-center gap-1">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-primary-400 animate-ping"></span>
            {currentLog}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
