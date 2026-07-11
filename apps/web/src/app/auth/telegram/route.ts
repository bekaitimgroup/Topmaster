import { NextRequest, NextResponse } from 'next/server';

// Two cases for GET /auth/telegram:
// 1. From Telegram Login Widget (has TG auth params like id, hash) → relay to NestJS API
// 2. From NestJS API redirect (has accessToken) → passthrough (Android App Link opens the mobile app)
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  // If this already has an accessToken, it's the final redirect — just serve
  // a minimal page. Android App Link will open the mobile app instead.
  if (params.has('accessToken') || params.has('error')) {
    const token = params.get('accessToken') ?? '';
    const err = params.get('error') ?? '';
    return new NextResponse(
      `<html><body><script>
        window.location.href = 'topmaster://auth/telegram?${params.toString()}';
      </script>
      <p>Opening Topmaster... <a href="topmaster://auth/telegram?${params.toString()}">tap here</a></p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } },
    );
  }

  // Has TG auth params (id, hash, auth_date) → relay to NestJS API
  return NextResponse.redirect(
    `https://api.topmaster.uz/api/auth/telegram?${params.toString()}`,
    { status: 302 },
  );
}
