import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration === Infinity) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-emerald-950/90 border-emerald-500/20 text-emerald-400',
      icon: <FiCheckCircle class="w-5 h-5 text-emerald-400 shrink-0" />,
      bar: 'bg-emerald-500'
    },
    error: {
      bg: 'bg-red-950/90 border-red-500/20 text-red-400',
      icon: <FiAlertCircle class="w-5 h-5 text-red-400 shrink-0" />,
      bar: 'bg-red-500'
    },
    info: {
      bg: 'bg-primary-950/90 border-primary-500/20 text-primary-400',
      icon: <FiInfo class="w-5 h-5 text-primary-400 shrink-0" />,
      bar: 'bg-primary-500'
    }
  };

  const config = typeConfig[type] || typeConfig.success;

  return (
    <div class={`fixed bottom-5 right-5 z-50 flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-md shadow-2xl animate-slide-in-right max-w-sm w-full ${config.bg}`}>
      {/* Icon */}
      {config.icon}
      
      {/* Message */}
      <div class="text-xs font-semibold flex-1 tracking-wide leading-relaxed">
        {message}
      </div>
      
      {/* Close button */}
      <button 
        onClick={onClose}
        class="text-zinc-500 hover:text-white transition-colors duration-150"
      >
        <FiX class="w-4 h-4" />
      </button>

      {/* Progress timeline bar */}
      {duration !== Infinity && (
        <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5 rounded-b-xl overflow-hidden">
          <div 
            class={`h-full animate-progress-bar ${config.bar}`}
            style={{ animationDuration: `${duration}ms` }}
          ></div>
        </div>
      )}

      {/* Embedded CSS for animations */}
      <style>{`
        @keyframes slideInRight {
          0% { transform: translateX(120%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes progressBar {
          0% { width: 100%; }
          100% { width: 0%; }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-progress-bar {
          animation-name: progressBar;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;
