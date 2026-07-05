import api from './axiosConfig';

// GET /api/cart
export const getCart = async () => {
  const { data } = await api.get('/cart');
  return data.data.cart;
};

// POST /api/cart/items  { productId, quantity }
export const addCartItem = async (productId, quantity = 1) => {
  const { data } = await api.post('/cart/items', { productId, quantity });
  return data.data.cart;
};

// PUT /api/cart/items/:productId  { quantity }
export const updateCartItem = async (productId, quantity) => {
  const { data } = await api.put(`/cart/items/${productId}`, { quantity });
  return data.data.cart;
};

// DELETE /api/cart/items/:productId
export const removeCartItem = async (productId) => {
  const { data } = await api.delete(`/cart/items/${productId}`);
  return data.data.cart;
};

// DELETE /api/cart
export const clearCart = async () => {
  const { data } = await api.delete('/cart');
  return data.data.cart;
};