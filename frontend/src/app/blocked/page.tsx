'use client';

import React, { useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { TaskCard } from '../../components/tasks/TaskCard';
import { useTaskStore } from '../../store/useTaskStore';
import { AlertTriangle, ShieldAlert, Loader2, Info } from 'lucide-react';

export default function BlockedTasksPage() {
  const { blockedTasks, fetchBlockedTasks, isLoading } = useTaskStore();

  useEffect(() => {
    fetchBlockedTasks();
  }, [fetchBlockedTasks]);

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Blocked Tasks</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tasks whose completion is currently locked because prerequisite dependency tasks are incomplete.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 bg-rose-950/20 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="text-xs text-rose-200 space-y-1">
          <p className="font-bold">Dependency Lock Enforcement</p>
          <p className="text-rose-300/80 leading-relaxed">
            The backend engine prevents any task on this list from transitioning to <strong>Done</strong> status until all prerequisite tasks are marked completed.
          </p>
        </div>
      </div>

      {isLoading && blockedTasks.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-rose-400" />
          <span className="text-xs font-medium">Scanning graph for blocked tasks...</span>
        </div>
      ) : blockedTasks.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
            <Info className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-slate-200">No Blocked Tasks Found! 🎉</p>
          <p className="text-xs text-slate-500">
            All tasks with dependencies are either unblocked or already completed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blockedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </MainLayout>
  );
}
