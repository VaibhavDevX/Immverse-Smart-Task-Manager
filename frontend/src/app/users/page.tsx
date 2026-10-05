'use client';

import React, { useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { UserCard } from '../../components/users/UserCard';
import { UserModal } from '../../components/users/UserModal';
import { useUserStore } from '../../store/useUserStore';
import { Users, UserPlus } from 'lucide-react';

export default function UsersPage() {
  const { users } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Team Directory & Sessions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage workspace users and switch active mock session.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </MainLayout>
  );
}
