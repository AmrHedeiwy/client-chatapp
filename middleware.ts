import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const cookie = cookies().get('connect.sid');
  if (!cookie) return NextResponse.redirect(new URL('/', req.url));

  const url = 'http://localhost:5000/auth/session';
  const options = {
    headers: {
      'Content-Type': 'application/json',
      Cookie: `${cookie.name}=${cookie.value}`
    }
  };
  try {
    const res = await fetch(url, options);
    const session = await res.json();

    if (!session) return NextResponse.redirect(new URL('/', req.url));

    const { user, isCallbackProvider, isPasswordReset } = session;

    if (
      (pathname === '/contacts' || pathname.startsWith('/conversations')) &&
      user &&
      user.isVerified
    )
      return NextResponse.next();

    if (pathname === '/email/verify' && user && !user.isVerified)
      return NextResponse.next();

    if (pathname.startsWith('/cb') && isCallbackProvider) return NextResponse.next();

    if (pathname.startsWith('/password/reset') && isPasswordReset)
      return NextResponse.next();

    return NextResponse.redirect(new URL('/', req.url));
  } catch (error) {
    console.error(error);
  }
}

export const config = {
  matcher: [
    '/email/verify',
    '/cb',
    '/password',
    '/contacts',
    '/conversations',
    '/conversations/:conversationId*'
  ]
};
