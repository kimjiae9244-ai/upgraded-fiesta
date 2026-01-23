import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, Award, Zap } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Habit, HabitLog } from '@/types/habit';
import { getWeeklyStats, getStreakCount, getElasticStreak } from '@/utils/habitUtils';
import { format, subDays, startOfWeek, eachDayOfInterval, endOfWeek } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BarChart3 } from 'lucide-react';

interface StatsViewProps {
  habits: Habit[];
  logs: HabitLog[];
}

export function StatsView({ habits, logs }: StatsViewProps) {
  // Overall stats
  const totalHabits = habits.length;
  const todayLogs = logs.filter(log => log.date === format(new Date(), 'yyyy-MM-dd'));
  const todayCompleted = todayLogs.filter(log => log.completed).length;
  const todayCompletionRate = totalHabits > 0 ? Math.round((todayCompleted / totalHabits) * 100) : 0;

  // Weekly trend data
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklyData = daysInWeek.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayLogs = logs.filter(log => log.date === dateStr);
    const completed = dayLogs.filter(log => log.completed).length;
    const total = habits.length;
    
    return {
      date: format(day, 'EEE', { locale: ko }),
      completion: total > 0 ? Math.round((completed / total) * 100) : 0,
      completed,
      total
    };
  });

  // 30-day trend
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = logs.filter(log => log.date === dateStr);
    const completed = dayLogs.filter(log => log.completed).length;
    
    return {
      date: format(date, 'M/d'),
      completion: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0
    };
  });

  // Habit-specific stats
  const habitStats = habits.map(habit => {
    const weeklyStats = getWeeklyStats(habit.id, logs);
    const streak = getStreakCount(habit.id, logs);
    const elasticStreak = getElasticStreak(habit, logs);
    
    return {
      habit,
      weeklyPercentage: weeklyStats.percentage,
      streak,
      elasticStreak: elasticStreak.current
    };
  }).sort((a, b) => b.weeklyPercentage - a.weeklyPercentage);

  // Best and worst performing habits
  const bestHabit = habitStats[0];
  const worstHabit = habitStats[habitStats.length - 1];

  // Calculate average weekly completion
  const avgWeeklyCompletion = weeklyData.reduce((sum, day) => sum + day.completion, 0) / weeklyData.length;
  const trend = avgWeeklyCompletion >= 70 ? 'up' : avgWeeklyCompletion >= 50 ? 'stable' : 'down';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">통계 & 인사이트</h2>
        <p className="text-gray-600">당신의 습관 여정을 한눈에 확인하세요</p>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100">오늘의 달성률</span>
            <Calendar className="w-5 h-5 text-purple-200" />
          </div>
          <p className="text-4xl font-bold">{todayCompletionRate}%</p>
          <p className="text-purple-100 text-sm mt-2">
            {todayCompleted}/{totalHabits} 완료
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-100">주간 평균</span>
            {trend === 'up' ? (
              <TrendingUp className="w-5 h-5 text-orange-200" />
            ) : trend === 'down' ? (
              <TrendingDown className="w-5 h-5 text-orange-200" />
            ) : (
              <Minus className="w-5 h-5 text-orange-200" />
            )}
          </div>
          <p className="text-4xl font-bold">{Math.round(avgWeeklyCompletion)}%</p>
          <p className="text-orange-100 text-sm mt-2">
            {trend === 'up' ? '상승세예요! 🚀' : trend === 'down' ? '회복이 필요해요 💪' : '안정적이에요 ✨'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-pink-100">활성 습관</span>
            <Zap className="w-5 h-5 text-pink-200" />
          </div>
          <p className="text-4xl font-bold">{totalHabits}</p>
          <p className="text-pink-100 text-sm mt-2">
            꾸준히 관리 중
          </p>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">이번 주 추이</h3>
        {weeklyData.every(day => day.completion === 0) ? (
          <div className="flex flex-col items-center justify-center h-[250px] text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium mb-2">아직 이번 주 기록이 없어요</p>
            <p className="text-sm text-gray-400">습관을 체크하면 추이를 확인할 수 있어요</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'completion') return [`${value}%`, '달성률'];
                  return [value, name];
                }}
              />
              <Bar dataKey="completion" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 30-Day Trend */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">30일 트렌드</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={last30Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="completion" 
              stroke="#ec4899" 
              strokeWidth={3}
              dot={{ fill: '#ec4899', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Habit Rankings */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">습관별 성과</h3>
        
        <div className="space-y-3">
          {habitStats.map((stat, index) => {
            const IconComponent = (Icons as any)[stat.habit.icon] || Icons.Target;
            
            return (
            <div
              key={stat.habit.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="text-2xl font-bold text-gray-400 w-8">
                #{index + 1}
              </div>
              
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${stat.habit.color}20` }}
              >
                <IconComponent className="w-5 h-5" style={{ color: stat.habit.color }} />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-gray-900">{stat.habit.title}</p>
                <p className="text-sm text-gray-500">
                  연속 {stat.streak}일 · Elastic {stat.elasticStreak}주
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: stat.habit.color }}>
                  {stat.weeklyPercentage}%
                </p>
                <p className="text-xs text-gray-500">이번 주</p>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* AI Insights */}
      {totalHabits > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">AI 인사이트</h3>
              
              <div className="space-y-2 text-sm text-gray-700">
                {bestHabit && (
                  <p>
                    ✨ <strong>{bestHabit.habit.title}</strong>이(가) 이번 주 가장 잘하고 있어요! ({bestHabit.weeklyPercentage}% 달성)
                  </p>
                )}
                
                {worstHabit && worstHabit.weeklyPercentage < 50 && (
                  <p>
                    💪 <strong>{worstHabit.habit.title}</strong>이(가) 조금 어려운 것 같아요. Recovery Mode를 고려해보세요.
                  </p>
                )}

                {avgWeeklyCompletion >= 80 && (
                  <p>
                    🎉 이번 주 정말 잘하셨어요! 평균 {Math.round(avgWeeklyCompletion)}% 달성은 대단한 성과예요.
                  </p>
                )}

                {avgWeeklyCompletion < 50 && (
                  <p>
                    🌱 이번 주는 회복 국면이에요. 무리하지 말고 천천히 다시 시작해봐요.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}