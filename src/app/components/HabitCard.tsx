import React, { useState } from 'react';
import { Check, Pause, TrendingUp, Flame, MoreVertical, Edit, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Habit, HabitLog } from '@/types/habit';
import { getToday, getStreakCount, getElasticStreak, getWeeklyStats } from '@/utils/habitUtils';

interface HabitCardProps {
  habit: Habit;
  logs: HabitLog[];
  onCheck: (habitId: string, completed: boolean, percentage?: number) => void;
  onPause: (habitId: string, reason: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export function HabitCard({ habit, logs, onCheck, onPause, onEdit, onDelete }: HabitCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showPercentageSlider, setShowPercentageSlider] = useState(false);
  const [percentage, setPercentage] = useState(100);

  const today = getToday();
  const todayLog = logs.find(log => log.habitId === habit.id && log.date === today);
  const isChecked = todayLog?.completed || false;
  const isPaused = todayLog && !todayLog.completed && todayLog.pauseReason;

  const streak = getStreakCount(habit.id, logs);
  const elasticStreak = getElasticStreak(habit, logs);
  const weeklyStats = getWeeklyStats(habit.id, logs);

  const IconComponent = (Icons as any)[habit.icon] || Icons.Target;

  const handleCheck = () => {
    if (isChecked) {
      onCheck(habit.id, false);
    } else {
      setShowPercentageSlider(true);
    }
  };

  const handlePercentageConfirm = () => {
    onCheck(habit.id, true, percentage);
    setShowPercentageSlider(false);
    setPercentage(100);
  };

  const handlePauseSelect = (reason: string) => {
    onPause(habit.id, reason);
    setShowPauseMenu(false);
  };

  const pauseReasons = [
    { value: 'time', label: '시간이 부족했어요' },
    { value: 'energy', label: '체력이 저하됐어요' },
    { value: 'motivation', label: '동기가 떨어졌어요' },
    { value: 'sick', label: '몸이 안 좋았어요' },
    { value: 'other', label: '기타 사유' }
  ];

  return (
    <div 
      className="relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-gray-100"
      style={{ 
        borderColor: isChecked ? habit.color : 'transparent',
        backgroundColor: isChecked ? `${habit.color}10` : 'white'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${habit.color}20` }}
          >
            <IconComponent className="w-6 h-6" style={{ color: habit.color }} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{habit.title}</h3>
            <p className="text-sm text-gray-500">
              {habit.frequency === 'daily' ? '매일' : '주간'} · {habit.difficulty === 'easy' ? '쉬움' : habit.difficulty === 'medium' ? '보통' : '어려움'}
            </p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => {
                  onEdit(habit);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                수정
              </button>
              <button
                onClick={() => {
                  if (confirm('정말 삭제하시겠습니까?')) {
                    onDelete(habit.id);
                  }
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-1 text-orange-500 mb-1">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-medium">연속</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{streak}일</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-1 text-purple-500 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">이번 주</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{weeklyStats.percentage}%</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-1 text-blue-500 mb-1">
            <Check className="w-4 h-4" />
            <span className="text-xs font-medium">Elastic</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{elasticStreak.current}주</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCheck}
          disabled={isPaused}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            isChecked
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
              : isPaused
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg'
          }`}
        >
          {isChecked ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              완료!
            </span>
          ) : isPaused ? (
            '쉬는 중'
          ) : (
            '체크하기'
          )}
        </button>

        {!isChecked && !isPaused && (
          <button
            onClick={() => setShowPauseMenu(true)}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <Pause className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Percentage Slider */}
      {showPercentageSlider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">얼마나 달성했나요?</h3>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">달성률</span>
                <span className="text-3xl font-bold" style={{ color: habit.color }}>
                  {percentage}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: habit.color }}
              />
              
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowPercentageSlider(false);
                  setPercentage(100);
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handlePercentageConfirm}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Reason Menu */}
      {showPauseMenu && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">쉼표 기록하기</h3>
            <p className="text-sm text-gray-600 mb-6">
              괜찮아요. 오늘 하지 못한 이유를 기록해두면, 패턴을 파악하는데 도움이 돼요.
            </p>

            <div className="space-y-2">
              {pauseReasons.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => handlePauseSelect(reason.value)}
                  className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {reason.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowPauseMenu(false)}
              className="w-full mt-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Reason Display */}
      {habit.reason && !isChecked && !isPaused && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">왜 이 습관을 만들었나요?</p>
          <p className="text-sm text-gray-700 italic">"{habit.reason}"</p>
        </div>
      )}
    </div>
  );
}
