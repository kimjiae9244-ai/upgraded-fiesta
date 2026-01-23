import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, Home, Sparkles } from 'lucide-react';
import { Habit, HabitLog, RecoveryMode } from '@/types/habit';
import { HabitCard } from '@/app/components/HabitCard';
import { AddHabitModal } from '@/app/components/AddHabitModal';
import { StatsView } from '@/app/components/StatsView';
import { RecoveryModeModal } from '@/app/components/RecoveryModeModal';
import { getToday, needsRecoveryMode, getConsecutiveMissedDays } from '@/utils/habitUtils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const STORAGE_KEYS = {
  HABITS: 'habits',
  LOGS: 'habit-logs',
  RECOVERY: 'recovery-modes'
};

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [recoveryModes, setRecoveryModes] = useState<RecoveryMode[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();
  const [currentView, setCurrentView] = useState<'home' | 'stats'>('home');
  const [recoveryModalHabit, setRecoveryModalHabit] = useState<Habit | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const storedHabits = localStorage.getItem(STORAGE_KEYS.HABITS);
    const storedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
    const storedRecovery = localStorage.getItem(STORAGE_KEYS.RECOVERY);

    if (storedHabits) setHabits(JSON.parse(storedHabits));
    if (storedLogs) setLogs(JSON.parse(storedLogs));
    if (storedRecovery) setRecoveryModes(JSON.parse(storedRecovery));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECOVERY, JSON.stringify(recoveryModes));
  }, [recoveryModes]);

  // Check for recovery mode on mount and when logs change
  useEffect(() => {
    habits.forEach(habit => {
      const needsRecovery = needsRecoveryMode(habit.id, logs);
      const alreadyInRecovery = recoveryModes.find(
        rm => rm.habitId === habit.id && rm.active
      );

      if (needsRecovery && !alreadyInRecovery) {
        const missedDays = getConsecutiveMissedDays(habit.id, logs);
        if (missedDays >= 3) {
          // Show recovery modal
          setRecoveryModalHabit(habit);
        }
      }
    });
  }, [habits, logs]);

  const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    if (editingHabit) {
      // Update existing habit
      setHabits(habits.map(h => 
        h.id === editingHabit.id 
          ? { ...habitData, id: editingHabit.id, createdAt: editingHabit.createdAt }
          : h
      ));
      setEditingHabit(undefined);
    } else {
      // Create new habit
      const newHabit: Habit = {
        ...habitData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      setHabits([...habits, newHabit]);
    }
  };

  const handleCheckHabit = (habitId: string, completed: boolean, percentage: number = 100) => {
    const today = getToday();
    const existingLog = logs.find(log => log.habitId === habitId && log.date === today);

    if (existingLog) {
      // Update existing log
      setLogs(logs.map(log =>
        log.id === existingLog.id
          ? { ...log, completed, percentage }
          : log
      ));
    } else {
      // Create new log
      const newLog: HabitLog = {
        id: crypto.randomUUID(),
        habitId,
        date: today,
        completed,
        percentage
      };
      setLogs([...logs, newLog]);
    }

    // If checking after recovery mode, deactivate recovery mode
    if (completed) {
      setRecoveryModes(recoveryModes.map(rm =>
        rm.habitId === habitId && rm.active
          ? { ...rm, active: false }
          : rm
      ));
    }
  };

  const handlePauseHabit = (habitId: string, reason: string) => {
    const today = getToday();
    const existingLog = logs.find(log => log.habitId === habitId && log.date === today);

    if (existingLog) {
      setLogs(logs.map(log =>
        log.id === existingLog.id
          ? { ...log, completed: false, pauseReason: reason as any }
          : log
      ));
    } else {
      const newLog: HabitLog = {
        id: crypto.randomUUID(),
        habitId,
        date: today,
        completed: false,
        percentage: 0,
        pauseReason: reason as any
      };
      setLogs([...logs, newLog]);
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowAddModal(true);
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits(habits.filter(h => h.id !== habitId));
    setLogs(logs.filter(log => log.habitId !== habitId));
    setRecoveryModes(recoveryModes.filter(rm => rm.habitId !== habitId));
  };

  const handleAcceptRecovery = (habitId: string, reducedGoal: number) => {
    const newRecoveryMode: RecoveryMode = {
      habitId,
      startedAt: new Date().toISOString(),
      reason: 'consecutive_missed',
      originalGoal: habits.find(h => h.id === habitId)?.minGoal || 70,
      reducedGoal,
      active: true
    };

    setRecoveryModes([...recoveryModes, newRecoveryMode]);
    
    // Update habit's minGoal temporarily
    setHabits(habits.map(h =>
      h.id === habitId
        ? { ...h, minGoal: reducedGoal }
        : h
    ));

    setRecoveryModalHabit(null);
  };

  const todayFormatted = format(new Date(), 'M월 d일 EEEE', { locale: ko });
  const activeRecoveryCount = recoveryModes.filter(rm => rm.active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                루틴 습관 트래커
              </h1>
              <p className="text-sm text-gray-600 mt-1">{todayFormatted}</p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">새 습관</span>
            </button>
          </div>

          {/* Recovery Mode Banner */}
          {activeRecoveryCount > 0 && (
            <div className="mt-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-900">
                  {activeRecoveryCount}개의 습관이 Recovery Mode입니다. 가볍게 다시 시작해보세요! 💪
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' ? (
          <>
            {habits.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-6">
                  <Sparkles className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  첫 번째 습관을 만들어보세요
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  의지보다 회복력을 설계하는 습관 트래커입니다.<br />
                  완벽하지 않아도 괜찮아요. 함께 시작해봐요!
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  습관 만들기
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {habits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    logs={logs}
                    onCheck={handleCheckHabit}
                    onPause={handlePauseHabit}
                    onEdit={handleEditHabit}
                    onDelete={handleDeleteHabit}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <StatsView habits={habits} logs={logs} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 safe-area-inset-bottom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-around py-3">
            <button
              onClick={() => setCurrentView('home')}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all ${
                currentView === 'home'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">홈</span>
            </button>

            <button
              onClick={() => setCurrentView('stats')}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all ${
                currentView === 'stats'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs font-medium">통계</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <AddHabitModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingHabit(undefined);
        }}
        onSave={handleSaveHabit}
        editHabit={editingHabit}
        logs={logs}
      />

      {recoveryModalHabit && (
        <RecoveryModeModal
          habit={recoveryModalHabit}
          isOpen={true}
          onClose={() => setRecoveryModalHabit(null)}
          onAcceptRecovery={handleAcceptRecovery}
          missedDays={getConsecutiveMissedDays(recoveryModalHabit.id, logs)}
        />
      )}

      {/* Spacing for bottom nav */}
      <div className="h-20"></div>
    </div>
  );
}
