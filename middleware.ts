import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // if (request.headers.get('host') === 'semantic-web-monitor.vercel.app') {
  //   return NextResponse.redirect('https://demo.exa.ai/websets-news-monitor', {
  //     status: 301,
  //   });
  // }
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
}; 