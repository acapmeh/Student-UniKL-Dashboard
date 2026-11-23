export interface ThemePreset {
  id: string;
  name: string;
  cssClass: string;
  description: string;
  bgPreview: string;
  cardPreview: string;
  accentPreview: string;
  isDark: boolean;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'unikl-navy',
    name: 'UniKL Navy & Gold',
    cssClass: 'unikl-navy',
    description: 'Signature Universiti Kuala Lumpur identity with #F2B66D warm gold sidebar and #011C3B deep royal navy canvas',
    bgPreview: '#011C3B',
    cardPreview: '#0A294E',
    accentPreview: '#F2B66D',
    isDark: true,
  },
];
