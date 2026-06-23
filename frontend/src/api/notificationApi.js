import axiosInstance from './axiosInstance';

export const sendBills = () => axiosInstance.post('/notifications/send-bills');
export const sendReminder = () => axiosInstance.post('/notifications/reminder');
export const sendCustomMessage = (data) => axiosInstance.post('/notifications/custom', data);
