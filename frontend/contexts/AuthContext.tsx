import React, { createContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from 'expo-secure-store';
import { login as loginCall, refreshAccessToken as refreshCall } from "@/api/authApi";
import { getUserMe as getUserMeCall } from "@/api/userApi";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

interface AuthContextProps {
  accessToken: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextProps>({
  accessToken: null,
  user: null,
  login: async () => {},
  logout: async () => {},
  refreshAccessToken: async () => {},
  isLoading: false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSession = async () => {
      const storedAccessToken = await SecureStore.getItemAsync('accessToken');
      const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
      const storedUser = await SecureStore.getItemAsync('userData');
      console.log("Initialized AuthContext:", storedAccessToken, storedRefreshToken, storedUser);

      if (storedAccessToken && storedRefreshToken && storedUser) {
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };
    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    console.log("Making login call.")
    const response = await loginCall({email: email, password: password});
    console.log("LoginCall response:", response);

    const { access_token, refresh_token } = response;

    setAccessToken(access_token);
    setRefreshToken(refresh_token);

    const user = await getUserMeCall();
    setUser(user);

    await SecureStore.setItemAsync('accessToken', access_token);
    await SecureStore.setItemAsync('refreshToken', refresh_token);
    await SecureStore.setItemAsync('userData', JSON.stringify(user));
  };

  const logout = async () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);

    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('userData');
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) {
      console.error('No refresh token available.');
      logout();
      return;
    }

    try {
      const response = await refreshCall(refreshToken);

      const { accessToken: newAccessToken } = response.data;

      setAccessToken(newAccessToken);
      await SecureStore.setItemAsync('accessToken', newAccessToken);
    } catch (error) {
      console.error('Refresh token error', error);
      logout(); // Force logout if refresh fails
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout, refreshAccessToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
