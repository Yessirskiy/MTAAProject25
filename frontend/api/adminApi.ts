import API from './axiosInstance';

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
    status: string;
    report_datetime: string;
    published_datetime: string;
    admin_note: string;
    votes_pos: number;
    votes_neg: number;
};

export const adminUpdateReport = async (userId: number, reportId: number, data: ReportUpdate) => {
    const res = API.put(`/admin/report/${userId}`, data, {
        params: { report_id: reportId },
    });
    return res;
}
