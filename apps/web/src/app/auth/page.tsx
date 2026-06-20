'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const INPUT = 'w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3.5 text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 transition-all text-center tracking-widest font-bold';
const BTN   = 'w-full py-4 rounded-2xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100';

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const { t, lang } = useLanguage();

  const [step, setStep]     = useState<'phone' | 'code'>('phone');
  const [phone, setPhone]   = useState('+998');
  const [code, setCode]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const isRu = lang === 'ru';

  async function sendOtp() {
    if (!/^\+998[0-9]{9}$/.test(phone)) {
      setError(isRu ? 'Введите номер в формате +998 XX XXX-XX-XX' : "+998 XX XXX-XX-XX formatida kiriting");
      return;
    }
    setLoading(true); setError('');
    try {
      await api.auth.sendOtp(phone);
      setStep('code');
      setCooldown(60);
      setTimeout(() => codeRef.current?.focus(), 100);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    if (code.length !== 6) return;
    setLoading(true); setError('');
    try {
      // Always send 'customer' — existing users keep their role, new users default to customer
      await api.auth.verifyOtp(phone, code, 'customer');
      router.replace(redirect);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-extrabold mb-1">
            <span className="text-[#7C3AED]">top</span>
            <span className="text-[#F59E0B]">master</span>
          </div>
          <p className="text-sm text-zinc-500">
            {isRu ? 'Войдите, чтобы разместить заявку' : "Buyurtma berish uchun kiring"}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6 space-y-5">
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
                    setPhone(v);
                    setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                  placeholder="+998 XX XXX-XX-XX"
                  className={INPUT + ' tracking-normal text-left'}
                  inputMode="tel"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
              <button
                onClick={sendOtp}
                disabled={loading || phone.length < 13}
                className={BTN}
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}
              >
                {loading
                  ? (isRu ? 'Отправка...' : 'Yuborilmoqda...')
                  : (isRu ? 'Получить код' : 'Kod olish')}
              </button>
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="text-sm text-zinc-500 mb-1">
                  {isRu ? 'Код отправлен на' : 'Kod yuborildi'}
                </p>
                <p className="font-bold text-[#0D0D1A]">{phone}</p>
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
                    setCode(v);
                    setError('');
                    if (v.length === 6) setTimeout(verifyCode, 0);
                  }}
                  placeholder="• • • • • •"
                  className={INPUT}
                  autoComplete="one-time-code"
                />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
              <button
                onClick={verifyCode}
                disabled={loading || code.length !== 6}
                className={BTN}
                style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' }}
              >
                {loading
                  ? (isRu ? 'Проверка...' : 'Tekshirilmoqda...')
                  : (isRu ? 'Войти' : 'Kirish')}
              </button>
              <button
                onClick={() => { setStep('phone'); setCode(''); setError(''); }}
                className="w-full text-sm text-zinc-500 hover:text-[#7C3AED] transition-colors py-1"
              >
                {isRu ? '← Изменить номер' : '← Raqamni o\'zgartirish'}
              </button>
              {cooldown > 0 ? (
                <p className="text-xs text-center text-zinc-400">
                  {isRu ? `Повторная отправка через ${cooldown} сек.` : `${cooldown} soniyadan so'ng qayta yuborish`}
                </p>
              ) : (
                <button
                  onClick={() => { sendOtp(); setCode(''); }}
                  className="w-full text-sm text-[#7C3AED] hover:opacity-80 transition-opacity py-1"
                >
                  {isRu ? 'Отправить код повторно' : 'Kodni qayta yuborish'}
                </button>
              )}
            </>
          )}
        </div>

        <p className="text-xs text-center text-zinc-400 mt-6">
          {isRu
            ? 'Входя, вы соглашаетесь с условиями использования'
            : "Kirib, foydalanish shartlariga rozisiz"}
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
