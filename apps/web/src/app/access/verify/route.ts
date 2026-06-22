import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  const passphrase = process.env.SITE_PASSPHRASE;

  if (!passphrase || code !== passphrase) {
    return NextResponse.json({ error: 'Noto\'g\'ri kod' }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('site_access', passphrase, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
