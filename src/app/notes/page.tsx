'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc-client';

const DEFAULT_USER_ID = 'default-user'; // In production, get from auth

export default function NotesPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [content, setContent] = useState<string>('');

  // Query for the note of the selected date
  const { data: note, isLoading } = trpc.notes.getByDate.useQuery({
    userId: DEFAULT_USER_ID,
    date: selectedDate,
  });

  // Update content when note data changes
  useEffect(() => {
    if (note) {
      setContent(note.content);
    } else {
      setContent('');
    }
  }, [note]);

  // Mutation to save note
  const utils = trpc.useContext();
  const upsertNote = trpc.notes.upsert.useMutation({
    onSuccess: () => {
      alert('ノートを保存しました！');
      utils.notes.getByDate.invalidate();
    },
  });

  const handleSave = () => {
    upsertNote.mutate({
      userId: DEFAULT_USER_ID,
      date: selectedDate,
      content,
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📝 ノート</h2>

            <div className="mb-4">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                日付
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
              />
            </div>

            {isLoading ? (
              <div className="text-gray-500">読み込み中...</div>
            ) : (
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  内容
                </label>
                <textarea
                  id="content"
                  rows={15}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                  placeholder="今日の気づきやメモを書いてください..."
                />
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={upsertNote.isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {upsertNote.isLoading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
