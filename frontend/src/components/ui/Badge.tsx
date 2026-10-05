import React from 'react';
import { Priority, Status } from '../../types';
import { AlertTriangle, CheckCircle2, Clock, CircleDot } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const styles = {
    High: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Low: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[priority]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
      {priority}
    </span>
  );
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const config = {
    'To Do': {
      style: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
      icon: CircleDot,
    },
    'In Progress': {
      style: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      icon: Clock,
    },
    Done: {
      style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
    },
  };

  const { style, icon: Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 mr-1" />
      {status}
    </span>
  );
};

export const BlockedBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/40 glow-rose ${className}`}
    >
      <AlertTriangle className="w-3 h-3 mr-1 animate-bounce" />
      Blocked
    </span>
  );
};
