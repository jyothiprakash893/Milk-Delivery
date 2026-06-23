import axiosInstance from './axiosInstance';

export const generateBills = (month, year) => axiosInstance.post(`/billing/generate/${month}/${year}`);
export const getAllBills = (month, year) => axiosInstance.get(`/billing/all/${month}/${year}`);
export const getCustomerBills = (id) => axiosInstance.get(`/billing/customer/${id}`);
export const getUnpaidBills = () => axiosInstance.get('/billing/unpaid');
export const downloadBillPdf = (billId) => axiosInstance.get(`/billing/pdf/${billId}`, { responseType: 'blob' });
