import axiosInstance from './axiosInstance';

export const getTodayDeliveries = () => axiosInstance.get('/deliveries/today');
export const markDelivered = (custId, quantity) => axiosInstance.put(`/deliveries/mark/${custId}`, null, { params: { quantity } });
export const markSkipped = (custId, reason) => axiosInstance.put(`/deliveries/skip/${custId}`, null, { params: { reason } });
export const getDeliveryHistory = (id) => axiosInstance.get(`/deliveries/history/${id}`);
export const getMonthlyReport = (month, year) => axiosInstance.get(`/deliveries/report/${month}/${year}`);
