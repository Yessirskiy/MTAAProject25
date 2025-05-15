import API from './axiosInstance';

type ReportData = {
  user_id: number;
  note: string;
  address: {
    building: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    latitude: number;
    longitude: number;
  };
};

type ReportUpdate = {
  note: string;
  address: {
    building: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    latitude: number;
    longitude: number;
  };
};

export const createReport = async (reportData: ReportData, photos: string[]) => {
  const formData = new FormData();

  formData.append('reportcreatestr', JSON.stringify(reportData));

  photos.forEach((photoUri, index) => {
    const fileName = photoUri.split('/').pop();
    const fileType = 'image/jpeg';

    formData.append('photos', {
      uri: photoUri,
      name: fileName || `photo_${index}.jpg`,
      type: fileType,
    } as any);
  });

  formData.forEach((value, key) => {
    console.log(`${key}:`, value);
  });

  const res = await API.post('report/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};

export const getReport = async (reportId: number) => {
  const res = API.get(`/report/${reportId}`);
  return res;
}

export const getReportPhoto = async (photoId: number) => {
  const res = API.get(`report/photo/${photoId}`);
  return res;
}

export const getReportPhotoBlob = async (photoId: number) => {
  const res = API.get(`/report/photo/${photoId}`, {responseType: 'blob'});
  return res;
}

export const updateReport = async (reportId: number, data: ReportUpdate) => {
  const res = API.put(`report/${reportId}`, data);
  return res;
}
