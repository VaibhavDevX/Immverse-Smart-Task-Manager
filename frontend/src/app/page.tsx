'use client';

import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useTaskStore } from '../store/useTaskStore';
import { useUserStore } from '../store/useUserStore';
import { TaskCard } from '../components/tasks/TaskCard';
import {
  CheckSquare,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  CircleDot,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { tasks, myTasks, blockedTasks } = useTaskStore();
  const { currentUser } = useUserStore();

  const completedCount = tasks.filter((t) => t.status === 'Done').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const toDoCount = tasks.filter((t) => t.status === 'To Do').length;

  const highPriorityCount = tasks.filter((t) => t.priority === 'High').length;
  const mediumPriorityCount = tasks.filter((t) => t.priority === 'Medium').length;
  const lowPriorityCount = tasks.filter((t) => t.priority === 'Low').length;

  const completionPercentage =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <MainLayout>
      {/* Hero Welcome Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-800 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-950/80 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              SaaS Dashboard
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2">
              Welcome back, {currentUser ? currentUser.name : 'Team Member'} 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Track multi-level task dependencies, resolve workflow bottlenecks, and manage task status transitions.
            </p>
          </div>

          {/* Completion Meter */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 min-w-[200px]">
            <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
              <span className="text-slate-400">Overall Progress</span>
              <span className="text-emerald-400 font-bold">{completionPercentage}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">
              {completedCount} of {tasks.length} tasks completed
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Tasks</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">{tasks.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Assigned to Me */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Assigned to Me</p>
            <h3 className="text-2xl font-bold text-indigo-300 mt-1">{myTasks.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Blocked Tasks */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Blocked Tasks</p>
            <h3 className="text-2xl font-bold text-rose-400 mt-1">{blockedTasks.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Completed</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{completedCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Status Breakdown</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <CircleDot className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-300">To Do</span>
              </div>
              <span className="text-xs font-bold text-slate-200">{toDoCount}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-300">In Progress</span>
              </div>
              <span className="text-xs font-bold text-cyan-400">{inProgressCount}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300">Completed</span>
              </div>
              <span className="text-xs font-bold text-emerald-400">{completedCount}</span>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Priority Overview</span>
            </h3>
            <Link
              href="/tasks"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>View All Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <p className="text-xs font-semibold text-rose-300">High Priority</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">{highPriorityCount}</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-xs font-semibold text-amber-300">Medium Priority</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{mediumPriorityCount}</p>
            </div>

            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center">
              <p className="text-xs font-semibold text-sky-300">Low Priority</p>
              <p className="text-2xl font-bold text-sky-400 mt-1">{lowPriorityCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200">Recent Workspace Tasks</h2>
          <Link
            href="/tasks"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>See full board ({tasks.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 text-sm">
            No tasks found. Click &quot;New Task&quot; in the header to create your first task.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.slice(0, 6).map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
