export type Report = {
  id: number;
  status: 'reported' | 'published' | 'in_progress' | 'resolved' | 'cancelled';
  report_datetime: string;
  published_datetime: string;
  note: string;
  admin_note: string;
  votes_pos: number;
  votes_neg: number;
  user: ReportUser;
  address: ReportAddress;
  photos: ReportPhoto[];
};

export type ReportUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  created_datetime: string;
};

export type ReportAddress = {
  id: number;
  report_id: number;
  building: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: string;
  longitude: string;
};

export type ReportPhoto = {
  id: number;
  report_id: number;
};
