'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';

export interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const { user, error, isLoading, checkSession } = useUser();
  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  const checkPermissions = async (): Promise<void> => {
    if (isLoading) {
      return;
    }

    if (error) {
      setIsChecking(false);
      return;
    }

    const token = localStorage.getItem('custom-auth-token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      logger.debug('[AuthGuard]: User is not logged in, redirecting to login');
      router.replace(paths.auth.login);
      return;
    }

    if (!user) {
      // If we have token and user data but no user in context, try to refresh the session
      await checkSession?.();
      return;
    }

    setIsChecking(false);
  };

  React.useEffect(() => {
    checkPermissions().catch(() => {
      // noop
    });
  }, [user, isLoading, error]);

  if (isChecking) {
    return null;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to authenticate user
      </Alert>
    );
  }

  return <>{children}</>;
}
