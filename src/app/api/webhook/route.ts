import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signatureHeader: string, webhookSecret: string): boolean {
  try {
    // Parse the signature header
    const pairs = signatureHeader.split(',').map(pair => pair.split('='));
    const timestamp = pairs.find(([key]) => key === 't')?.[1];
    const signatures = pairs
      .filter(([key]) => key === 'v1')
      .map(([, value]) => value);

    if (!timestamp || signatures.length === 0) {
      return false;
    }
    
    // Create the signed payload
    const signedPayload = `${timestamp}.${payload}`;

    // Compute the expected signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');

    // Compare with provided signatures using timing-safe comparison
    return signatures.some(sig =>
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(sig, 'hex')
      )
    );
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  // Get the raw body for signature verification
  const rawBody = await request.text();
  const signatureHeader = request.headers.get('exa-signature') || '';
  const webhookSecret = process.env.WEBHOOK_SECRET;

  // Skip signature verification in development
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Verify webhook signature if secret is configured and not in development
  if (webhookSecret && !isDevelopment) {
    if (!verifyWebhookSignature(rawBody, signatureHeader, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } else if (isDevelopment && webhookSecret) {
    console.log('[Dev] Skipping webhook signature verification');
  }

  const body = JSON.parse(rawBody);
  
  // Concise logging
  console.log(`[${body.type}]`, body.data);

  return NextResponse.json({ 
    received: true,
    type: body.type,
    timestamp: new Date().toISOString()
  });
}