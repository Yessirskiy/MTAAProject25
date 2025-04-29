import React, { createContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { login as loginCall, register, refreshAccessToken as refreshCall } from "@/api/authApi";

interface User {
  id: string;
  first_name: string;
  email: string;
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
      // const storedUser = await SecureStore.getItemAsync('userData');

      // if (storedAccessToken && storedRefreshToken && storedUser) {
      if (storedAccessToken && storedRefreshToken) {
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        //setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };
    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginCall({email: email, password: password});

      //const { accessToken, refreshToken, user } = response.data;
      const { accessToken, refreshToken } = response.data;

      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      // setUser(user);

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      // await SecureStore.setItemAsync('userData', JSON.stringify(user));
    } catch (error) {
      console.error('Login error', error);
    }
  };

  const logout = async () => {
    setAccessToken(null);
    setRefreshToken(null);
    // setUser(null);

    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    // await SecureStore.deleteItemAsync('userData');
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
