'use client';

import React from 'react';
import { X, HelpCircle, Info } from 'lucide-react';

interface GradingScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCALE_TABLE = [
  { grade: 'A', marks: '80 - 100', point: '4.00', status: 'Pass', inGpa: 'Yes' },
  { grade: 'A-', marks: '75 - 79', point: '3.67', status: 'Pass', inGpa: 'Yes' },
  { grade: 'B+', marks: '70 - 74', point: '3.33', status: 'Pass', inGpa: 'Yes' },
  { grade: 'B', marks: '65 - 69', point: '3.00', status: 'Pass', inGpa: 'Yes' },
  { grade: 'B-', marks: '60 - 64', point: '2.67', status: 'Pass', inGpa: 'Yes' },
  { grade: 'C+', marks: '55 - 59', point: '2.33', status: 'Pass', inGpa: 'Yes' },
  { grade: 'C', marks: '50 - 54', point: '2.00', status: 'Pass', inGpa: 'Yes' },
  { grade: 'C-', marks: '45 - 49', point: '1.67', status: 'Pass', inGpa: 'Yes' },
  { grade: 'D', marks: '40 - 44', point: '1.00', status: 'Pass', inGpa: 'Yes' },
  { grade: 'F', marks: '0 - 39', point: '0.00', status: 'Fail', inGpa: 'Yes' },
  { grade: 'S', marks: 'Satisfactory', point: '—', status: 'Pass', inGpa: 'No (Excluded)' },
  { grade: 'I', marks: 'Credit Transfer', point: '—', status: 'Credit Transfer', inGpa: 'No (Excluded)' },
];

export function GradingScaleModal({ isOpen, onClose }: GradingScaleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-card border border-border shadow-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-bg/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center font-bold">
              <HelpCircle size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-fg">UniKL Grading Scale System</h2>
              <p className="text-xs text-muted">Official Grade Point & Status Matrix</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-card-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/25 text-xs text-fg flex items-start gap-2">
            <Info size={16} className="text-accent shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Grades <strong>S (Satisfactory)</strong> and <strong>I (Credit Transfer)</strong> do not contribute to your GPA or CGPA points, but count towards your total completed credits.
            </span>
          </div>

          <div className="rounded-xl border border-border overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-bg text-muted font-bold uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Grade</th>
                  <th className="py-2.5 px-3">Marks Range</th>
                  <th className="py-2.5 px-3">Grade Point</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Affects GPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SCALE_TABLE.map((row) => (
                  <tr key={row.grade} className="hover:bg-bg/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-fg">{row.grade}</td>
                    <td className="py-2.5 px-3 text-muted">{row.marks}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-accent">{row.point}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.status === 'Pass'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : row.status === 'Credit Transfer'
                            ? 'bg-purple-500/10 text-purple-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-muted text-[11px]">{row.inGpa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-bg/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-accent text-accent-fg hover:opacity-90 transition-opacity"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
