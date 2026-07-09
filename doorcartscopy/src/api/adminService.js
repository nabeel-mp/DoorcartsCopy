import api from './axiosConfig';

export const getAdminProducts = async () => {
  const { data } = await api.get('/products/admin/all');
  return data.data.products;
};

export const createAdminProduct = async (payload) => {
  const { data } = await api.post('/products', payload);
  return data.data.product;
};

export const updateAdminProduct = async (productId, payload) => {
  const { data } = await api.put(`/products/${productId}`, payload);
  return data.data.product;
};

export const deleteAdminProduct = async (productId) => {
  const { data } = await api.delete(`/products/${productId}`);
  return data;
};

export const getAdminCategories = async () => {
  const { data } = await api.get('/categories/admin/all');
  return data.data.categories;
};

export const createAdminCategory = async (payload) => {
  const { data } = await api.post('/categories', payload);
  return data.data.category;
};

export const updateAdminCategory = async (categoryId, payload) => {
  const { data } = await api.put(`/categories/${categoryId}`, payload);
  return data.data.category;
};

export const deleteAdminCategory = async (categoryId) => {
  const { data } = await api.delete(`/categories/${categoryId}`);
  return data;
};

export const getAdminOrders = async () => {
  const { data } = await api.get('/orders');
  return data.data.orders;
};

export const confirmAdminOrder = async (orderId) => {
  const { data } = await api.put(`/orders/${orderId}/confirm`);
  return data.data.order;
};

export const updateAdminOrderStatus = async (orderId, status) => {
  const { data } = await api.put(`/orders/${orderId}/status`, { status });
  return data.data.order;
};

export const getAdminUsers = async () => {
  const { data } = await api.get('/users');
  return data.data.users;
};
