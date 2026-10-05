'use client';

import React, { useState } from 'react';
import { Task, Status } from '../../types';
import { useTaskStore } from '../../store/useTaskStore';
import { useUserStore } from '../../store/useUserStore';
import { PriorityBadge, StatusBadge, BlockedBadge } from '../ui/Badge';
import { DependencyBadge } from './DependencyBadge';
import { CheckCircle2, Edit3, Trash2, Loader2 } from 'lucide-react';
import { TaskModal } from './TaskModal';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { tasks, completeTask, deleteTask, updateTask, isLoading } = useTaskStore();
  const { users } = useUserStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const assignee = users.find((u) => u.id === task.assignedTo);
  const isDone = task.status === 'Done';

  const handleStatusChange = async (newStatus: Status) => {
    if (newStatus === task.status) return;
    setIsActionLoading(true);
    try {
      if (newStatus === 'Done') {
        await completeTask(task.id);
      } else {
        await updateTask(task.id, { status: newStatus });
      }
    } catch {
      // Handled in store toast
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete '${task.title}'?`)) {
      setIsActionLoading(true);
      try {
        await deleteTask(task.id);
      } catch {
        // Handled in store toast
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  return (
    <>
      <div
        className={`glass-card rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 ${
          task.isBlocked
            ? 'border-rose-500/30 bg-rose-950/10'
            : isDone
            ? 'border-emerald-500/20 bg-emerald-950/10 opacity-90'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div>
          {/* Header Badges */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={task.priority} />
              {task.isBlocked && <BlockedBadge />}
            </div>
            <StatusBadge status={task.status} />
          </div>

          {/* Title & Description */}
          <h3
            className={`font-bold text-base text-slate-100 leading-snug mb-1.5 ${
              isDone ? 'line-through text-slate-400' : ''
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
              {task.description}
            </p>
          )}

          {/* Dependencies List */}
          {task.dependencies && task.dependencies.length > 0 && (
            <div className="mb-4">
              <DependencyBadge dependencies={task.dependencies} allTasks={tasks} />
            </div>
          )}
        </div>

        {/* Footer: Assignee & Action Buttons */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-2">
          {/* Assignee */}
          <div className="flex items-center gap-2">
            {assignee ? (
              <>
                <img
                  src={assignee.avatar}
                  alt={assignee.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
                />
                <span className="text-xs font-semibold text-slate-300 truncate max-w-[100px]">
                  {assignee.name}
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-500 italic">Unassigned</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {!isDone && (
              <button
                onClick={() => handleStatusChange('Done')}
                disabled={isActionLoading || isLoading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                title={task.isBlocked ? 'Blocked: Complete dependencies first' : 'Mark as Completed'}
              >
                {isActionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Complete</span>
              </button>
            )}

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Edit Task"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        taskToEdit={task}
      />
    </>
  );
};
