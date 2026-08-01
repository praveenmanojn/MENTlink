/**
 * PeerLink Paper Design System — Constants
 * App-wide static data: pin colors, rotation map, card colors, etc.
 */
import { Colors } from './colors';

/** Ordered list of push-pin colors to cycle through */
export const PIN_COLORS = [
  Colors.pinRed,
  Colors.pinYellow,
  Colors.pinBlue,
  Colors.pinBlack,
  Colors.pinGreen,
] as const;

/**
 * Get a deterministic pin color for a given index.
 * Cycles through PIN_COLORS so every card gets a pin.
 */
export const getPinColor = (index: number): string =>
  PIN_COLORS[index % PIN_COLORS.length];

/** Preset card rotation values — used per card type / position */
export const CardRotations = {
  /** Slightly tilted left */
  tiltLeft: -2,
  /** Slightly tilted right */
  tiltRight: 1.5,
  /** More tilted left */
  bigLeft: -3,
  /** More tilted right */
  bigRight: 2.5,
  /** Barely tilted */
  tiny: -0.8,
  /** Straight (no rotation) */
  straight: 0,
} as const;

/** Sticky note background colors for action cards */
export const NoteColors = {
  askDoubt: Colors.stickyRed,
  chat: Colors.stickyYellow,
  session: Colors.stickyBlue,
  mentor: Colors.stickyGreen,
  white: Colors.paperWhite,
  cream: Colors.paperCream,
} as const;

/** App name and tagline */
export const AppInfo = {
  name: 'MENTlink',
  tagline: 'Connect. Learn. Grow.',
  description: 'Hyperlocal peer-to-peer\ndoubt resolution &\nmentorship network.',
} as const;

/** Dummy user credentials — kept identical to existing constants */
export const DUMMY_USERS = [
  { id: 'u1', username: 'teacher', email: 'teacher@peerlink.dev', password: '123t', role: 'mentor' as const },
  { id: 'u2', username: 'student', email: 'student@peerlink.dev', password: '123s', role: 'student' as const },
  { id: 'u3', username: 'admin',   email: 'admin@peerlink.dev',   password: '123a', role: 'admin'   as const },
];

export const findDummyUser = (usernameOrEmail: string, password: string) =>
  DUMMY_USERS.find(
    (u) =>
      (u.username === usernameOrEmail.trim() || u.email === usernameOrEmail.trim()) &&
      u.password === password.trim(),
  );
