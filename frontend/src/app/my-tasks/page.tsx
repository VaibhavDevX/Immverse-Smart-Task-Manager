'use client';

import React, { useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { TaskCard } from '../../components/tasks/TaskCard';
import { useTaskStore } from '../../store/useTaskStore';
import { useUserStore } from '../../store/useUserStore';
import { UserCheck, Loader2 } from 'lucide-react';

export default function MyTasksPage() {
  const { myTasks, fetchMyTasks, isLoading } = useTaskStore();
  const { currentUser } = useUserStore();

  useEffect(() => {
    if (currentUser) {
      fetchMyTasks();
    }
  }, [currentUser, fetchMyTasks]);

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <span>My Assigned Tasks</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tasks currently assigned to <strong className="text-indigo-300">{currentUser ? currentUser.name : 'Active User'}</strong>.
          </p>
        </div>
      </div>

      {isLoading && myTasks.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span className="text-xs font-medium">Loading your assigned tasks...</span>
        </div>
      ) : myTasks.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <p className="text-base font-semibold text-slate-300">No tasks assigned to you right now</p>
          <p className="text-xs text-slate-500">Assign tasks to yourself using the task creation or edit modal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </MainLayout>
  );
}
