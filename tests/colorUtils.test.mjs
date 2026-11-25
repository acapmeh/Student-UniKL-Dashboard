import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SUBJECT_COLOR_PRESETS,
  normalizeHex,
  hexToHsb,
  hsbToHex,
  getContrastRatio,
  getCardContrastTheme,
} from '../.tmp-test/lib/colorUtils.js';

test('SUBJECT_COLOR_PRESETS exposes 10 distinct valid hex color themes', () => {
  assert.equal(SUBJECT_COLOR_PRESETS.length, 10);
  const uniqueHexes = new Set(SUBJECT_COLOR_PRESETS.map((p) => p.hex.toUpperCase()));
  assert.equal(uniqueHexes.size, 10);
  for (const preset of SUBJECT_COLOR_PRESETS) {
    assert.ok(normalizeHex(preset.hex), `Invalid preset hex: ${preset.hex}`);
  }
});

test('normalizeHex normalizes 3-char and 6-char hex values and rejects invalid inputs', () => {
  assert.equal(normalizeHex('ffe8f0'), '#FFE8F0');
  assert.equal(normalizeHex('#abc'), '#AABBCC');
  assert.equal(normalizeHex('#00400C'), '#00400C');
  assert.equal(normalizeHex('#ZZZZZZ'), null);
  assert.equal(normalizeHex(''), null);
});

test('hsbToHex and hexToHsb round-trip primary and custom colors cleanly', () => {
  const greenHsb = hexToHsb('#00400C');
  const backToHex = hsbToHex(greenHsb.h, greenHsb.s, greenHsb.b);
  assert.ok(getContrastRatio('#00400C', backToHex) <= 1.05);
});

test('getCardContrastTheme picks dark text for pastel Rose Pink and white text for Deep Forest #00400C', () => {
  const rose = getCardContrastTheme('#FFD5DC');
  assert.equal(rose.isLightBg, true);
  assert.equal(rose.textColor, '#0F172A');
  assert.ok(rose.contrastRatio >= 7, `Expected AAA contrast on pastel rose, got ${rose.contrastRatio}`);
  assert.equal(rose.wcagLevel, 'AAA');

  const forest = getCardContrastTheme('#00400C');
  assert.equal(forest.isLightBg, false);
  assert.equal(forest.textColor, '#FFFFFF');
  assert.ok(forest.contrastRatio >= 10, `Expected high contrast on #00400C, got ${forest.contrastRatio}`);
  assert.equal(forest.wcagLevel, 'AAA');
});
