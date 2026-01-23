import { Habit, HabitLog } from '@/types/habit';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';

export const getToday = () => format(new Date(), 'yyyy-MM-dd');

export const getHabitLogsForDate = (habitId: string, date: string, logs: HabitLog[]): HabitLog | undefined => {
  return logs.find(log => log.habitId === habitId && log.date === date);
};

export const getStreakCount = (habitId: string, logs: HabitLog[]): number => {
  let streak = 0;
  let currentDate = new Date();
  
  while (true) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const log = logs.find(l => l.habitId === habitId && l.date === dateStr);
    
    if (log && log.completed) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }
  
  return streak;
};

export const getConsecutiveMissedDays = (habitId: string, logs: HabitLog[]): number => {
  let missed = 0;
  let currentDate = new Date();
  
  while (missed < 7) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const log = logs.find(l => l.habitId === habitId && l.date === dateStr);
    
    if (!log || !log.completed) {
      missed++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }
  
  return missed;
};

export const needsRecoveryMode = (habitId: string, logs: HabitLog[]): boolean => {
  const missedDays = getConsecutiveMissedDays(habitId, logs);
  return missedDays >= 3;
};

export const getWeeklyStats = (habitId: string, logs: HabitLog[]) => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const completedDays = daysInWeek.filter(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const log = logs.find(l => l.habitId === habitId && l.date === dateStr);
    return log && log.completed;
  });
  
  return {
    total: daysInWeek.length,
    completed: completedDays.length,
    percentage: Math.round((completedDays.length / daysInWeek.length) * 100)
  };
};

export const getElasticStreak = (habit: Habit, logs: HabitLog[]): { current: number; isElastic: boolean } => {
  // Elastic Streak: 7일 중 minGoal 이상 달성 시 유지
  const weeklyTarget = Math.ceil(7 * (habit.minGoal / 100));
  let currentStreak = 0;
  let currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  
  while (true) {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const daysInWeek = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });
    
    const completedInWeek = daysInWeek.filter(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
      return log && log.completed;
    }).length;
    
    if (completedInWeek >= weeklyTarget) {
      currentStreak++;
      currentWeekStart = subDays(currentWeekStart, 7);
    } else {
      break;
    }
  }
  
  return {
    current: currentStreak,
    isElastic: true
  };
};

export const getRecoveryMessage = (): string => {
  const messages = [
    '완벽하지 않아도 괜찮아요 ✨',
    '이번 주는 가볍게 가볼까요? 💫',
    '다시 돌아온 것만으로도 대단해요! 🌟',
    '천천히, 하나씩 다시 시작해봐요 🌱',
    '실패가 아니라 회복 중이에요 💪'
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

export const getPauseReasonText = (reason: string): string => {
  const reasons: Record<string, string> = {
    time: '시간이 부족했어요',
    energy: '체력이 저하됐어요',
    motivation: '동기가 떨어졌어요',
    sick: '몸이 안 좋았어요',
    other: '기타 사유'
  };
  
  return reasons[reason] || '기타 사유';
};
