import api from './axiosConfig';

// POST /api/auth/send-otp  { phone }
export const sendOtp = async (phone) => {
  const { data } = await api.post('/auth/send-otp', { phone });
  return data.data; // { phone }
};

// POST /api/auth/verify-otp  { phone, code, name? }
// Returns { user, token }. The backend also sets an httpOnly cookie, but we
// keep the token in localStorage too as a fallback for the Bearer header path.
export const verifyOtp = async (phone, code, name) => {
  const { data } = await api.post('/auth/verify-otp', { phone, code, name });
  const { user, token } = data.data;
  if (token) localStorage.setItem('authToken', token);
  if (user) localStorage.setItem('user', JSON.stringify(user));
  return { user, token };
};

// GET /api/auth/me
export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data.data.user;
};

// PUT /api/auth/me  { name?, email? }
export const updateMe = async (payload) => {
  const { data } = await api.put('/auth/me', payload);
  const user = data.data.user;
  localStorage.setItem('user', JSON.stringify(user));
  return user;
};

// POST /api/auth/logout
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};