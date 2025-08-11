'use client';

import { useAuth } from '@/app/contexts/SimpleAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MainDashboard from '@/components/features/Dashboard/MainDashboard';
import { Loader } from 'lucide-react';

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push('/auth?redirectTo=/dashboard');
    }
  }, [user, loading, router, mounted]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return <MainDashboard user={user} profile={profile} />;
}