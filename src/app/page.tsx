'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to sign-in immediately
    router.replace('/signin');
  }, [router]);

  // Optional: show a brief loading state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-muted-foreground">Redirecting to sign in...</p>
    </div>
  );
}