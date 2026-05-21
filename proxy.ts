import { NextResponse, type NextRequest } from 'next/server';
import {
  locales,
  defaultLocale,
  COOKIE_NAME,
  LOCALE_HEADER,
  type Locale,
} from '@/lib/i18n/config';

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return;
  }

  const current = locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (current) {
    const res = NextResponse.next();
    res.headers.set(LOCALE_HEADER, current);
    return res;
  }

  const cookie = req.cookies.get(COOKIE_NAME)?.value as Locale | undefined;
  const target = cookie && locales.includes(cookie) ? cookie : defaultLocale;

  const url = req.nextUrl.clone();
  url.pathname = `/${target}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
