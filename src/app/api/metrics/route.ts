import { NextResponse } from 'next/server';
import { metrics } from '@/lib/metrics';

export async function GET() {
  try {
    const prometheusFormat = metrics.getPrometheusFormat();

    return new NextResponse(prometheusFormat, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to collect metrics',
      },
      { status: 500 }
    );
  }
}
