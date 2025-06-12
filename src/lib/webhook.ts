import crypto from 'crypto';

export function verifyWebhookSignature(payload: string, signatureHeader: string, webhookSecret: string): boolean {
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