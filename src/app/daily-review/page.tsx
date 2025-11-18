'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';

const DEFAULT_USER_ID = 'default-user';

export default function DailyReviewPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const { data: summary, isLoading, refetch } = trpc.dailySummary.getByDate.useQuery({
    userId: DEFAULT_USER_ID,
    date: selectedDate,
  });

  const generateSummary = trpc.dailySummary.generate.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleGenerate = () => {
    if (confirm('AIを使って日次サマリを生成しますか？（OpenAI APIを使用します）')) {
      generateSummary.mutate({
        userId: DEFAULT_USER_ID,
        date: selectedDate,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">☀️ 日次レビュー</h2>

            <div className="mb-4">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                日付
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
              />
            </div>

            {isLoading ? (
              <div className="text-gray-500">読み込み中...</div>
            ) : summary ? (
              <div>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">サマリ</h3>
                    {summary.moodTag && (
                      <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                        {summary.moodTag}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{summary.summaryMarkdown}</p>
                </div>

                {summary.highlightsJson && typeof summary.highlightsJson === 'object' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {'goodThings' in summary.highlightsJson && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">✨ 良かったこと</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {(summary.highlightsJson.goodThings as string[]).map((item, idx) => (
                            <li key={idx} className="text-sm text-green-800">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {'todoTomorrow' in summary.highlightsJson && (
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-semibold text-purple-900 mb-2">📋 明日やること</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {(summary.highlightsJson.todoTomorrow as string[]).map((item, idx) => (
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
                    disabled={generateSummary.isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {generateSummary.isLoading ? '生成中...' : '再生成'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">この日のサマリはまだありません</p>
                <button
                  onClick={handleGenerate}
                  disabled={generateSummary.isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {generateSummary.isLoading ? '生成中...' : 'AIで生成'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
