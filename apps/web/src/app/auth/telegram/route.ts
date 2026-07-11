import { NextRequest, NextResponse } from 'next/server';

// Telegram Login Widget redirects here after the user authorizes.
// Relay all TG auth params to the NestJS API (which validates + issues JWT)
// then redirects to the mobile deep link topmaster://auth/telegram
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString();
  return NextResponse.redirect(
    `https://api.topmaster.uz/api/auth/telegram?${params}`,
    { status: 302 },
  );
}
