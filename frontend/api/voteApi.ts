import API from './axiosInstance';

export const getVote = async (user_id: number, report_id: number) => {
  const res = await API.get('/vote', {params: {
    user_id: user_id,
    report_id: report_id
  }});
  return res;
};


export const createVote = async (user_id: number, report_id: number, value: boolean) => {
    const res = await API.post('/vote/create', {
        user_id: user_id,
        report_id: report_id,
        is_positive: value
    });
    return res;
}

export const updateVote = async (user_id: number, report_id: number, value: boolean) => {
    const res = await API.patch('/vote', {
        user_id: user_id,
        report_id: report_id,
        is_positive: value
    });
    return res;
}

export const deleteVote = async (user_id: number, report_id: number) => {
    const res = await API.delete('/vote', {params: {
        user_id: user_id,
        report_id: report_id,
    }});
    return res;
}