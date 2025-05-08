import API from './axiosInstance';

export const getNotificationsMe = async () => {
  const res = await API.get('/user/me/notifications');
  return res;
};

export const getNotificationById = async (id: number) => {
  const res = await API.get(`/notification/${id}`);
  return res;
}

export const readNotificationById = async (id: number) => {
  const res = await API.patch(`/notification/${id}`);
  return res;
}