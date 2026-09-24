import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from './auth-middleware';
import { getServerAccess, serverAllowed, type ServerAccess } from './server-access';

export async function requireServerAccess(
  request: NextRequest
): Promise<{ access: ServerAccess } | NextResponse> {
  const auth = await getAuthContext(request);
  if (!auth) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  return { access: getServerAccess(auth) };
}

export function serverNotFoundResponse(): NextResponse {
  return NextResponse.json({ error: 'Server not found' }, { status: 404 });
}

export function denyHiddenServer(access: ServerAccess, serverId: string): NextResponse | null {
  if (serverAllowed(access, serverId)) {
    return null;
  }
  return serverNotFoundResponse();
}
