'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toast } from '../ui/Toast';
import { TaskModal } from '../tasks/TaskModal';
import { useUserStore } from '../../store/useUserStore';
import { useTaskStore } from '../../store/useTaskStore';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initAuth } = useUserStore();
  const { refreshAll } = useTaskStore();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    initAuth().then(() => {
      refreshAll();
    });
  }, [initAuth, refreshAll]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onOpenCreateTask={() => setIsTaskModalOpen(true)} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      <Toast />
    </div>
  );
};
