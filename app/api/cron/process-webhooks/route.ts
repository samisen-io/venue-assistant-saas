import { NextRequest, NextResponse } from 'next/server';
import { processWebhookEvents } from '@/lib/agents/webhook-processor';

/**
 * Cron job to process webhook events from database
 * This can be called by Vercel Cron or manually
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || process.env.INNGEST_SIGNING_KEY;

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Process Webhooks] Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Process Webhooks] Starting webhook processing job');

    const result = await processWebhookEvents();

    console.log('[Process Webhooks] Job completed:', result);

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Process Webhooks] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
