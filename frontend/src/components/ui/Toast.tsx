import React from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useTaskStore();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl glass-panel shadow-2xl border border-slate-700/60 animate-in slide-in-from-bottom-5 duration-300">
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
      )}
      <span className="text-sm font-medium text-slate-200">{toast.message}</span>
      <button
        onClick={hideToast}
        className="ml-2 p-1 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
