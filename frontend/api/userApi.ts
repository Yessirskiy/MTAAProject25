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

type UserPictureForm = {
  uri: string,
  type?: string,
  filename?: string
}

type AddressUpdate = {
  building?: string,
  street?: string,
  city?: string,
  state?: string,
  postal_code?: string,
  country?: string
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

export const getUserPhotoMe = async () => {
  const res = await API.get('/user/me/photo', {responseType: 'blob'});
  return res;
}

export const updateUserPhotoMe = async (data: UserPictureForm) => {
  const formData = new FormData();
  formData.append('photo', {
    uri: data.uri,
    name: data.filename ?? 'upload.jpg',
    type: data.type ?? 'image/jpeg',
  } as any);
  const res = await API.put('/user/me/photo', formData, {headers: {
    'Content-Type': 'multipart/form-data'
  }});
  return res;
}

export const deleteUserPhotoMe = async () => {
  const res = await API.delete('/user/me/photo');
  return res;
}

export const getUserAddressMe = async () => {
  const res = await API.get('/address/me');
  return res;
}

export const updateUserAddressMe = async(data: AddressUpdate) => {
  const res = await API.put('/address/me', data);
  return res;
}