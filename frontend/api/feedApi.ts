import API from './axiosInstance';

export const getFeed = async () => {
  const res = await API.get('/report/feed');
  return res;
};