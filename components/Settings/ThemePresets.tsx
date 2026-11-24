'use client';

import React from 'react';
import { Check, Palette } from 'lucide-react';
import { THEME_PRESETS } from '@/lib/themes';
import { useTheme } from '@/components/ThemeProvider';

export function ThemePresets() {
  const { currentTheme, setTheme } = useTheme();

  return (
    <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-card space-y-6">
      <div className="flex items-center justify-between pb-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent/20 text-accent flex items-center justify-center font-bold shadow-sm">
            <Palette size={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-fg">Dashboard Color Themes</h2>
            <p className="text-xs sm:text-sm text-muted">Pick a preset to personalize your entire dashboard aesthetic</p>
          </div>
        </div>
        <span className="text-xs font-bold text-accent bg-accent/20 px-3 py-1 rounded-full border border-accent/30">
          Official Identity • {THEME_PRESETS.length} Themes Available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5">
        {THEME_PRESETS.map((preset) => {
          const isSelected = currentTheme === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => setTheme(preset.id)}
              className={`group text-left p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden cursor-pointer ${
                isSelected
                  ? 'border-accent bg-bg/90 ring-2 ring-accent/40 shadow-glow'
                  : 'border-border bg-bg/40 hover:bg-bg/80 hover:border-accent/40'
              }`}
            >
              {/* Palette Color preview strip */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-card border border-border shadow-xs">
                  <div
                    className="w-6 h-6 rounded-lg shadow-xs border border-border"
                    style={{ backgroundColor: preset.bgPreview }}
                    title="Background Color"
                  />
                  <div
                    className="w-6 h-6 rounded-lg shadow-xs border border-border"
                    style={{ backgroundColor: preset.cardPreview }}
                    title="Card Color"
                  />
                  <div
                    className="w-6 h-6 rounded-lg shadow-xs border border-border"
                    style={{ backgroundColor: preset.accentPreview }}
                    title="Accent Highlight Color"
                  />
                </div>

                {isSelected ? (
                  <span className="w-7 h-7 rounded-full bg-accent text-accent-fg flex items-center justify-center font-black shadow-sm">
                    <Check size={16} className="stroke-[3]" />
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to apply
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-fg group-hover:text-accent transition-colors">
                  {preset.name}
                </h3>
                {preset.id === 'unikl-navy' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-black uppercase">
                    Dark Navy
                  </span>
                )}
                {preset.id === 'unikl-cream' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-black uppercase">
                    Light Mode
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">{preset.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
