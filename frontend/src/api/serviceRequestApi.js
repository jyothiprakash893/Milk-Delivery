import axiosInstance from './axiosInstance';

export const getAllRequests = () => axiosInstance.get('/service-requests/all');
export const getPendingRequests = () => axiosInstance.get('/service-requests/pending');
export const getMyRequests = (userId) => axiosInstance.get(`/service-requests/user/${userId}`);
export const getRequestById = (id) => axiosInstance.get(`/service-requests/${id}`);
export const createRequest = (data) => axiosInstance.post('/service-requests', data);
export const approveRequest = (id, data) => axiosInstance.put(`/service-requests/${id}/approve`, data);
export const rejectRequest = (id, data) => axiosInstance.put(`/service-requests/${id}/reject`, data);
