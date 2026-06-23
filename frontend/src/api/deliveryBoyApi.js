import axiosInstance from './axiosInstance';

export const getAllDeliveryBoys = () => axiosInstance.get('/delivery-boys');
export const getAvailableBoys = () => axiosInstance.get('/delivery-boys/available');
export const getDeliveryBoyById = (id) => axiosInstance.get(`/delivery-boys/${id}`);
export const createDeliveryBoy = (data) => axiosInstance.post('/delivery-boys', data);
export const updateDeliveryBoy = (id, data) => axiosInstance.put(`/delivery-boys/${id}`, data);
export const updateBoyStatus = (id, data) => axiosInstance.put(`/delivery-boys/${id}/status`, data);
export const toggleBoyAvailability = (id) => axiosInstance.put(`/delivery-boys/${id}/toggle-availability`);
export const deleteDeliveryBoy = (id) => axiosInstance.delete(`/delivery-boys/${id}`);
