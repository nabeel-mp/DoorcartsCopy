import api from './axiosConfig';

// GET /api/products?keyword=&category=&minPrice=&maxPrice=&sort=&page=&limit=
export const getProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params });
  return data.data; // { products, total, page, pages }
};

// GET /api/products/:slug
export const getProductBySlug = async (slug) => {
  const { data } = await api.get(`/products/${slug}`);
  return data.data.product;
};