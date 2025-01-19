'use client';

import * as React from 'react';

import type { User } from '@/types/user';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';

export interface UserContextValue {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  checkSession?: () => Promise<void>;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const [state, setState] = React.useState<{ user: User | null; error: string | null; isLoading: boolean }>({
    user: null,
    error: null,
    isLoading: true
  });

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setState({ user: null, error: null, isLoading: false });
        return;
      }

      const userData = JSON.parse(storedUser);
      
      // Validate the user data structure
      if (!userData || typeof userData.id !== 'string') {
        logger.error('Invalid user data');
        localStorage.removeItem('user');
        localStorage.removeItem('custom-auth-token');
        setState({ user: null, error: null, isLoading: false });
        return;
      }

      setState({
        user: userData,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      logger.error('Error parsing stored user data:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('custom-auth-token');
      setState({
        user: null,
        error: null,
        isLoading: false,
      });
    }
  }, []);

  const checkSession = React.useCallback(async (): Promise<void> => {
    try {
      const { data, error } = await authClient.getUser();

      if (error) {
        logger.error(error);
        setState((prev) => ({ ...prev, user: null, error: 'Something went wrong', isLoading: false }));
        return;
      }

      setState((prev) => ({ ...prev, user: data ?? null, error: null, isLoading: false }));
    } catch (err) {
      logger.error(err);
      setState((prev) => ({ ...prev, user: null, error: 'Something went wrong', isLoading: false }));
    }
  }, []);

  React.useEffect(() => {
    checkSession().catch((err: unknown) => {
      logger.error(err);
      // noop
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Expected
  }, []);

  return (
    <UserContext.Provider
      value={{
        ...state,
        checkSession,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const UserConsumer = UserContext.Consumer;
