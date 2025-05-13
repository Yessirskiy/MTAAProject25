import API from './axiosInstance';
import qs from 'qs';
import { setItemAsync } from 'expo-secure-store';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  first_name: string;
  email: string;
  password1: string;
  password2: string;
}

export const login = async (data: LoginData) => {
  const formData = qs.stringify({
    grant_type: 'password',
    username: data.email,
    password: data.password,
    scope: '',
    client_id: '',
    client_secret: ''
  });
  const res = await API.post('/user/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  if (res.data){
    const token = res.data.access_token;
    await setItemAsync('accessToken', token);
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  return res.data;
};

export const register = async (data: RegisterData) => {
  const res = await API.post('/user/signup', data);
  return res.data;
};

export const refreshAccessToken = async (refreshToken: string) => {
  const res = await API.post('/user/refresh', { refreshToken });
  return res.data;
};
