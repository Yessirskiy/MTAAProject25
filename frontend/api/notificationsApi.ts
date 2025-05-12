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

export const postNotification = async (userId: number, reportId: number, title: string, note: string) => {
    const res = await API.post('/notification/create', null, {
        params: {
            user_id: userId,
            report_id: reportId,
            title: title,
            note: note,
        },
    });
    return res.data;
};
