'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { api } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const TG_BOT_NAME      = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME ?? '';

const BTN   = 'w-full py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100';
const INPUT = 'w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3.5 text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all';

function Divider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-zinc-200" />
      <span className="text-xs text-zinc-400 font-medium">{text}</span>
      <div className="flex-1 h-px bg-zinc-200" />
    </div>
  );
}

function GoogleButton({ onSuccess, label }: { onSuccess: (token: string) => void; label: string }) {
  const login = useGoogleLogin({
    onSuccess: (resp) => onSuccess(resp.access_token),
    onError: () => {},
  });
  return (
    <button
      type="button"
      onClick={() => login()}
      className={BTN + ' border-2 border-zinc-200 bg-white text-[#3c4043] flex items-center justify-center gap-3'}
    >
      <GoogleIcon />
      {label}
    </button>
  );
}

function AuthForm() {
  const router      = useRouter();
  const params      = useSearchParams();
  const redirect    = params.get('redirect') || '/';
  const { lang }    = useLanguage();
  const isRu        = lang === 'ru';

  const [step, setStep]         = useState<'phone' | 'code'>('phone');
  const [phone, setPhone]       = useState('+998');
  const [code, setCode]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Load Telegram widget into hidden div; expose global callback
  useEffect(() => {
    (window as any).onTelegramAuth = async (user: Record<string, unknown>) => {
      setLoading(true); setError('');
      try {
        await api.auth.telegram(user);
        router.replace(redirect);
      } catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    };

    if (!TG_BOT_NAME) return;
    const container = document.getElementById('tg-widget');
    if (!container || container.childNodes.length > 0) return;
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', TG_BOT_NAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    container.appendChild(script);
  }, [redirect, router]);

  function handleTelegramClick() {
    const btn = document.querySelector('#tg-widget a') as HTMLElement | null;
    if (btn) {
      btn.click();
    } else {
      setError(isRu ? 'Telegram ещё загружается, попробуйте снова' : "Telegram yuklanmoqda, qayta urinib ko'ring");
    }
  }

  async function onGoogleSuccess(accessToken: string) {
    setLoading(true); setError('');
    try {
      await api.auth.google(accessToken);
      router.replace(redirect);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function sendOtp() {
    if (!/^\+998[0-9]{9}$/.test(phone)) {
      setError(isRu ? 'Введите номер: +998 XX XXX-XX-XX' : '+998 XX XXX-XX-XX formatida kiriting');
      return;
    }
    setLoading(true); setError('');
    try {
      await api.auth.sendOtp(phone);
      setStep('code');
      setCooldown(60);
      setTimeout(() => codeRef.current?.focus(), 100);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function verifyCode() {
    if (code.length !== 6) return;
    setLoading(true); setError('');
    try {
      await api.auth.verifyOtp(phone, code, 'customer');
      router.replace(redirect);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col items-center justify-center px-4">
      {/* Hidden Telegram widget — button programmatically clicked */}
      <div id="tg-widget" className="hidden" />

      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-3xl font-extrabold mb-1">
            <span className="text-[#7C3AED]">top</span>
            <span className="text-[#F59E0B]">master</span>
          </div>
          <p className="text-sm text-zinc-500">
            {isRu ? 'Войдите, чтобы продолжить' : 'Davom etish uchun kiring'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6 space-y-3">

          {/* Google */}
          {GOOGLE_CLIENT_ID ? (
            <GoogleButton
              onSuccess={onGoogleSuccess}
              label={isRu ? 'Войти через Google' : 'Google orqali kirish'}
            />
          ) : (
            <button disabled className={BTN + ' border-2 border-zinc-200 text-zinc-400 bg-white flex items-center justify-center gap-3'}>
              <GoogleIcon />
              {isRu ? 'Google (не настроен)' : 'Google (sozlanmagan)'}
            </button>
          )}

          {/* Telegram */}
          {TG_BOT_NAME ? (
            <button
              type="button"
              onClick={handleTelegramClick}
              disabled={loading}
              className={BTN + ' text-white flex items-center justify-center gap-3'}
              style={{ background: '#229ED9' }}
            >
              <TelegramIcon />
              {isRu ? 'Войти через Telegram' : 'Telegram orqali kirish'}
            </button>
          ) : (
            <button disabled className={BTN + ' border-2 border-zinc-200 text-zinc-400 bg-white flex items-center justify-center gap-3'}>
              <TelegramIcon />
              {isRu ? 'Telegram (не настроен)' : 'Telegram (sozlanmagan)'}
            </button>
          )}

          <Divider text={isRu ? 'или по номеру телефона' : 'yoki telefon raqam orqali'} />

          {/* Phone OTP */}
          {step === 'phone' ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-[#0D0D1A] mb-2">
                  {isRu ? 'Номер телефона' : 'Telefon raqami'}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^+0-9]/g, '');
                    if (!v.startsWith('+998')) v = '+998';
                    if (v.length > 13) v = v.slice(0, 13);
                    setPhone(v); setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                  placeholder="+998 XX XXX-XX-XX"
                  className={INPUT}
                  inputMode="tel"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
              <button
                onClick={sendOtp}
                disabled={loading || phone.length < 13}
                className={BTN + ' text-white'}
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}
              >
                {loading ? '...' : (isRu ? 'Получить SMS-код' : 'SMS-kod olish')}
              </button>
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="text-xs text-zinc-400">{isRu ? 'Код отправлен на' : 'Kod yuborildi:'}</p>
                <p className="font-bold text-sm text-[#0D0D1A]">{phone}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0D0D1A] mb-2">
                  {isRu ? 'Код из SMS' : 'SMS-dan kod'}
                </label>
                <input
                  ref={codeRef}
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(v); setError('');
                    if (v.length === 6) setTimeout(verifyCode, 0);
                  }}
                  placeholder="• • • • • •"
                  className={INPUT + ' text-center tracking-widest font-bold text-lg'}
                  autoComplete="one-time-code"
                />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
              <button
                onClick={verifyCode}
                disabled={loading || code.length !== 6}
                className={BTN + ' text-white'}
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}
              >
                {loading ? '...' : (isRu ? 'Войти' : 'Kirish')}
              </button>
              <div className="flex justify-between items-center">
                <button onClick={() => { setStep('phone'); setCode(''); setError(''); }}
                  className="text-xs text-zinc-500 hover:text-[#7C3AED] transition-colors">
                  ← {isRu ? 'Изменить номер' : "Raqamni o'zgartirish"}
                </button>
                {cooldown > 0 ? (
                  <span className="text-xs text-zinc-400">{cooldown}s</span>
                ) : (
                  <button onClick={() => { sendOtp(); setCode(''); }}
                    className="text-xs text-[#7C3AED] hover:opacity-80">
                    {isRu ? 'Отправить снова' : 'Qayta yuborish'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <p className="text-xs text-center text-zinc-400 mt-5">
          {isRu ? 'Входя, вы соглашаетесь с условиями использования' : 'Kirib, foydalanish shartlariga rozisiz'}
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247l-2.02 9.531c-.148.658-.537.818-1.088.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.54 14.4l-2.95-.924c-.641-.2-.654-.641.136-.948l11.527-4.448c.534-.193 1.001.13.309.167z"/>
    </svg>
  );
}

export default function AuthPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'placeholder'}>
      <Suspense>
        <AuthForm />
      </Suspense>
    </GoogleOAuthProvider>
  );
}
