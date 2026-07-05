import api from './axiosConfig';

// POST /api/payments/create-order  { orderId }
// Creates a Razorpay order tied to an existing internal Order (step 2 of the
// 3-step payment flow: internal Order -> Razorpay order -> verify).
export const createRazorpayOrder = async (orderId) => {
  const { data } = await api.post('/payments/create-order', { orderId });
  return data.data; // { razorpayOrderId, amount, currency, keyId, orderId }
};

// POST /api/payments/verify
// { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }
export const verifyPayment = async (payload) => {
  const { data } = await api.post('/payments/verify', payload);
  return data.data.order;
};