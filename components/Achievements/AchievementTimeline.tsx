'use client';

import React from 'react';
import { Calendar, User, Edit3, Trash2 } from 'lucide-react';
import { Achievement } from '@/lib/types';

interface AchievementTimelineProps {
  achievements: Achievement[];
  onEdit: (ach: Achievement) => void;
  onDelete: (id: string) => void;
}

export function AchievementTimeline({ achievements, onEdit, onDelete }: AchievementTimelineProps) {
  const sorted = [...achievements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="relative pl-6 sm:pl-9 space-y-9 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-1 before:bg-gradient-to-b before:from-accent before:via-border before:to-border">
      {sorted.map((item) => {
        const itemDate = new Date(item.date);
        const year = itemDate.getFullYear();
        const monthDay = itemDate.toLocaleDateString('en-MY', {
          day: 'numeric',
          month: 'short',
        });

        return (
          <div key={item.id} className="relative group">
            {/* Timeline Node Dot */}
            <div className="absolute -left-6 sm:-left-9 top-2 w-7 h-7 rounded-full bg-card border-2 border-accent text-accent flex items-center justify-center shadow-glow group-hover:scale-125 transition-transform duration-200">
              <div className="w-2.5 h-2.5 rounded-full bg-accent" />
            </div>

            {/* Timeline Content Block */}
            <div className="rounded-3xl bg-card border border-border group-hover:border-accent/40 shadow-card overflow-hidden transition-all duration-200">
              <div className="p-5 sm:p-7 flex flex-col md:flex-row gap-6 items-start">
                {/* Photo (if available) */}
                {(item.photoUrl || item.imageBase64) && (
                  <div className="w-full md:w-64 h-48 shrink-0 rounded-2xl overflow-hidden bg-bg/50 border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={(item.photoUrl || item.imageBase64) ?? undefined}
                      alt={item.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-accent/20 text-accent border border-accent/30">
                        <Calendar size={13} />
                        {monthDay}, {year}
                      </span>
                      {item.category && (
                        <span className="text-xs font-semibold text-muted bg-bg px-2.5 py-0.5 rounded-lg border border-border">
                          {item.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-xl text-muted hover:text-fg hover:bg-bg transition-colors"
                        title="Edit Programme"
                      >
                        <Edit3 size={17} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 rounded-xl text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Programme"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-fg group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>

                  {item.role && (
                    <p className="text-xs sm:text-sm text-muted flex items-center gap-1.5 mt-1.5 font-medium">
                      <User size={13} className="text-accent" /> Role: <strong>{item.role}</strong>
                    </p>
                  )}

                  <p className="mt-3 text-sm text-muted leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
