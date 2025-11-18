'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';

const DEFAULT_USER_ID = 'default-user';

function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export default function WeeklyReviewPage() {
  const [weekStartDate, setWeekStartDate] = useState<string>(
    getMondayOfWeek(new Date())
  );

  const { data: review, isLoading, refetch } = trpc.weeklyReview.getByWeekStart.useQuery({
    userId: DEFAULT_USER_ID,
    weekStartDate,
  });

  const generateReview = trpc.weeklyReview.generate.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleGenerate = () => {
    if (confirm('AIを使って週次レビューを生成しますか？（OpenAI APIを使用します）')) {
      generateReview.mutate({
        userId: DEFAULT_USER_ID,
        weekStartDate,
      });
    }
  };

  const handlePreviousWeek = () => {
    const current = new Date(weekStartDate);
    current.setDate(current.getDate() - 7);
    setWeekStartDate(getMondayOfWeek(current));
  };

  const handleNextWeek = () => {
    const current = new Date(weekStartDate);
    current.setDate(current.getDate() + 7);
    setWeekStartDate(getMondayOfWeek(current));
  };

  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📅 週次レビュー</h2>

            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={handlePreviousWeek}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ← 前週
              </button>
              <div className="text-center">
                <div className="text-sm text-gray-600">週の始まり（月曜日）</div>
                <div className="text-lg font-semibold">
                  {new Date(weekStartDate).toLocaleDateString('ja-JP')} - {weekEnd.toLocaleDateString('ja-JP')}
                </div>
              </div>
              <button
                onClick={handleNextWeek}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                次週 →
              </button>
            </div>

            {isLoading ? (
              <div className="text-gray-500">読み込み中...</div>
            ) : review ? (
              <div>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">週間サマリ</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{review.summaryMarkdown}</p>
                </div>

                {review.goalsJson && typeof review.goalsJson === 'object' && (
                  <div className="space-y-4">
                    {'achievements' in review.goalsJson && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">🎯 達成したこと</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {(review.goalsJson.achievements as string[]).map((item, idx) => (
                            <li key={idx} className="text-sm text-green-800">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {'challenges' in review.goalsJson && (
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-semibold text-yellow-900 mb-2">💡 課題・反省点</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {(review.goalsJson.challenges as string[]).map((item, idx) => (
                            <li key={idx} className="text-sm text-yellow-800">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {'nextWeekGoals' in review.goalsJson && (
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-semibold text-purple-900 mb-2">🚀 来週の目標</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {(review.goalsJson.nextWeekGoals as string[]).map((item, idx) => (
                            <li key={idx} className="text-sm text-purple-800">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleGenerate}
                    disabled={generateReview.isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    {generateReview.isLoading ? '生成中...' : '再生成'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">この週のレビューはまだありません</p>
                <button
                  onClick={handleGenerate}
                  disabled={generateReview.isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {generateReview.isLoading ? '生成中...' : 'AIで生成'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
