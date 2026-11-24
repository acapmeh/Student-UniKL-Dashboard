'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Calendar,
  Sparkles,
  X,
} from 'lucide-react';
import { storage, STORAGE_KEYS, DEFAULT_TASKS } from '@/lib/storage';
import { TaskItem, TaskType } from '@/lib/types';

export function DeadlineTrackerWidget() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<TaskItem>>({
    title: '',
    courseCode: 'CSD 201',
    type: 'Assignment',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '23:59',
    weightage: 10,
    status: 'Pending',
    submissionLink: 'https://vle.unikl.edu.my/',
  });

  const loadTasks = () => {
    const list = storage.get<TaskItem[]>(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    setTasks(list);
  };

  useEffect(() => {
    loadTasks();
    const handleUpdate = () => loadTasks();
    window.addEventListener('dashboard_storage_update', handleUpdate);
    return () => window.removeEventListener('dashboard_storage_update', handleUpdate);
  }, []);

  const toggleTaskStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = tasks.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: (t.status === 'Submitted' ? 'Pending' : 'Submitted') as 'Pending' | 'Submitted',
        };
      }
      return t;
    });
    setTasks(updated);
    storage.set(STORAGE_KEYS.TASKS, updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title?.trim() || !newTask.courseCode?.trim()) return;

    const taskToAdd: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTask.title.trim(),
      courseCode: newTask.courseCode.trim(),
      courseName: newTask.courseName || '',
      type: (newTask.type as TaskType) || 'Assignment',
      dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
      dueTime: newTask.dueTime || '23:59',
      weightage: Number(newTask.weightage) || 10,
      status: 'Pending',
      submissionLink: newTask.submissionLink || 'https://vle.unikl.edu.my/',
      notes: newTask.notes || '',
    };

    const updated = [taskToAdd, ...tasks];
    setTasks(updated);
    storage.set(STORAGE_KEYS.TASKS, updated);
    setIsAddOpen(false);
    setNewTask({
      title: '',
      courseCode: 'CSD 201',
      type: 'Assignment',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '23:59',
      weightage: 10,
      status: 'Pending',
      submissionLink: 'https://vle.unikl.edu.my/',
    });
  };

  // Helper to compute urgency tag & countdown
  const getUrgency = (dueDateStr: string, status: string) => {
    if (status === 'Submitted') {
      return {
        label: 'Submitted',
        className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        icon: CheckCircle2,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Overdue (${Math.abs(diffDays)}d ago)`,
        className: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        icon: AlertCircle,
      };
    } else if (diffDays === 0) {
      return {
        label: 'Due Today (23:59)',
        className: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse',
        icon: Clock,
      };
    } else if (diffDays === 1) {
      return {
        label: 'Due Tomorrow',
        className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        icon: Clock,
      };
    } else if (diffDays <= 7) {
      return {
        label: `In ${diffDays} days`,
        className: 'bg-accent/15 text-accent border-accent/30',
        icon: Calendar,
      };
    } else {
      return {
        label: `In ${diffDays} days`,
        className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        icon: Calendar,
      };
    }
  };

  // Filter tasks to show top 4 most pressing
  const sortedTasks = [...tasks]
    .sort((a, b) => {
      if (a.status === 'Submitted' && b.status !== 'Submitted') return 1;
      if (a.status !== 'Submitted' && b.status === 'Submitted') return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 4);

  const pendingCount = tasks.filter((t) => t.status !== 'Submitted').length;

  return (
    <div className="rounded-3xl bg-card border border-border p-5 sm:p-6 shadow-card flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-accent/15 text-accent">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-fg tracking-wide uppercase">
                Assignments & Deadlines
              </h3>
              <p className="text-xs text-muted">
                {pendingCount > 0
                  ? `${pendingCount} upcoming pending submission${pendingCount > 1 ? 's' : ''}`
                  : 'All coursework submitted!'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/15 hover:bg-accent text-accent hover:text-accent-fg border border-accent/25 text-xs font-bold transition-all shadow-xs"
          >
            <Plus size={14} />
            <span>Add Task</span>
          </button>
        </div>

        {/* Task Items List */}
        <div className="space-y-2.5">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8 text-muted text-xs">
              No assignments recorded. Click &quot;Add Task&quot; to track your coursework.
            </div>
          ) : (
            sortedTasks.map((task) => {
              const urgency = getUrgency(task.dueDate, task.status);
              const UrgencyIcon = urgency.icon;
              const isSubmitted = task.status === 'Submitted';

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSubmitted
                      ? 'bg-bg/40 border-border/50 opacity-70'
                      : 'bg-bg/80 hover:bg-card-hover border-border'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={(e) => toggleTaskStatus(task.id, e)}
                      className={`mt-0.5 p-1 rounded-lg border transition-all ${
                        isSubmitted
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-card border-border hover:border-accent text-muted hover:text-accent'
                      }`}
                      title={isSubmitted ? 'Mark as Pending' : 'Mark as Submitted'}
                    >
                      <CheckCircle2 size={16} />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-accent px-1.5 py-0.5 rounded-md bg-accent/10">
                          {task.courseCode}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-muted bg-card px-1.5 py-0.5 rounded-md border border-border">
                          {task.type}
                        </span>
                        {task.weightage ? (
                          <span className="text-[10px] font-bold text-muted">
                            {task.weightage}% marks
                          </span>
                        ) : null}
                      </div>

                      <h4
                        className={`text-xs sm:text-sm font-bold text-fg mt-1 truncate ${
                          isSubmitted ? 'line-through text-muted' : ''
                        }`}
                      >
                        {task.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${urgency.className}`}
                    >
                      <UrgencyIcon size={11} />
                      <span>{urgency.label}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Navigation Link */}
      <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-xs">
        <span className="text-muted text-[11px]">Auto-sorted by due date</span>
        <Link
          href="/tasks"
          className="font-bold text-accent hover:underline flex items-center gap-1 group"
        >
          <span>View All Tasks & Manager</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Quick Add Task Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-fg flex items-center gap-2">
                <Sparkles size={16} className="text-accent" />
                <span>Add Assignment or Quiz</span>
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-xl text-muted hover:text-fg hover:bg-bg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">
                  Task Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab Report 2 or Chapter 5 Quiz"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm font-semibold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">
                    Course Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IKB 10304"
                    value={newTask.courseCode}
                    onChange={(e) => setNewTask({ ...newTask, courseCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">
                    Category Type
                  </label>
                  <select
                    value={newTask.type}
                    onChange={(e) =>
                      setNewTask({ ...newTask, type: e.target.value as TaskType })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm font-semibold outline-none"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Project">Project</option>
                    <option value="Lab Report">Lab Report</option>
                    <option value="Midterm Test">Midterm Test</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">
                    Due Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm font-mono font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">
                    Weightage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="15"
                    value={newTask.weightage || ''}
                    onChange={(e) => setNewTask({ ...newTask, weightage: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm font-mono font-semibold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">
                  VLE Submission Link
                </label>
                <input
                  type="url"
                  placeholder="https://vle.unikl.edu.my/..."
                  value={newTask.submissionLink || ''}
                  onChange={(e) => setNewTask({ ...newTask, submissionLink: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-xs font-mono outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-muted hover:text-fg bg-bg border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-accent text-accent-fg hover:opacity-90 shadow-glow"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
