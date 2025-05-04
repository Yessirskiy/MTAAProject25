import API from './axiosInstance';

type UserUpdate = {
  first_name?: string,
  last_name?: string,
  email?: string,
  phone_number?: string
};

type UserSettingsUpdate = {
  is_name_hidden?: boolean,
  is_phone_hidden?: boolean,
  is_email_hidden?: boolean,
  is_picture_hidden?: boolean,
  is_notification_allowed?: boolean,
  is_local_notification?: boolean,
  is_weekly_notification?: boolean,
  is_onchange_notification?: boolean,
  is_onreact_notification?: boolean
}

type UserPasswordUpdate = {
  old_password: string,
  new_password1: string,
  new_password2: string
}

export const getUserMe = async () => {
  const res = await API.get('/user/me');
  return res.data;
};

export const updateUserMe = async (data: UserUpdate) => {
  const res = await API.put('/user/me', data);
  return res.data;
}

export const getUserSettingsMe = async () => {
  const res = await API.get('/settings/me');
  return res.data;
};

export const updateUserSettingsMe = async (data: UserSettingsUpdate) => {
  const res = await API.put('/settings/me', data);
  return res.data;
}

export const updateUserPasswordMe = async (data: UserPasswordUpdate) => {
  const res = await API.put('/user/change-password', data);
  return res;
}