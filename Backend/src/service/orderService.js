import api from './axiosConfig';

// POST /api/orders  { shippingAddress, paymentMethod }
// Creates an order from the current cart (checkout). The cart is cleared
// server-side after this succeeds.
export const createOrder = async (shippingAddress, paymentMethod = 'razorpay') => {
  const { data } = await api.post('/orders', { shippingAddress, paymentMethod });
  return data.data.order;
};

// GET /api/orders/my
export const getMyOrders = async () => {
  const { data } = await api.get('/orders/my');
  return data.data.orders;
};

// GET /api/orders/:id
export const getOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data.data.order;
};