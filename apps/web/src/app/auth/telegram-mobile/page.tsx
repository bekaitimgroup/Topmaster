'use client';
import { useEffect } from 'react';

const TG_BOT_NAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME ?? '';

declare global {
  interface Window {
    onTelegramMobileAuth: (user: Record<string, string>) => void;
  }
}

export default function TelegramMobilePage() {
  useEffect(() => {
    if (!TG_BOT_NAME) return;

    // Called by Telegram widget after user authorizes
    window.onTelegramMobileAuth = (user) => {
      const params = new URLSearchParams(user as Record<string, string>).toString();
      window.location.href = `https://api.topmaster.uz/api/auth/telegram?${params}`;
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', TG_BOT_NAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramMobileAuth(user)');
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
    </div>
  );
}
