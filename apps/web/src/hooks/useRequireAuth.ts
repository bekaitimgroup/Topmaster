'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export function useRequireAuth(redirectTo = '/auth') {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    api.auth.me()
      .then(() => setChecked(true))
      .catch(() => {
        const returnUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
        router.replace(`${redirectTo}?redirect=${encodeURIComponent(returnUrl)}`);
      });
  }, [router, redirectTo]);

  return { checked };
}
