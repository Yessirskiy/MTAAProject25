import API from './axiosInstance';

type UserUpdate = {
  first_name?: string,
  last_name?: string,
  email?: string,
  phone_number?: string
};

export const getUserMe = async () => {
  const res = await API.get('/user/me');
  return res.data;
};

export const updateUserMe = async (data: UserUpdate) => {
  const res = await API.put('/user/me', data);
  return res.data;
}