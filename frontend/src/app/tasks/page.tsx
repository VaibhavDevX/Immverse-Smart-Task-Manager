'use client';

import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { TaskFilters } from '../../components/tasks/TaskFilters';
import { TaskCard } from '../../components/tasks/TaskCard';
import { useTaskStore } from '../../store/useTaskStore';
import { CheckSquare, Loader2 } from 'lucide-react';

export default function AllTasksPage() {
  const { tasks, isLoading, error } = useTaskStore();

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <span>All Workspace Tasks</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage tasks, filter by status or priority, and track dependency graphs.
          </p>
        </div>
      </div>

      <TaskFilters />

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      {isLoading && tasks.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span className="text-xs font-medium">Loading workspace tasks...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <p className="text-base font-semibold text-slate-300">No tasks found matching your filters</p>
          <p className="text-xs text-slate-500">Try resetting filters or create a new task using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </MainLayout>
  );
}
