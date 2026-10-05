'use client';

import React from 'react';
import { User } from '../../types';
import { useUserStore } from '../../store/useUserStore';
import { useTaskStore } from '../../store/useTaskStore';
import { CheckCircle2, Clock, CheckSquare } from 'lucide-react';

interface UserCardProps {
  user: User;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const { currentUser, selectUser } = useUserStore();
  const { tasks } = useTaskStore();

  const isCurrent = currentUser?.id === user.id;
  const userTasks = tasks.filter((t) => t.assignedTo === user.id);
  const completedCount = userTasks.filter((t) => t.status === 'Done').length;
  const inProgressCount = userTasks.filter((t) => t.status === 'In Progress').length;

  return (
    <div
      className={`glass-card rounded-2xl p-5 border transition-all duration-200 ${
        isCurrent ? 'border-indigo-500/50 glow-indigo bg-indigo-950/20' : 'border-slate-800'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/30"
          />
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              {user.name}
              {isCurrent && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Active Mock User
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-center">
        <div className="p-2 rounded-xl bg-slate-900/50">
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
            <CheckSquare className="w-3 h-3 text-indigo-400" />
            <span>Assigned</span>
          </div>
          <p className="text-sm font-bold text-slate-200">{userTasks.length}</p>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/50">
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Active</span>
          </div>
          <p className="text-sm font-bold text-slate-200">{inProgressCount}</p>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/50">
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Done</span>
          </div>
          <p className="text-sm font-bold text-slate-200">{completedCount}</p>
        </div>
      </div>

      {!isCurrent && (
        <button
          onClick={() => selectUser(user)}
          className="w-full mt-4 py-2 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-indigo-600 hover:border-indigo-500 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm"
        >
          Switch to this User
        </button>
      )}
    </div>
  );
};
