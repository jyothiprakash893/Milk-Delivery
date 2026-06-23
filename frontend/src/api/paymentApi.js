import axiosInstance from './axiosInstance';

export const collectPayment = (data) => axiosInstance.post('/payments/collect', data);
export const getPaymentHistory = (custId) => axiosInstance.get(`/payments/history/${custId}`);
export const getOutstandingDues = () => axiosInstance.get('/payments/outstanding');
