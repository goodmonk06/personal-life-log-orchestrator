export default function Home() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">ようこそ！</h2>
            <p className="text-gray-600 mb-4">
              Personal Life Log Orchestratorは、あなたの「第二の脳」として機能するライフログ基盤です。
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
              <a href="/notes" className="block p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">📝 ノート</h3>
                <p className="text-sm text-blue-700">日々の気づきやメモを記録</p>
              </a>
              <a href="/daily-review" className="block p-6 bg-green-50 rounded-lg hover:bg-green-100 transition">
                <h3 className="text-lg font-semibold text-green-900 mb-2">☀️ 日次レビュー</h3>
                <p className="text-sm text-green-700">1日を振り返り、AI が要約を生成</p>
              </a>
              <a href="/weekly-review" className="block p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">📅 週次レビュー</h3>
                <p className="text-sm text-purple-700">1週間を俯瞰し、目標を設定</p>
              </a>
            </div>
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">🔧 セットアップ</h3>
              <ol className="text-sm text-yellow-800 list-decimal list-inside space-y-1">
                <li>.env ファイルを作成し、必要な環境変数を設定</li>
                <li>npm install でパッケージをインストール</li>
                <li>npm run db:push でデータベーススキーマを同期</li>
                <li>npm run import:google でGoogle データをインポート</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
