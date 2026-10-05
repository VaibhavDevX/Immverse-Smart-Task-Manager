'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  UserCheck,
  AlertTriangle,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { tasks, myTasks, blockedTasks } = useTaskStore();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      label: 'All Tasks',
      href: '/tasks',
      icon: CheckSquare,
      badge: tasks.length,
    },
    {
      label: 'My Tasks',
      href: '/my-tasks',
      icon: UserCheck,
      badge: myTasks.length,
      badgeColor: 'bg-indigo-500/20 text-indigo-300',
    },
    {
      label: 'Blocked Tasks',
      href: '/blocked',
      icon: AlertTriangle,
      badge: blockedTasks.length,
      badgeColor: 'bg-rose-500/20 text-rose-300',
    },
    {
      label: 'Users Directory',
      href: '/users',
      icon: Users,
    },
  ];

  return (
    <aside className="w-64 shrink-0 glass-panel border-r border-slate-800 flex flex-col justify-between hidden md:flex h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Immverse AI
            </h1>
            <p className="text-[10px] font-semibold text-indigo-400 tracking-wider uppercase">
              Smart Task Manager
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-indigo-500/10 text-white border border-indigo-500/30 shadow-md shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
          <div className="flex items-center justify-between font-semibold text-slate-300">
            <span>In-Memory Storage</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Data resets on backend restart. Enforcing graph cycle & completion rules.
          </p>
        </div>
      </div>
    </aside>
  );
};
