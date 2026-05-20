'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, fetchMe, token } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) {
      router.push('/login');
      return;
    }
    fetchMe();
  }, [token, router, fetchMe, mounted]);

  if (!mounted || !isAuthenticated) return null;
  return <>{children}</>;
}
