import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateDailySummary(events: any[], note?: string) {
  const eventsSummary = events.map(e => {
    if (e.type === 'calendar') {
      return `- ${new Date(e.occurredAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}: ${e.payloadJson.summary}`;
    } else if (e.type === 'email') {
      return `- メール: ${e.payloadJson.subject} (from: ${e.payloadJson.from})`;
    }
    return `- ${e.type}: ${JSON.stringify(e.payloadJson)}`;
  }).join('\n');

  const prompt = `以下は今日の出来事です:

${eventsSummary}

${note ? `\n今日のメモ:\n${note}\n` : ''}

この情報から、以下をJSON形式で生成してください:
{
  "summary": "今日の出来事を2-3文で要約",
  "goodThings": ["良かったこと1", "良かったこと2", "良かったこと3"],
  "todoTomorrow": ["明日やること1", "明日やること2", "明日やること3"],
  "moodTag": "productive/happy/neutral/challenging"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'あなたは優秀なライフコーチです。ユーザーの1日を振り返り、ポジティブな要約を提供します。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result;
}

export async function generateWeeklySummary(dailySummaries: any[], events: any[]) {
  const summariesText = dailySummaries.map((s, idx) => {
    return `### ${new Date(s.date).toLocaleDateString('ja-JP')}
${s.summaryMarkdown}
気分: ${s.moodTag}
`;
  }).join('\n\n');

  const prompt = `以下は今週の日次サマリーです:

${summariesText}

この1週間を振り返り、以下をJSON形式で生成してください:
{
  "weekSummary": "今週全体の振り返りを3-5文で",
  "achievements": ["達成したこと1", "達成したこと2", "達成したこと3"],
  "challenges": ["課題や反省点1", "課題や反省点2"],
  "nextWeekGoals": ["来週の目標1", "来週の目標2", "来週の目標3"]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'あなたは優秀なライフコーチです。ユーザーの1週間を振り返り、建設的なフィードバックと目標設定を支援します。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result;
}
