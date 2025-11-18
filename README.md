# Personal Life Log Orchestrator

あなたの「第二の脳」として機能するライフログ基盤システムです。カレンダー、タスク、メモ、支出などの情報を一元管理し、AI を活用して日次・週次のレビューを自動生成します。

## 🌟 主な機能

### 1. データインポート
- **Google Calendar 連携**: 予定を自動取得
- **Gmail 連携**: メールログを自動取得
- カスタムスクリプトで簡単にインポート可能

### 2. ノート機能
- 日付ごとにメモを記録
- シンプルで使いやすいエディタ
- 日次レビューの材料として活用

### 3. 日次サマリ（AI 生成）
- その日の出来事を OpenAI が要約
- 良かったこと 3 つを自動抽出
- 明日やること 3 つを提案
- 気分タグの自動生成

### 4. 週次レビュー（AI 生成）
- 1 週間分のデータを俯瞰
- 達成したことのハイライト
- 課題や反省点の抽出
- 来週の目標を提案

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **API レイヤー**: tRPC
- **データベース**: Prisma + PostgreSQL
- **外部連携**:
  - Google Calendar API
  - Gmail API
  - Google Sheets API（将来対応）
  - OpenAI API (GPT-4o-mini)

## 📦 データモデル

### LifeUser
ユーザー情報を管理

### EventLog
すべてのイベントを統一的に記録
- type: `calendar`, `email`, `expense`, `note`, `task` など
- source: `google_calendar`, `gmail`, `manual` など
- payloadJson: イベントの詳細情報（柔軟な JSON 形式）

### Note
日付ごとのメモ

### DailySummary
AI 生成の日次サマリ
- summaryMarkdown: 要約文
- moodTag: 気分タグ
- highlightsJson: 良かったこと、明日やること

### WeeklyReview
AI 生成の週次レビュー
- summaryMarkdown: 週間要約
- goalsJson: 達成・課題・来週の目標

## 🚀 セットアップ

### 1. 環境変数の設定

`.env.example` を `.env` にコピーして、以下の値を設定してください：

```bash
cp .env.example .env
```

```env
# PostgreSQL データベース
DATABASE_URL="postgresql://user:password@localhost:5432/lifelog?schema=public"

# OpenAI API キー
OPENAI_API_KEY="sk-..."

# Google OAuth2 認証情報
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
```

### 2. パッケージのインストール

```bash
npm install
```

### 3. データベースのセットアップ

```bash
# Prisma クライアントの生成
npm run db:generate

# データベーススキーマの同期
npm run db:push
```

### 4. Google API の設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. Google Calendar API と Gmail API を有効化
3. OAuth 2.0 クライアント ID を作成
4. 認証情報をダウンロードして `credentials.json` として保存（またはスクリプトで環境変数を使用）

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 にアクセスしてください。

## 📥 Google データのインポート

```bash
# 過去 7 日間のデータをインポート
npm run import:google

# 日数を指定してインポート
npm run import:google -- --days=30
```

初回実行時は Google OAuth 認証が必要です。ブラウザが開くので、アクセスを許可してください。

## 📖 使い方

### ノートを書く
1. `/notes` ページにアクセス
2. 日付を選択
3. 自由にメモを記入
4. 「保存」ボタンをクリック

### 日次レビューを生成
1. `/daily-review` ページにアクセス
2. 日付を選択
3. 「AI で生成」ボタンをクリック
4. AI がその日の出来事を要約し、良かったことと明日やることを提案

### 週次レビューを生成
1. `/weekly-review` ページにアクセス
2. 週の開始日（月曜日）を選択
3. 「AI で生成」ボタンをクリック
4. AI が 1 週間を振り返り、達成・課題・来週の目標を提案

## 🔮 将来の構想

### personal-knowledge-vault-local-first との連携

このプロジェクトは、将来的に **local-first** のナレッジベースと連携する構想があります：

- **重要なノートのローカル複製**: クラウドとローカルのハイブリッド保存
- **Markdown ベースの知識管理**: Obsidian や Logseq との互換性
- **オフライン対応**: ネットワークなしでもアクセス可能
- **プライバシー重視**: 機密情報はローカルのみに保存

### その他の拡張計画

- **Notion, Evernote からのインポート**
- **GitHub Activity の統合**
- **スプレッドシートでの支出管理**
- **ビジュアルダッシュボード（グラフ・チャート）**
- **モバイルアプリ対応**

## 🤝 貢献

このプロジェクトはオープンソースです。Issue や PR を歓迎します！

## 📄 ライセンス

MIT License

---

**Built with ❤️ for building your second brain**
