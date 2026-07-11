'use client';
import { useEffect } from 'react';

const TG_BOT_NAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME ?? '';
// After Telegram auth, widget redirects to this URL (no popup, same tab)
const AUTH_URL = 'https://api.topmaster.uz/api/auth/telegram';

export default function TelegramMobilePage() {
  useEffect(() => {
    if (!TG_BOT_NAME) return;
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', TG_BOT_NAME);
    script.setAttribute('data-size', 'large');
    // data-auth-url: Telegram redirects the current tab to this URL with auth
    // params — no popup, no new tab, works on mobile browsers.
    script.setAttribute('data-auth-url', AUTH_URL);
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    document.getElementById('tg-widget')?.appendChild(script);
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#f5f3ff', gap: 24, padding: 24,
    }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#7C3AED' }}>topmaster</div>
      <p style={{ color: '#6B7280', fontSize: 16, textAlign: 'center', margin: 0 }}>
        Telegram orqali kirish uchun tugmani bosing
      </p>
      <div id="tg-widget" />
      <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', margin: 0 }}>
        Kirganingizdan so'ng avtomatik qaytasiz
      </p>
    </div>
  );
}
