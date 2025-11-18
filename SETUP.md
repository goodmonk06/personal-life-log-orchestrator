# セットアップガイド

このドキュメントでは、Personal Life Log Orchestrator のセットアップ手順を詳しく説明します。

## 前提条件

- Node.js 18 以降
- PostgreSQL 14 以降
- Google アカウント
- OpenAI API キー

## ステップ 1: PostgreSQL のセットアップ

### Docker を使う場合（推奨）

```bash
docker run --name lifelog-postgres \
  -e POSTGRES_USER=lifelog \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=lifelog \
  -p 5432:5432 \
  -d postgres:16
```

### ローカルインストールの場合

1. PostgreSQL をインストール
2. データベースとユーザーを作成：

```sql
CREATE DATABASE lifelog;
CREATE USER lifelog WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE lifelog TO lifelog;
```

## ステップ 2: Google Cloud Console の設定

### 1. プロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成

### 2. API の有効化

1. 「API とサービス」→「ライブラリ」に移動
2. 以下の API を検索して有効化：
   - Google Calendar API
   - Gmail API

### 3. OAuth 2.0 クライアント ID の作成

1. 「API とサービス」→「認証情報」に移動
2. 「認証情報を作成」→「OAuth クライアント ID」を選択
3. アプリケーションの種類：「デスクトップアプリ」を選択
4. 名前を入力して作成
5. JSON をダウンロードして `credentials.json` として保存

### 4. OAuth 同意画面の設定

1. 「OAuth 同意画面」に移動
2. ユーザータイプ：「外部」を選択（テスト用）
3. 必要な情報を入力
4. スコープは自動で設定されます

## ステップ 3: OpenAI API キーの取得

1. [OpenAI Platform](https://platform.openai.com/) にアクセス
2. アカウントを作成またはログイン
3. 「API Keys」からキーを生成

## ステップ 4: 環境変数の設定

`.env` ファイルを作成：

```bash
cp .env.example .env
```

以下の値を設定：

```env
# PostgreSQL
DATABASE_URL="postgresql://lifelog:yourpassword@localhost:5432/lifelog?schema=public"

# OpenAI
OPENAI_API_KEY="sk-proj-..."

# Google OAuth（credentials.json を使う場合は不要）
# GOOGLE_CLIENT_ID="..."
# GOOGLE_CLIENT_SECRET="..."
# GOOGLE_REDIRECT_URI="http://localhost:3000"
```

## ステップ 5: アプリケーションのセットアップ

```bash
# 依存関係のインストール
npm install

# Prisma クライアントの生成
npm run db:generate

# データベーススキーマの同期
npm run db:push
```

## ステップ 6: 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## ステップ 7: Google データのインポート

### 初回認証

```bash
npm run import:google
```

実行すると、ブラウザが開いて Google 認証画面が表示されます：

1. Google アカウントでログイン
2. アクセス許可を承認
3. 認証が完了すると `token.json` が生成されます

### データのインポート

```bash
# 過去 7 日間のデータ
npm run import:google

# 過去 30 日間のデータ
npm run import:google -- --days=30
```

## トラブルシューティング

### データベース接続エラー

```
Error: Can't reach database server
```

**解決方法:**
1. PostgreSQL が起動しているか確認
2. DATABASE_URL が正しいか確認
3. ファイアウォール設定を確認

### Google 認証エラー

```
Error: invalid_client
```

**解決方法:**
1. credentials.json が正しい場所にあるか確認
2. Google Cloud Console で OAuth 設定を確認
3. リダイレクト URI が正しいか確認

### OpenAI API エラー

```
Error: Invalid API key
```

**解決方法:**
1. API キーが正しく設定されているか確認
2. OpenAI アカウントに残高があるか確認
3. API キーの権限を確認

## 次のステップ

セットアップが完了したら、以下を試してください：

1. `/notes` でノートを作成
2. Google データをインポート
3. `/daily-review` で日次サマリを生成
4. `/weekly-review` で週次レビューを生成

楽しいライフログを！
