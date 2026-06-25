import api from './axiosInstance';

export const getAllProducts = () => api.get('/products');
export const getActiveProducts = () => api.get('/products/active');
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const updateStock = (id, quantity) => api.patch(`/products/${id}/stock`, { quantity });
export const reduceStock = (id, quantity) => api.patch(`/products/${id}/reduce-stock`, { quantity });
