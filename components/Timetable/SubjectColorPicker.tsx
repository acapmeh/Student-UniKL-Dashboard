'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Palette, Sliders, Sun } from 'lucide-react';
import {
  SUBJECT_COLOR_PRESETS,
  getCardContrastTheme,
  hexToHsb,
  hsbToHex,
  normalizeHex,
} from '@/lib/colorUtils';

interface SubjectColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

export function SubjectColorPicker({ value, onChange }: SubjectColorPickerProps) {
  const safeValue = normalizeHex(value) || SUBJECT_COLOR_PRESETS[0].hex;
  const [hsb, setHsb] = useState<{ h: number; s: number; b: number }>(() => hexToHsb(safeValue));
  const [hexInput, setHexInput] = useState<string>(safeValue);
  const [showCustomEditor, setShowCustomEditor] = useState<boolean>(false);
  const spectrumRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Sync local editor state when external value changes (e.g., modal opens with another class)
  useEffect(() => {
    const norm = normalizeHex(value);
    if (norm) {
      setHexInput(norm);
      // Avoid resetting hue when saturation or brightness hits edge values
      const currentDerived = hsbToHex(hsb.h, hsb.s, hsb.b);
      if (currentDerived !== norm) {
        setHsb(hexToHsb(norm));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const cardTheme = getCardContrastTheme(safeValue);
  const isPresetMatch = SUBJECT_COLOR_PRESETS.some(
    (p) => p.hex.toUpperCase() === safeValue.toUpperCase()
  );

  const applyHsb = (nextHsb: { h: number; s: number; b: number }) => {
    setHsb(nextHsb);
    const nextHex = hsbToHex(nextHsb.h, nextHsb.s, nextHsb.b);
    setHexInput(nextHex);
    onChange(nextHex);
  };

  const updateSpectrumFromPointer = (clientX: number, clientY: number) => {
    const rect = spectrumRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const xRatio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const yRatio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    const nextS = Math.round(xRatio * 100);
    const nextB = Math.round((1 - yRatio) * 100);
    applyHsb({ h: hsb.h, s: nextS, b: nextB });
  };

  const handleHexChange = (raw: string) => {
    const formatted = raw.startsWith('#') ? raw.toUpperCase() : `#${raw.toUpperCase()}`;
    setHexInput(formatted);
    const valid = normalizeHex(formatted);
    if (valid && (formatted.length === 7 || formatted.length === 4)) {
      // If 4 chars (#ABC), normalize only on blur so user can type 6-digit hex smoothly
      if (formatted.length === 7) {
        setHsb(hexToHsb(valid));
        onChange(valid);
      }
    }
  };

  const handleHexBlur = () => {
    const valid = normalizeHex(hexInput);
    if (valid) {
      setHexInput(valid);
      setHsb(hexToHsb(valid));
      onChange(valid);
    } else {
      setHexInput(safeValue);
    }
  };

  const pureHueHex = hsbToHex(hsb.h, 100, 100);
  const fullBrightCurrentSatHex = hsbToHex(hsb.h, hsb.s, 100);

  return (
    <div className="space-y-3">
      {/* Header Row with Contrast Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
          <Palette size={13} className="text-accent" />
          <span>Subject Color Theme (10 Presets + Custom)</span>
        </label>

        <div className="flex items-center gap-1.5">
          <span
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border"
            style={{
              backgroundColor: cardTheme.bgHex,
              color: cardTheme.textColor,
              borderColor: cardTheme.borderColor,
            }}
            title="Live WCAG 2.1 text contrast ratio"
          >
            <CheckCircle2 size={11} />
            <span>
              {cardTheme.contrastRatio.toFixed(2)} : 1 ({cardTheme.wcagLevel})
            </span>
          </span>
        </div>
      </div>

      {/* 10 Preset Themes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {SUBJECT_COLOR_PRESETS.map((preset) => {
          const presetContrast = getCardContrastTheme(preset.hex);
          const isSelected = safeValue.toUpperCase() === preset.hex.toUpperCase();

          return (
            <button
              type="button"
              key={preset.hex}
              onClick={() => {
                setHexInput(preset.hex);
                setHsb(hexToHsb(preset.hex));
                onChange(preset.hex);
              }}
              className={`px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 border truncate ${
                isSelected
                  ? 'ring-2 ring-accent ring-offset-2 ring-offset-card scale-[1.02]'
                  : 'opacity-85 hover:opacity-100'
              }`}
              style={{
                backgroundColor: presetContrast.bgHex,
                color: presetContrast.textColor,
                borderColor: preset.border,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/15"
                style={{ backgroundColor: presetContrast.textColor }}
              />
              <span className="truncate">{preset.name}</span>
            </button>
          );
        })}
      </div>

      {/* Toggle Custom Picture-4 Picker Button */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setShowCustomEditor(!showCustomEditor)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            showCustomEditor || !isPresetMatch
              ? 'bg-accent/15 text-accent border-accent/40'
              : 'bg-bg text-muted hover:text-fg border-border'
          }`}
        >
          <Sliders size={13} />
          <span>{showCustomEditor ? 'Hide Custom Color Editor' : 'Custom Color Picker (HEX & Spectrum)'}</span>
          <span
            className="w-3.5 h-3.5 rounded-sm border border-border inline-block"
            style={{ backgroundColor: safeValue }}
          />
        </button>

        <span className="text-[11px] font-mono text-muted">
          Selected: <strong className="text-fg">{safeValue}</strong>
        </span>
      </div>

      {/* Picture-4 Style Interactive "Edit color" Panel */}
      {showCustomEditor && (
        <div className="p-4 rounded-2xl bg-bg border border-border shadow-inner space-y-3.5 animate-fadeIn">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-fg">Edit Color</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-muted">HEX</span>
              <input
                type="text"
                maxLength={7}
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                onBlur={handleHexBlur}
                placeholder="#FFE8F0"
                className="w-24 px-2.5 py-1 rounded-lg bg-card border border-border focus:border-accent text-fg font-mono text-xs font-bold uppercase outline-none"
              />
            </div>
          </div>

          {/* 2D Saturation x Brightness Spectrum Box */}
          <div
            ref={spectrumRef}
            onPointerDown={(e) => {
              isDraggingRef.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              updateSpectrumFromPointer(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (!isDraggingRef.current) return;
              updateSpectrumFromPointer(e.clientX, e.clientY);
            }}
            onPointerUp={(e) => {
              isDraggingRef.current = false;
              if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
              }
            }}
            className="relative w-full h-36 rounded-xl cursor-crosshair overflow-hidden border border-border touch-none select-none"
            style={{
              backgroundColor: pureHueHex,
              backgroundImage:
                'linear-gradient(to top, #000000, transparent), linear-gradient(to right, #ffffff, transparent)',
            }}
          >
            {/* Circular selector thumb */}
            <div
              className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white shadow-md pointer-events-none"
              style={{
                left: `${hsb.s}%`,
                top: `${100 - hsb.b}%`,
                backgroundColor: safeValue,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.4)',
              }}
            />
          </div>

          {/* Hue Rainbow Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted">
              <span>Hue</span>
              <span className="font-mono text-fg">{hsb.h}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={hsb.h}
              onChange={(e) => applyHsb({ ...hsb, h: Number(e.target.value) })}
              aria-label="Color Hue"
              className="w-full h-3 rounded-full appearance-none cursor-pointer border border-border"
              style={{
                background:
                  'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
              }}
            />
          </div>

          {/* Brightness Slider + Numeric Readout (Picture 4 bottom row) */}
          <div className="flex items-center gap-3">
            <Sun size={14} className="text-muted shrink-0" />
            <input
              type="range"
              min={0}
              max={100}
              value={hsb.b}
              onChange={(e) => applyHsb({ ...hsb, b: Number(e.target.value) })}
              aria-label="Color Brightness"
              className="flex-1 h-3 rounded-full appearance-none cursor-pointer border border-border"
              style={{
                background: `linear-gradient(to right, #000000 0%, ${fullBrightCurrentSatHex} 100%)`,
              }}
            />
            <span className="w-10 py-1 rounded-lg bg-card border border-border text-center font-mono text-xs font-bold text-fg">
              {hsb.b}
            </span>
          </div>

          {/* Card Text Contrast Preview Strip */}
          <div
            className="p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors"
            style={{
              backgroundColor: cardTheme.bgHex,
              color: cardTheme.textColor,
              borderColor: cardTheme.borderColor,
            }}
          >
            <div>
              <p className="text-xs font-black font-mono">CSD 201 • Lecture Preview</p>
              <p className="text-[11px] font-semibold" style={{ color: cardTheme.mutedColor }}>
                Auto text: {cardTheme.isLightBg ? 'Dark Charcoal' : 'Crisp White'} ({cardTheme.contrastRatio.toFixed(2)}:1)
              </p>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: cardTheme.chipBg }}
            >
              {cardTheme.wcagLevel} ✓
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
