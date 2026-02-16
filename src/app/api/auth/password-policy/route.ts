import { NextResponse } from 'next/server';
import { getPasswordPolicy } from '@/lib/auth';

/**
 * GET /api/auth/password-policy
 * Returns the current password policy configuration
 * This endpoint is public (no auth required) as it's needed for frontend validation
 */
export async function GET() {
  try {
    const policy = getPasswordPolicy();
    
    return NextResponse.json({
      minLength: policy.minLength,
      requireUppercase: policy.requireUppercase,
      requireLowercase: policy.requireLowercase,
      requireNumbers: policy.requireNumbers,
      requireSpecialChars: policy.requireSpecialChars,
    });
  } catch (error) {
    console.error('[Password Policy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve password policy', errorCode: 'POLICY_RETRIEVE_FAILED' },
      { status: 500 }
    );
  }
}
