/**
 * PeerLink Paper Design System — Color Tokens
 * Extracted from the bulletin board reference image.
 * Every color used in the app must come from here.
 */

export const Colors = {
  // ─── Background ───────────────────────────────────────────────────────────
  /** Main app background: warm notebook beige */
  notebookBg: '#F5F0E8',
  /** Grid line color for notebook background */
  gridLine: '#D8CFC0',

  // ─── Paper / Card Surfaces ────────────────────────────────────────────────
  /** Pure white sticky note */
  paperWhite: '#FFFDF5',
  /** Warm off-white (default card) */
  paperCream: '#FAF6ED',
  /** Red sticky note (Ask a Doubt, urgent actions) */
  stickyRed: '#E8453C',
  /** Light red sticky note */
  stickyRedLight: '#F2726B',
  /** Yellow sticky note (sessions, highlights) */
  stickyYellow: '#F5C842',
  /** Light yellow sticky note */
  stickyYellowLight: '#F9D96A',
  /** Blue sticky note (chats, cool actions) */
  stickyBlue: '#7EC8E3',
  /** Light blue sticky note */
  stickyBlueLight: '#A4D8EC',
  /** Green sticky note (mentors, availability) */
  stickyGreen: '#7CC47E',
  /** Light green sticky note */
  stickyGreenLight: '#9ED3A0',

  // ─── Push Pin Colors ──────────────────────────────────────────────────────
  pinRed: '#D93025',
  pinYellow: '#F9AB00',
  pinBlue: '#1A73E8',
  pinBlack: '#1A1A1A',
  pinGreen: '#1E8E3E',
  /** Alias for pinGreen used in register/mentor screens */
  green: '#1E8E3E',

  // ─── Ink / Typography ─────────────────────────────────────────────────────
  /** Primary ink — almost black */
  inkBlack: '#1A1A1A',
  /** Secondary ink — dark grey */
  inkDark: '#2D2D2D',
  /** Muted ink — medium grey */
  inkMedium: '#4A4A4A',
  /** Light ink — for placeholders */
  inkLight: '#7A7A7A',
  /** Very light ink — faint text */
  inkFaint: '#A0A0A0',

  // ─── Borders ──────────────────────────────────────────────────────────────
  /** Main card border */
  borderBlack: '#1A1A1A',
  /** Input border */
  borderInk: '#2D2D2D',
  /** Light border */
  borderLight: '#B8AFA0',

  // ─── Status Colors ────────────────────────────────────────────────────────
  statusSolved: '#1E8E3E',
  statusSolvedBg: '#E8F5E9',
  statusPending: '#F9AB00',
  statusPendingBg: '#FFF8E1',
  statusError: '#D93025',
  statusErrorBg: '#FCE8E6',

  // ─── White / Transparent ──────────────────────────────────────────────────
  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof Colors;
