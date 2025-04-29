import API from './axiosInstance';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  first_name: string;
  email: string;
  password: string;
  password1: string;
}

export const login = async (data: LoginData) => {
  const res = await API.post('/user/login', data);
  return res.data;
};

export const register = async (data: RegisterData) => {
  const res = await API.post('/user/register', data);
  return res.data;
};

export const refreshAccessToken = async (refreshToken: string) => {
  const res = await API.post('/user/refresh', { refreshToken });
  return res.data;
};
