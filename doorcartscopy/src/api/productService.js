import axiosInstance from './axiosConfig';

export const getProducts = async (params) => {
  // Wraps parameters correctly under the 'params' key for query string generation
  return await axiosInstance.get('/products', { params });
};

export const getProductById = async (id) => {
  return await axiosInstance.get(`/products/${id}`);
};
export const getProductsByCategory = async (categoryId) => {
  // If your backend supports querying by category directly:
  // return await axiosInstance.get(`/products?category=${categoryId}`);
  
  // Alternatively, fetch all and let the frontend filter (used as fallback)
  return await axiosInstance.get('/products');
};