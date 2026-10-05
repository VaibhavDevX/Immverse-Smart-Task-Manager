'use client';

import React from 'react';
import { Task } from '../../types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface DependencyBadgeProps {
  dependencies: string[];
  allTasks: Task[];
}

export const DependencyBadge: React.FC<DependencyBadgeProps> = ({ dependencies, allTasks }) => {
  if (!dependencies || dependencies.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
        Depends on:
      </span>
      {dependencies.map((depId) => {
        const depTask = allTasks.find((t) => t.id === depId);
        const isCompleted = depTask?.status === 'Done';

        return (
          <span
            key={depId}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
              isCompleted
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
            title={depTask ? `Task: ${depTask.title} (${depTask.status})` : `Task ID: ${depId}`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
            )}
            <span className="truncate max-w-[120px]">{depTask ? depTask.title : depId}</span>
          </span>
        );
      })}
    </div>
  );
};
