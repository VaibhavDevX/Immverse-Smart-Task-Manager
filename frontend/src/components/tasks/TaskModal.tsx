'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Task, Priority, Status } from '../../types';
import { useTaskStore } from '../../store/useTaskStore';
import { useUserStore } from '../../store/useUserStore';
import { Sparkles, Loader2, AlertCircle, Check } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task;
}

interface TaskFormContentProps {
  taskToEdit?: Task;
  onClose: () => void;
}

const TaskFormContent: React.FC<TaskFormContentProps> = ({ taskToEdit, onClose }) => {
  const { tasks, createTask, updateTask, isLoading } = useTaskStore();
  const { users, currentUser } = useUserStore();

  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [priority, setPriority] = useState<Priority>(taskToEdit?.priority || 'Medium');
  const [status, setStatus] = useState<Status>(taskToEdit?.status || 'To Do');
  const [assignedTo, setAssignedTo] = useState(
    taskToEdit?.assignedTo || currentUser?.id || users[0]?.id || ''
  );
  const [selectedDeps, setSelectedDeps] = useState<string[]>(taskToEdit?.dependencies || []);
  const [error, setError] = useState<string | null>(null);

  // Exclude current task from dependency choices
  const availableDependencies = tasks.filter((t) => !taskToEdit || t.id !== taskToEdit.id);

  const toggleDependency = (depId: string) => {
    if (selectedDeps.includes(depId)) {
      setSelectedDeps(selectedDeps.filter((id) => id !== depId));
    } else {
      setSelectedDeps([...selectedDeps, depId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!assignedTo) {
      setError('Please assign task to a team member');
      return;
    }

    try {
      if (taskToEdit) {
        await updateTask(taskToEdit.id, {
          title: title.trim(),
          description: description.trim(),
          priority,
          status,
          assignedTo,
          dependencies: selectedDeps,
        });
      } else {
        await createTask({
          title: title.trim(),
          description: description.trim(),
          priority,
          status,
          assignedTo,
          dependencies: selectedDeps,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Task Title <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Implement DFS Cycle Detection Engine"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Description
        </label>
        <textarea
          placeholder="Provide detail context, acceptance criteria or specification..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
        />
      </div>

      {/* Grid: Priority, Status, Assignee */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Priority */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Assigned To <span className="text-rose-400">*</span>
          </label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
            required
          >
            <option value="" disabled>Select User</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Dependencies Picker */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Task Dependencies (Prerequisites)
        </label>
        <p className="text-[11px] text-slate-400 mb-2">
          Select task(s) that must be completed before this task can be marked Done.
        </p>

        {availableDependencies.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-3 bg-slate-900/50 rounded-xl border border-slate-800">
            No other tasks available to set as dependencies.
          </p>
        ) : (
          <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
            {availableDependencies.map((dep) => {
              const isSelected = selectedDeps.includes(dep.id);
              return (
                <div
                  key={dep.id}
                  onClick={() => toggleDependency(dep.id)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <span className="font-medium truncate">{dep.title}</span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      dep.status === 'Done'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {dep.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
        </button>
      </div>
    </form>
  );
};

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Task' : 'Create New Task'}
      subtitle={
        taskToEdit
          ? 'Update task properties, status, or dependency graph.'
          : 'Define a task with priority, assignee, and prerequisite dependencies.'
      }
      maxWidth="lg"
    >
      <TaskFormContent key={taskToEdit?.id || 'new_task'} taskToEdit={taskToEdit} onClose={onClose} />
    </Modal>
  );
};
