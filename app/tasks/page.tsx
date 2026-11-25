'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Trash2,
  Edit2,
  X,
  Sparkles,
} from 'lucide-react';
import { storage, STORAGE_KEYS, DEFAULT_TASKS } from '@/lib/storage';
import { TaskItem, TaskType } from '@/lib/types';
import { formatDateDMY, formatTime12h } from '@/lib/timeUtils';
import { UrgencyBadgePill } from '@/components/Tasks/UrgencyBadgePill';

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'due-this-week' | 'submitted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<TaskItem>>({
    title: '',
    courseCode: '',
    courseName: '',
    type: 'Assignment',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '23:59',
    weightage: 10,
    status: 'Pending',
    submissionLink: 'https://vle.unikl.edu.my/',
    notes: '',
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

  const saveTasks = (newTasks: TaskItem[]) => {
    setTasks(newTasks);
    storage.set(STORAGE_KEYS.TASKS, newTasks);
  };

  const toggleStatus = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status: (t.status === 'Submitted' ? 'Pending' : 'Submitted') as 'Pending' | 'Submitted',
        };
      }
      return t;
    });
    saveTasks(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this assignment task?')) {
      const updated = tasks.filter((t) => t.id !== id);
      saveTasks(updated);
    }
  };

  const handleOpenAdd = () => {
    setEditingTaskId(null);
    setFormData({
      title: '',
      courseCode: 'CSD 201',
      courseName: '',
      type: 'Assignment',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '23:59',
      weightage: 10,
      status: 'Pending',
      submissionLink: 'https://vle.unikl.edu.my/',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setFormData({ ...task });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.courseCode?.trim()) return;

    if (editingTaskId) {
      const updated = tasks.map((t) => {
        if (t.id === editingTaskId) {
          return {
            ...t,
            title: formData.title!.trim(),
            courseCode: formData.courseCode!.trim(),
            courseName: formData.courseName || '',
            type: (formData.type as TaskType) || 'Assignment',
            dueDate: formData.dueDate || new Date().toISOString().split('T')[0],
            dueTime: formData.dueTime || '23:59',
            weightage: Number(formData.weightage) || 0,
            status: formData.status || 'Pending',
            submissionLink: formData.submissionLink || 'https://vle.unikl.edu.my/',
            notes: formData.notes || '',
          };
        }
        return t;
      });
      saveTasks(updated);
    } else {
      const newTask: TaskItem = {
        id: `task-${Date.now()}`,
        title: formData.title!.trim(),
        courseCode: formData.courseCode!.trim(),
        courseName: formData.courseName || '',
        type: (formData.type as TaskType) || 'Assignment',
        dueDate: formData.dueDate || new Date().toISOString().split('T')[0],
        dueTime: formData.dueTime || '23:59',
        weightage: Number(formData.weightage) || 0,
        status: 'Pending',
        submissionLink: formData.submissionLink || 'https://vle.unikl.edu.my/',
        notes: formData.notes || '',
      };
      saveTasks([newTask, ...tasks]);
    }

    setIsModalOpen(false);
  };

  const isDueThisWeek = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  // Filter tasks based on activeTab and searchQuery
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'pending') return task.status === 'Pending';
    if (activeTab === 'submitted') return task.status === 'Submitted';
    if (activeTab === 'due-this-week') return task.status === 'Pending' && isDueThisWeek(task.dueDate);
    return true;
  });

  const totalCount = tasks.length;
  const submittedCount = tasks.filter((t) => t.status === 'Submitted').length;
  const pendingCount = totalCount - submittedCount;
  const dueThisWeekCount = tasks.filter((t) => t.status === 'Pending' && isDueThisWeek(t.dueDate)).length;
  const completionRate = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-14 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="p-6 sm:p-9 rounded-3xl bg-card border border-border shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <CheckSquare size={160} className="text-accent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent font-bold border border-accent/30 flex items-center gap-1.5">
                <Sparkles size={14} />
                Semester 4 Academic Deadlines
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-fg tracking-tight">
              Assignments, Quizzes & Tasks
            </h1>
            <p className="text-sm text-muted mt-2 max-w-xl">
              Track coursework submission dates, project milestones, and lab reports across all your enrolled subjects.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-accent text-accent-fg hover:opacity-90 shadow-glow transition-all shrink-0 w-fit"
          >
            <Plus size={18} />
            <span>Add New Assignment</span>
          </button>
        </div>

        {/* Progress & Metrics */}
        <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-bg/60 border border-border">
            <span className="text-xs text-muted font-bold uppercase">Total Tasks</span>
            <p className="text-2xl font-black text-fg mt-1">{totalCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-bg/60 border border-border">
            <span className="text-xs text-muted font-bold uppercase">Pending</span>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{pendingCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-bg/60 border border-border">
            <span className="text-xs text-muted font-bold uppercase">Due This Week</span>
            <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{dueThisWeekCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-bg/60 border border-border">
            <span className="text-xs text-muted font-bold uppercase">Completion</span>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{completionRate}%</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-card border border-border overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-accent text-accent-fg shadow-xs'
                : 'text-muted hover:text-fg'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('due-this-week')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'due-this-week'
                ? 'bg-accent text-accent-fg shadow-xs'
                : 'text-muted hover:text-fg'
            }`}
          >
            Due This Week ({dueThisWeekCount})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pending'
                ? 'bg-accent text-accent-fg shadow-xs'
                : 'text-muted hover:text-fg'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('submitted')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'submitted'
                ? 'bg-accent text-accent-fg shadow-xs'
                : 'text-muted hover:text-fg'
            }`}
          >
            Submitted ({submittedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border focus:border-accent text-fg text-xs font-semibold outline-none transition-colors"
          />
        </div>
      </div>

      {/* Task List Cards */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-card border border-border text-muted">
            <CheckSquare size={36} className="mx-auto mb-3 opacity-30 text-accent" />
            <p className="text-sm font-bold text-fg">No tasks match your filter.</p>
            <p className="text-xs text-muted mt-1">Try switching tabs or click &quot;Add New Assignment&quot;.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isSubmitted = task.status === 'Submitted';

            return (
              <div
                key={task.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSubmitted
                    ? 'bg-card/60 border-border/60 opacity-85'
                    : 'bg-card border-border hover:border-accent/40 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <button
                    onClick={() => toggleStatus(task.id)}
                    className={`mt-1 p-2 rounded-xl border transition-all shrink-0 ${
                      isSubmitted
                        ? 'bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-500'
                        : 'bg-bg border-border hover:border-accent text-muted hover:text-accent'
                    }`}
                    title={isSubmitted ? 'Mark as Pending' : 'Mark as Submitted'}
                  >
                    <CheckCircle2 size={20} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-accent px-2 py-0.5 rounded-lg bg-accent/15">
                        {task.courseCode}
                      </span>
                      <span className="text-xs font-bold uppercase text-muted bg-bg px-2 py-0.5 rounded-lg border border-border">
                        {task.type}
                      </span>
                      {task.weightage ? (
                        <span className="text-xs font-semibold text-muted">
                          {task.weightage}% weightage
                        </span>
                      ) : null}
                    </div>

                    <h3
                      className={`text-base font-bold text-fg mt-2 break-words ${
                        isSubmitted ? 'line-through text-muted' : ''
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.notes && (
                      <p className="text-xs text-muted mt-1 leading-relaxed max-w-2xl">
                        {task.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-muted">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar size={13} className="text-accent shrink-0" />
                        Due: <strong className="text-fg">{formatDateDMY(task.dueDate)}</strong> {formatTime12h(task.dueTime)}
                      </span>
                      {task.submissionLink && (
                        <a
                          href={task.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-accent font-semibold hover:underline"
                        >
                          <ExternalLink size={12} />
                          <span>Submit via VLE</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border/60 shrink-0">
                  <UrgencyBadgePill dueDate={task.dueDate} status={task.status} size="md" />

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(task)}
                      className="p-2 rounded-xl text-muted hover:text-accent hover:bg-bg transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 rounded-xl text-muted hover:text-rose-400 hover:bg-bg transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-lg font-bold text-fg flex items-center gap-2">
                <Sparkles size={18} className="text-accent" />
                <span>{editingTaskId ? 'Edit Assignment / Task' : 'Add New Assignment or Quiz'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-muted hover:text-fg hover:bg-bg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                  Assignment Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab Exercise 3 or Group Project Report"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm font-semibold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                    Course Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IKB 10304"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                    Category Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as TaskType })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm font-semibold outline-none"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Project">Project</option>
                    <option value="Lab Report">Lab Report</option>
                    <option value="Midterm Test">Midterm Test</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                    Due Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm font-mono font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                    Weightage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="15"
                    value={formData.weightage || ''}
                    onChange={(e) => setFormData({ ...formData, weightage: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-sm font-mono font-semibold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                  VLE Submission Link
                </label>
                <input
                  type="url"
                  placeholder="https://vle.unikl.edu.my/..."
                  value={formData.submissionLink || ''}
                  onChange={(e) => setFormData({ ...formData, submissionLink: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1.5">
                  Notes & Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional submission guidelines or rubric notes..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-xs outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-muted hover:text-fg bg-bg border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-accent text-accent-fg hover:opacity-90 shadow-glow"
                >
                  {editingTaskId ? 'Update Task' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
