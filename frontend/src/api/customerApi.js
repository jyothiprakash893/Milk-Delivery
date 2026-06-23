import axiosInstance from './axiosInstance';

export const getAllCustomers = () => axiosInstance.get('/customers/all');
export const getActiveCustomers = () => axiosInstance.get('/customers/active');
export const getCustomerById = (id) => axiosInstance.get(`/customers/${id}`);
export const addCustomer = (data) => axiosInstance.post('/customers/add', data);
export const updateCustomer = (id, data) => axiosInstance.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => axiosInstance.delete(`/customers/${id}`);
