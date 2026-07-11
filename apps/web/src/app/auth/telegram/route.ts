import { NextRequest, NextResponse } from 'next/server';

// Telegram Login Widget redirects here after the user authorizes.
// We relay all query params to the NestJS API which validates the data
// and redirects the mobile app to its deep link.
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString();
  return NextResponse.redirect(
    `https://api.topmaster.uz/api/auth/telegram?${params}`,
    { status: 302 },
  );
}
