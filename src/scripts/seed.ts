import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default user
  const user = await prisma.lifeUser.upsert({
    where: { email: 'demo@lifelog.app' },
    update: {},
    create: {
      email: 'demo@lifelog.app',
      name: 'Demo User',
      externalId: 'demo-user-001',
    },
  });

  console.log('✅ Created user:', user.email);

  // Create sample notes
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  await prisma.note.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
    update: {},
    create: {
      userId: user.id,
      date: today,
      content: `# 今日の振り返り

## やったこと
- プロジェクトのセットアップ完了
- ライフログアプリの初期実装
- データベーススキーマの設計

## 学んだこと
- tRPCとPrismaの組み合わせは型安全性が高い
- Next.js App Routerでのデータフェッチングパターン

## 明日やること
- テストの追加
- Docker環境の整備
- CI/CDパイプラインの構築`,
    },
  });

  await prisma.note.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: yesterday,
      },
    },
    update: {},
    create: {
      userId: user.id,
      date: yesterday,
      content: `# 昨日の記録

## 完了タスク
- 要件定義の完了
- 技術スタックの選定
- プロトタイプの作成

## 気づき
- ユーザー体験を重視した設計の重要性
- シンプルさと拡張性のバランス

## 改善点
- もっと早くフィードバックをもらうべきだった`,
    },
  });

  await prisma.note.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: twoDaysAgo,
      },
    },
    update: {},
    create: {
      userId: user.id,
      date: twoDaysAgo,
      content: `# 2日前の記録

## 活動内容
- チームミーティング
- アーキテクチャレビュー
- 技術調査

## 成果
- システム構成の合意形成
- 開発スケジュールの確定`,
    },
  });

  console.log('✅ Created sample notes');

  // Create sample event logs
  const eventsToCreate = [
    {
      userId: user.id,
      type: 'calendar',
      source: 'manual',
      occurredAt: new Date(today.setHours(10, 0, 0, 0)),
      payloadJson: {
        summary: 'チームスタンドアップ',
        description: '毎日の進捗共有ミーティング',
      },
    },
    {
      userId: user.id,
      type: 'calendar',
      source: 'manual',
      occurredAt: new Date(today.setHours(14, 0, 0, 0)),
      payloadJson: {
        summary: 'プロジェクトレビュー',
        description: '週次のプロジェクト進捗レビュー',
      },
    },
    {
      userId: user.id,
      type: 'task',
      source: 'manual',
      occurredAt: new Date(today.setHours(11, 30, 0, 0)),
      payloadJson: {
        title: 'データベーススキーマの設計',
        status: 'completed',
      },
    },
    {
      userId: user.id,
      type: 'email',
      source: 'manual',
      occurredAt: new Date(today.setHours(9, 15, 0, 0)),
      payloadJson: {
        from: 'colleague@company.com',
        subject: 'プロジェクトの進捗について',
        snippet: '先日の件、進捗はいかがでしょうか？',
      },
    },
  ];

  for (const event of eventsToCreate) {
    await prisma.eventLog.create({ data: event });
  }

  console.log('✅ Created sample event logs');

  // Create a sample daily summary
  await prisma.dailySummary.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: yesterday,
      },
    },
    update: {},
    create: {
      userId: user.id,
      date: yesterday,
      summaryMarkdown: `昨日は要件定義と技術スタックの選定を完了しました。チームでの議論を通じて、ユーザー体験を最優先にした設計方針が決まりました。プロトタイプも作成でき、順調に進んでいます。`,
      moodTag: 'productive',
      highlightsJson: {
        goodThings: [
          '要件定義が無事完了',
          'チームの合意形成がスムーズだった',
          'プロトタイプの完成',
        ],
        todoTomorrow: [
          'プロジェクトのセットアップ',
          'データベーススキーマの設計',
          '初期実装の開始',
        ],
      },
    },
  });

  console.log('✅ Created sample daily summary');

  // Create a sample weekly review
  const lastMonday = new Date(today);
  const dayOfWeek = lastMonday.getDay();
  const diff = lastMonday.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  lastMonday.setDate(diff - 7); // Previous week's Monday

  await prisma.weeklyReview.upsert({
    where: {
      userId_weekStartDate: {
        userId: user.id,
        weekStartDate: lastMonday,
      },
    },
    update: {},
    create: {
      userId: user.id,
      weekStartDate: lastMonday,
      summaryMarkdown: `先週は新規プロジェクトのキックオフ週でした。要件定義から技術選定、そしてプロトタイプ作成まで一気に進めることができました。チームの協力体制も良好で、今後の開発が楽しみです。`,
      goalsJson: {
        achievements: [
          'プロジェクトキックオフの成功',
          '技術スタックの決定',
          'プロトタイプの完成',
          'チーム体制の確立',
        ],
        challenges: [
          'スケジュールがタイトだった',
          '一部の要件が不明確だった',
        ],
        nextWeekGoals: [
          'データベース設計の完了',
          'コア機能の実装開始',
          'テスト環境の構築',
        ],
      },
    },
  });

  console.log('✅ Created sample weekly review');

  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('Demo credentials:');
  console.log('  Email: demo@lifelog.app');
  console.log('  User ID:', user.id);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
