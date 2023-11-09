'use client';

import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const cookie = req.headers.get('cookie') as string;

  try {
    const res = await fetch('http://localhost:5000/auth/info/authorisation', {
      headers: { Cookie: cookie }
    });

    const { isAuth, isVerified } = await res.json();

    if (pathname === '/users' && isAuth && isVerified) return NextResponse.next();

    if (pathname === '/email/verify' && isAuth && !isVerified) return NextResponse.next();

    return NextResponse.redirect(new URL('/', req.url));
  } catch (error) {
    console.error(error);
  }
}

export const config = {
  matcher: ['/email/verify', '/users']
};
