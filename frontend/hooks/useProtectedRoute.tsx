import { useEffect, useContext } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '../contexts/AuthContext';

export const useProtectedRoute = () => {
  const auth = useContext(AuthContext);
  const router = useRouter();

  if (!auth) {
    throw new Error('AuthContext is undefined. Did you forget to wrap your app in <AuthProvider>?');
  }

  const { user, isLoading } = auth;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isLoading && !user && router) {
        router.replace('/signin');
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [user, isLoading]);

  return user;
};
