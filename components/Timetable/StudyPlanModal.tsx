'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Search,
  Trash2,
  BookOpen,
  GraduationCap,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Profile, StudyPlanData, StudyPlanSubject } from '@/lib/types';
import { DEFAULT_PROFILE, STORAGE_KEYS, storage } from '@/lib/storage';
import { readStudyPlanPdf } from '@/lib/pdfReader';

interface StudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyPlan: StudyPlanData | null;
  onSavePlan: (plan: StudyPlanData) => void;
  onClearPlan: () => void;
}

type FilterTab = 'ST' | 'ALL' | 'COMPLETED' | 'REMAINING';

function getStatusBadgeStyle(status: string): string {
  const s = status.toUpperCase();
  if (s === 'ST') {
    return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
  }
  if (s === 'PASS' || s === 'CT' || s === 'EX') {
    return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';
  }
  if (s === 'FAIL') {
    return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30';
  }
  return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700/40 dark:text-slate-300 dark:border-slate-600/40';
}

function filterSubjectByTab(subject: StudyPlanSubject, tab: FilterTab): boolean {
  const s = subject.status.toUpperCase();
  if (tab === 'ST') return s === 'ST';
  if (tab === 'COMPLETED') return s === 'PASS' || s === 'CT' || s === 'EX';
  if (tab === 'REMAINING') return s !== 'PASS' && s !== 'CT' && s !== 'EX' && s !== 'ST';
  return true;
}

export function StudyPlanModal({
  isOpen,
  onClose,
  studyPlan,
  onSavePlan,
  onClearPlan,
}: StudyPlanModalProps) {
  const [draftPlan, setDraftPlan] = useState<StudyPlanData | null>(studyPlan);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasUnsavedDraft, setHasUnsavedDraft] = useState(false);
  const [syncProfile, setSyncProfile] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ST');
  const [searchQuery, setSearchQuery] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDraftPlan(studyPlan);
      setHasUnsavedDraft(false);
      setErrorMsg(null);
      setSearchQuery('');
      setFileName(null);
      if (studyPlan && studyPlan.subjects.some((s) => s.status.toUpperCase() === 'ST')) {
        setActiveTab('ST');
      } else {
        setActiveTab('ALL');
      }
    }
  }, [isOpen, studyPlan]);

  const counts = useMemo(() => {
    const list = draftPlan?.subjects ?? [];
    return {
      st: list.filter((s) => s.status.toUpperCase() === 'ST').length,
      completed: list.filter((s) => ['PASS', 'CT', 'EX'].includes(s.status.toUpperCase())).length,
      remaining: list.filter((s) => !['PASS', 'CT', 'EX', 'ST'].includes(s.status.toUpperCase())).length,
      all: list.length,
    };
  }, [draftPlan]);

  const filteredSubjects = useMemo(() => {
    if (!draftPlan) return [];
    const q = searchQuery.trim().toLowerCase();
    return draftPlan.subjects.filter((s) => {
      if (!filterSubjectByTab(s, activeTab)) return false;
      if (!q) return true;
      return (
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.category || '').toLowerCase().includes(q)
      );
    });
  }, [draftPlan, activeTab, searchQuery]);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setErrorMsg(null);
    setIsParsing(true);
    try {
      const parsed = await readStudyPlanPdf(file);
      setDraftPlan(parsed);
      setHasUnsavedDraft(true);
      setFileName(file.name);
      setActiveTab(parsed.subjects.some((s) => s.status.toUpperCase() === 'ST') ? 'ST' : 'ALL');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to read PDF file. Please ensure it is a valid UniKL Study Plan PDF.';
      setErrorMsg(message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleProcessFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleProcessFile(file);
    }
  };

  const handleSave = () => {
    if (!draftPlan) return;
    onSavePlan(draftPlan);

    if (syncProfile) {
      const current = storage.get<Profile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
      const parsedSem = draftPlan.acadSem ? parseInt(draftPlan.acadSem, 10) : NaN;
      const updatedProfile: Profile = {
        ...current,
        name: draftPlan.studentName || current.name,
        studentId: draftPlan.studentId || current.studentId,
        program: draftPlan.programme || current.program,
        campus: draftPlan.institute || current.campus,
        currentSemester:
          Number.isFinite(parsedSem) && parsedSem >= 1 && parsedSem <= 14
            ? `Semester ${parsedSem}`
            : current.currentSemester,
        advisor: {
          name: draftPlan.academicAdvisor || current.advisor?.name || '',
          email: current.advisor?.email ?? '',
          phone: current.advisor?.phone ?? '',
        },
      };
      storage.set(STORAGE_KEYS.PROFILE, updatedProfile);
    }

    setHasUnsavedDraft(false);
    onClose();
  };

  const handleClear = () => {
    onClearPlan();
    setDraftPlan(null);
    setHasUnsavedDraft(false);
    setFileName(null);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-4xl rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 text-accent flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-fg truncate">
                UniKL Study Plan PDF Importer
              </h2>
              <p className="text-xs text-muted truncate">
                Upload your official E-Citie / Academic Study Plan PDF (PGR032) to collect all subjects &amp; credits
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Study Plan modal"
            className="p-2 rounded-xl text-muted hover:text-fg hover:bg-card-hover transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto overflow-x-hidden flex-1 text-sm">
          {/* Dropzone / Picker */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-5 sm:p-6 text-center transition-all ${
              isDragging
                ? 'border-accent bg-accent/10'
                : 'border-border bg-bg/70 hover:border-accent/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="study-plan-pdf-input"
            />

            {isParsing ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <Loader2 size={28} className="animate-spin text-accent" />
                <p className="font-bold text-fg">Reading your Study Plan PDF...</p>
                <p className="text-xs text-muted">Extracting subjects, credit hours &amp; academic totals privately in your browser</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
                    <Upload size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-fg text-sm">
                      {draftPlan
                        ? 'Upload updated Study Plan PDF'
                        : 'Drag & drop your UniKL Study Plan PDF here'}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {fileName
                        ? `Loaded file: ${fileName}`
                        : '100% private — parsed locally in your browser (supports Report ID PGR032)'}
                    </p>
                  </div>
                </div>
                <label
                  htmlFor="study-plan-pdf-input"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-fg font-bold text-xs sm:text-sm cursor-pointer hover:opacity-90 transition-opacity shrink-0"
                >
                  <Upload size={15} />
                  <span>{draftPlan ? 'Replace PDF' : 'Choose PDF File'}</span>
                </label>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-100 border border-rose-300 text-rose-800 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {draftPlan && (
            <>
              {/* Collected Summary Header & Unsaved notice */}
              <div className="rounded-2xl bg-bg border border-border p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
                        <CheckCircle2 size={12} />
                        {hasUnsavedDraft ? 'Ready to Save' : 'Saved Study Plan'}
                      </span>
                      {draftPlan.reportId && (
                        <span className="text-[11px] font-mono font-bold text-muted px-2 py-0.5 rounded-full border border-border">
                          {draftPlan.reportId}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-fg leading-snug">
                      {draftPlan.programme || 'UniKL Academic Study Plan'}
                    </h3>
                    <p className="text-xs text-muted">
                      {[
                        draftPlan.studentName,
                        draftPlan.studentId ? `ID: ${draftPlan.studentId}` : null,
                        draftPlan.acadSem ? `Acad Sem: ${draftPlan.acadSem}` : null,
                      ]
                        .filter(Boolean)
                        .join(' • ')}
                    </p>
                    {draftPlan.academicAdvisor && (
                      <p className="text-xs text-muted">
                        Advisor: <span className="font-semibold text-fg">{draftPlan.academicAdvisor}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 4 KPI Credit Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-card border border-border p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      Total To Graduate
                    </p>
                    <p className="text-xl font-black text-fg font-mono mt-0.5">
                      {draftPlan.totalCreditToGraduate} <span className="text-xs font-semibold text-muted">Cr</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-card border border-border p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      Completed Credits
                    </p>
                    <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                      {draftPlan.completedCredits} <span className="text-xs font-semibold text-muted">Cr</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-card border border-border p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      Current Sem (ST)
                    </p>
                    <p className="text-xl font-black text-amber-700 dark:text-amber-400 font-mono mt-0.5">
                      {draftPlan.currentSemCredits} <span className="text-xs font-semibold text-muted">Cr</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-card border border-border p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      Subjects Collected
                    </p>
                    <p className="text-xl font-black text-accent font-mono mt-0.5">
                      {draftPlan.subjects.length}{' '}
                      <span className="text-[11px] font-semibold text-muted">
                        ({draftPlan.totalListedCredits} Cr)
                      </span>
                    </p>
                  </div>
                </div>

                {/* Optional Profile Sync Checkbox */}
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border cursor-pointer hover:border-accent/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={syncProfile}
                    onChange={(e) => setSyncProfile(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[var(--accent)] rounded cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-fg font-medium leading-relaxed">
                    Sync Student Name, ID, Program &amp; Academic Advisor name to Profile on save{' '}
                    <span className="text-muted">(preserves your advisor email &amp; phone number)</span>
                  </span>
                </label>
              </div>

              {/* Filter Tabs + Search */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: 'ST', label: `Current Sem ST (${counts.st})` },
                        { id: 'ALL', label: `All (${counts.all})` },
                        { id: 'COMPLETED', label: `Completed (${counts.completed})` },
                        { id: 'REMAINING', label: `Remaining (${counts.remaining})` },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          activeTab === tab.id
                            ? 'bg-accent text-accent-fg shadow-xs'
                            : 'bg-bg text-muted border border-border hover:text-fg'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative sm:w-60">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter by code or name..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-bg border border-border focus:border-accent text-fg text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block rounded-2xl border border-border overflow-hidden">
                  <div className="max-h-72 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-bg border-b border-border text-[10px] uppercase tracking-wider text-muted font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Code</th>
                          <th className="py-2.5 px-3">Subject Name</th>
                          <th className="py-2.5 px-3 text-center">Cr</th>
                          <th className="py-2.5 px-3 text-center">Yr / Sem</th>
                          <th className="py-2.5 px-3">Cat</th>
                          <th className="py-2.5 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {filteredSubjects.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-muted">
                              No subjects match your current filter.
                            </td>
                          </tr>
                        ) : (
                          filteredSubjects.map((sub) => (
                            <tr key={`${sub.rowNumber}-${sub.code}`} className="hover:bg-card-hover/60">
                              <td className="py-2.5 px-3 font-mono font-bold text-accent whitespace-nowrap">
                                {sub.code}
                              </td>
                              <td className="py-2.5 px-3 text-fg font-semibold">
                                <div>{sub.name}</div>
                                {sub.preRequisite && (
                                  <div className="text-[10px] text-muted mt-0.5">
                                    Pre-Req: {sub.preRequisite}
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-fg">
                                {sub.creditHours}
                              </td>
                              <td className="py-2.5 px-3 text-center text-muted font-mono">
                                Y{sub.year} S{sub.sem}
                              </td>
                              <td className="py-2.5 px-3 text-muted">{sub.category}</td>
                              <td className="py-2.5 px-3 text-right">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeStyle(
                                    sub.status
                                  )}`}
                                >
                                  {sub.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards (zero horizontal overflow) */}
                <div className="sm:hidden space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredSubjects.length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted border border-border rounded-2xl">
                      No subjects match your current filter.
                    </div>
                  ) : (
                    filteredSubjects.map((sub) => (
                      <div
                        key={`m-${sub.rowNumber}-${sub.code}`}
                        className="p-3 rounded-xl bg-bg border border-border space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-xs text-accent">{sub.code}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeStyle(
                              sub.status
                            )}`}
                          >
                            {sub.status}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-fg leading-snug">{sub.name}</p>
                        <div className="flex items-center justify-between text-[11px] text-muted">
                          <span>
                            {sub.creditHours} Cr • {sub.category}
                          </span>
                          <span>
                            Y{sub.year} Sem {sub.sem}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {!draftPlan && !isParsing && (
            <div className="rounded-2xl bg-bg/50 border border-border p-5 flex items-start gap-3 text-xs text-muted">
              <Sparkles size={16} className="text-accent shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <p className="font-bold text-fg">What this unlocks across your dashboard:</p>
                <p>• Selectable grouped dropdown in <strong>+ Add Class</strong> with your Current Sem (ST) subjects at the top</p>
                <p>• Exact credit hours per course (e.g. 1 Cr, 3 Cr, 4 Cr) fed automatically into the <strong>What-If CGPA Simulator</strong></p>
                <p>• Full progress counter of Required vs Completed vs Current Sem credit hours</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-border bg-bg/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {draftPlan && studyPlan ? (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-500/40 text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition-colors"
            >
              <Trash2 size={14} />
              <span>Clear Study Plan</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <GraduationCap size={14} className="text-accent" />
              <span>Stored locally in browser</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-muted hover:text-fg font-semibold text-xs sm:text-sm transition-colors"
            >
              Close
            </button>
            {draftPlan && (
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-accent text-accent-fg font-bold text-xs sm:text-sm hover:opacity-90 shadow-glow transition-all"
              >
                <BookOpen size={15} />
                <span>Save Study Plan</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
