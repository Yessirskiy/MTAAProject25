import API from './axiosInstance';

export const getFeed = async () => {
  const res = await API.get('/report/feed');
  return res;
};

export const getAdminFeed = async () => {
  const res = await API.get('/report/feed');
  return res;
}