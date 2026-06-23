import axiosInstance from './axiosInstance';

export const getAllOrders = () => axiosInstance.get('/orders/all');
export const getPendingOrders = () => axiosInstance.get('/orders/pending');
export const getAssignedOrders = (boyId) => axiosInstance.get(`/orders/assigned/${boyId}`);
export const getMyOrders = (customerId) => axiosInstance.get(`/orders/my/${customerId}`);
export const getOrderById = (id) => axiosInstance.get(`/orders/${id}`);
export const createOrder = (data) => axiosInstance.post('/orders', data);
export const assignOrder = (id, data) => axiosInstance.put(`/orders/${id}/assign`, data);
export const updateOrderStatus = (id, data) => axiosInstance.put(`/orders/${id}/status`, data);
export const deleteOrder = (id) => axiosInstance.delete(`/orders/${id}`);
