import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Токен в localStorage middleware не видит — только cookie.
  // Поэтому защита работает на клиенте через AuthContext.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};