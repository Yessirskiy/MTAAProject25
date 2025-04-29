import API from './axiosInstance';

export const getUserMe = async () => {
  const res = await API.get('/user/me');
  return res.data;
};
