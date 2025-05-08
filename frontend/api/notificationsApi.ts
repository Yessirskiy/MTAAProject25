import API from './axiosInstance';

export const getNotificationsMe = async () => {
  const res = await API.get('/user/me/notifications');
  return res;
};

export const getNotificationById = async (id: number) => {
  const res = await API.get(`/notifications/${id}`);
  return res;
}