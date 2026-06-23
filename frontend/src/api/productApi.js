import api from './axiosInstance';

export const getAllProducts = () => api.get('/api/products');
export const getActiveProducts = () => api.get('/api/products/active');
export const getProductById = (id) => api.get(`/api/products/${id}`);
export const createProduct = (data) => api.post('/api/products', data);
export const updateProduct = (id, data) => api.put(`/api/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/api/products/${id}`);
export const updateStock = (id, quantity) => api.patch(`/api/products/${id}/stock`, { quantity });
export const reduceStock = (id, quantity) => api.patch(`/api/products/${id}/reduce-stock`, { quantity });
