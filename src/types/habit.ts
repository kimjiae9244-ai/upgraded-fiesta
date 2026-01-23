export interface Habit {
  id: string;
  title: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  weekDays?: number[]; // 0-6 (Sunday-Saturday)
  timesPerWeek?: number;
  perfectGoal: number; // 100%
  minGoal: number; // 50%
  difficulty: 'easy' | 'medium' | 'hard';
  period: 21 | 66 | 100;
  reason: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  percentage: number; // 0-100
  pauseReason?: 'time' | 'energy' | 'motivation' | 'sick' | 'other';
  pauseNote?: string;
}

export interface RecoveryMode {
  habitId: string;
  startedAt: string;
  reason: string;
  originalGoal: number;
  reducedGoal: number;
  active: boolean;
}

export const HABIT_ICONS = [
  'Dumbbell',
  'Book',
  'Code',
  'PenTool',
  'Coffee',
  'Heart',
  'Laptop',
  'Music',
  'Palette',
  'Camera',
  'Flame',
  'Zap',
  'Target',
  'Trophy',
  'Smile',
  'Sun',
  'Moon',
  'Star',
  'Check',
  'Activity'
];

export const HABIT_COLORS = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Orange
  '#10B981', // Green
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#F97316', // Dark Orange
  '#6366F1', // Indigo
  '#84CC16'  // Lime
];
