import api from './axiosConfig';

// GET /api/categories
export const getCategories = async () => {
  const { data } = await api.get('/categories');
  return data.data.categories;
};

// GET /api/categories/:slug
export const getCategoryBySlug = async (slug) => {
  const { data } = await api.get(`/categories/${slug}`);
  return data.data.category;
};