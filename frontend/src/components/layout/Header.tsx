'use client';

import React, { useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { Plus, ChevronDown, UserPlus } from 'lucide-react';
import { UserModal } from '../users/UserModal';

interface HeaderProps {
  onOpenCreateTask?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateTask }) => {
  const { currentUser, users, selectUser } = useUserStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title / Search */}
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold text-slate-300 hidden sm:block">
          Workspace Management
        </h2>
      </div>

      {/* Actions & Active User Switcher */}
      <div className="flex items-center gap-3">
        {onOpenCreateTask && (
          <button
            onClick={onOpenCreateTask}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        )}

        <button
          onClick={() => setIsUserModalOpen(true)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer border border-slate-800"
          title="Create New User"
        >
          <UserPlus className="w-4 h-4" />
        </button>

        {/* User Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs">
                {currentUser?.name ? currentUser.name[0] : 'U'}
              </div>
            )}
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-200 leading-tight">
                {currentUser ? currentUser.name : 'Select User'}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                {currentUser ? currentUser.email : 'Not logged in'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Active Mock Session
                </p>
              </div>

              <div className="py-1 max-h-48 overflow-y-auto space-y-1">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      selectUser(u);
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-medium transition-all ${
                      currentUser?.id === u.id
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-slate-200">{u.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsUserModalOpen(true);
                    setIsUserMenuOpen(false);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-3 py-1.5"
                >
                  + Add User
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />
    </header>
  );
};
