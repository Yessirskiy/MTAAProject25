import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL, REFRESH_URL } from '@env';

const API = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: add access token
API.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: refresh token on 403
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await SecureStore.getItemAsync('refreshToken');

      if (refreshToken) {
        try {
          const res = await axios.post(REFRESH_URL, {}, {
            params: {
              refresh_token: refreshToken
            }
          });
          const newAccessToken = res.data.access_token;
          console.log(newAccessToken);

          await SecureStore.setItemAsync('accessToken', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return API(originalRequest);
        } catch (refreshError) {
          console.error('Refresh token error', refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
