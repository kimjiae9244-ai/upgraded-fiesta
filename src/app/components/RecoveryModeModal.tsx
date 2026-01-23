import React, { useState } from 'react';
import { Heart, ArrowRight, Sparkles, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Habit } from '@/types/habit';
import { getRecoveryMessage } from '@/utils/habitUtils';

interface RecoveryModeModalProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
  onAcceptRecovery: (habitId: string, reducedGoal: number) => void;
  missedDays: number;
}

export function RecoveryModeModal({ habit, isOpen, onClose, onAcceptRecovery, missedDays }: RecoveryModeModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const IconComponent = (Icons as any)[habit.icon] || Icons.Target;
  const recoveryMessage = getRecoveryMessage();
  const reducedGoal = Math.max(30, habit.minGoal - 20);

  const reasons = [
    '일이 너무 바빴어요',
    '동기를 잃었어요',
    '목표가 너무 높았어요',
    '건강이 안 좋았어요',
    '그냥 쉬고 싶었어요'
  ];

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onAcceptRecovery(habit.id, reducedGoal);
      onClose();
      setStep(1);
      setSelectedReason('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden">
        {/* Header with gradient */}
        <div 
          className="relative p-8 text-white"
          style={{
            background: `linear-gradient(135deg, ${habit.color} 0%, ${habit.color}CC 100%)`
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
              <h2 className="text-2xl font-bold">{habit.title}</h2>
              <p className="text-white/90">{missedDays}일 동안 쉬었어요</p>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-lg font-medium">{recoveryMessage}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 1 ? (
            <>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                무엇이 어려우셨나요?
              </h3>
              <p className="text-gray-600 mb-6">
                실패 원인을 알면 다음엔 더 잘 준비할 수 있어요. (선택사항)
              </p>

              <div className="space-y-2 mb-6">
                {reasons.map((reason) => (
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
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  가벼운 재시작 플랜
                </h3>
                <p className="text-gray-600">
                  부담 없이 다시 시작할 수 있도록 목표를 조정했어요
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">기존 최소 목표</p>
                    <p className="text-2xl font-bold text-gray-400">{habit.minGoal}%</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">회복 모드 목표</p>
                    <p className="text-2xl font-bold text-purple-600">{reducedGoal}%</p>
                  </div>
                </div>

                <div className="bg-white/60 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>첫 주는 이 목표로 시작해요.</strong> 익숙해지면 언제든 다시 올릴 수 있어요.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <Heart className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900 mb-1">복귀 보상</p>
                    <p className="text-sm text-yellow-800">
                      재시작하면 특별 뱃지와 보너스 포인트를 드려요!
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            onClick={handleContinue}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            {step === 1 ? '다음' : '가벼운 재시작 하기'}
          </button>

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium mt-2 transition-colors"
            >
              건너뛰기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
