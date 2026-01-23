import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Habit, HABIT_ICONS, HABIT_COLORS } from '@/types/habit';
import { getRecoveryMessage, getConsecutiveMissedDays } from '@/utils/habitUtils';
import { HabitLog } from '@/types/habit';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  editHabit?: Habit;
  logs?: HabitLog[];
}

export function AddHabitModal({ isOpen, onClose, onSave, editHabit, logs = [] }: AddHabitModalProps) {
  const [step, setStep] = useState<'reason' | 'form'>(editHabit ? 'reason' : 'form');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [title, setTitle] = useState(editHabit?.title || '');
  const [icon, setIcon] = useState(editHabit?.icon || 'Target');
  const [color, setColor] = useState(editHabit?.color || HABIT_COLORS[0]);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>(editHabit?.frequency || 'daily');
  const [perfectGoal, setPerfectGoal] = useState(editHabit?.perfectGoal || 100);
  const [minGoal, setMinGoal] = useState(editHabit?.minGoal || 70);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(editHabit?.difficulty || 'medium');
  const [period, setPeriod] = useState<21 | 66 | 100>(editHabit?.period || 21);
  const [reason, setReason] = useState(editHabit?.reason || '');

  // Reset step when modal opens/closes or editHabit changes
  useEffect(() => {
    if (isOpen) {
      setStep(editHabit ? 'reason' : 'form');
      setSelectedReason('');
    }
  }, [isOpen, editHabit]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) {
      alert('습관 이름을 입력해주세요');
      return;
    }

    onSave({
      title,
      icon,
      color,
      frequency,
      perfectGoal,
      minGoal,
      difficulty,
      period,
      reason
    });

    // Reset form
    setTitle('');
    setIcon('Target');
    setColor(HABIT_COLORS[0]);
    setFrequency('daily');
    setPerfectGoal(100);
    setMinGoal(70);
    setDifficulty('medium');
    setPeriod(21);
    setReason('');
    setStep('form');
    setSelectedReason('');
    
    onClose();
  };

  const handleContinueFromReason = () => {
    setStep('form');
  };

  const handleSkipReason = () => {
    setStep('form');
  };

  const IconComponent = (Icons as any)[icon] || Icons.Target;
  
  // Calculate missed days for edit mode
  const missedDays = editHabit ? getConsecutiveMissedDays(editHabit.id, logs) : 0;
  const recoveryMessage = getRecoveryMessage();
  
  const failureReasons = [
    '일이 너무 바빴어요',
    '동기를 잃었어요',
    '목표가 너무 높았어요',
    '건강이 안 좋았어요',
    '그냥 쉬고 싶었어요'
  ];

  // Show reason selection step only when editing
  if (editHabit && step === 'reason') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden">
          {/* Header with gradient */}
          <div 
            className="relative p-8 text-white"
            style={{
              background: `linear-gradient(135deg, ${editHabit.color} 0%, ${editHabit.color}CC 100%)`
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <IconComponent className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{editHabit.title}</h2>
                <p className="text-white/90">{missedDays}일 동안 쉬었어요</p>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-lg font-medium">{recoveryMessage}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              무엇이 어려우셨나요?
            </h3>
            <p className="text-gray-600 mb-6">
              실패 원인을 알면 다음엔 더 잘 준비할 수 있어요. (선택사항)
            </p>

            <div className="space-y-2 mb-6">
              {failureReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full px-5 py-4 text-left rounded-xl transition-all border-2 ${
                    selectedReason === reason
                      ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <button
              onClick={handleContinueFromReason}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              다음
            </button>

            <button
              onClick={handleSkipReason}
              className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium mt-2 transition-colors"
            >
              건너뛰기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {editHabit ? '습관 수정' : '새로운 습관'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 습관 이름 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              습관 이름
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 아침 운동하기"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          {/* 아이콘 선택 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              아이콘
            </label>
            <div className="grid grid-cols-10 gap-2">
              {HABIT_ICONS.map((iconName) => {
                const Icon = (Icons as any)[iconName];
                return (
                  <button
                    key={iconName}
                    onClick={() => setIcon(iconName)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      icon === iconName
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 색상 선택 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              색상
            </label>
            <div className="flex gap-3">
              {HABIT_COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  onClick={() => setColor(colorOption)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    color === colorOption ? 'ring-4 ring-gray-300 scale-110' : ''
                  }`}
                  style={{ backgroundColor: colorOption }}
                />
              ))}
            </div>
          </div>

          {/* 반복 패턴 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              반복 패턴
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['daily', 'weekly', 'custom'] as const).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFrequency(freq)}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    frequency === freq
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {freq === 'daily' ? '매일' : freq === 'weekly' ? '주간' : '커스텀'}
                </button>
              ))}
            </div>
          </div>

          {/* Elastic 목표 */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-4">Elastic 목표 설정</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    완벽 목표 (Perfect Goal)
                  </label>
                  <span className="text-lg font-bold text-purple-600">{perfectGoal}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={perfectGoal}
                  onChange={(e) => setPerfectGoal(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    최소 목표 (Minimum Goal)
                  </label>
                  <span className="text-lg font-bold text-pink-600">{minGoal}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="90"
                  value={minGoal}
                  onChange={(e) => setMinGoal(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                />
              </div>
              
              <p className="text-xs text-gray-600 mt-3">
                💡 완벽 목표를 달성하면 최고! 최소 목표만 달성해도 Streak이 유지됩니다.
              </p>
            </div>
          </div>

          {/* 난이도 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              난이도
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    difficulty === diff
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {diff === 'easy' ? '쉬움' : diff === 'medium' ? '보통' : '어려움'}
                </button>
              ))}
            </div>
          </div>

          {/* 목표 기간 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              목표 기간
            </label>
            <div className="grid grid-cols-3 gap-3">
              {([21, 66, 100] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    period === p
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {p}일
                </button>
              ))}
            </div>
          </div>

          {/* 이유 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이 습관을 만드는 이유 (선택)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="동기를 잃었을 때 다시 돌아볼 수 있어요"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <button
            onClick={handleSave}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            {editHabit ? '수정하기' : '습관 만들기'}
          </button>
        </div>
      </div>
    </div>
  );
}
