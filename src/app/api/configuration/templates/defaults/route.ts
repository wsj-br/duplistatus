import { NextRequest, NextResponse } from 'next/server';
import {
  getDefaultNotificationTemplates,
  isValidTemplateLanguage,
} from '@/lib/default-config';
import type { SupportedTemplateLanguage } from '@/lib/types';

// GET /api/configuration/templates/defaults?language=en
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'en';

    if (!isValidTemplateLanguage(language)) {
      return NextResponse.json(
        { error: 'Invalid language' },
        { status: 400 }
      );
    }

    const defaults = getDefaultNotificationTemplates(language as SupportedTemplateLanguage);

    return NextResponse.json(defaults);
  } catch (error) {
    console.error('Error fetching default templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch default templates' },
      { status: 500 }
    );
  }
}
