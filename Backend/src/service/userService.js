import api from './axiosConfig';

// GET /api/users/addresses
export const getAddresses = async () => {
  const { data } = await api.get('/users/addresses');
  return data.data.addresses;
};

// POST /api/users/addresses
// { label, fullName, phone, line1, line2?, city, state, postalCode, country?, isDefault? }
export const addAddress = async (address) => {
  const { data } = await api.post('/users/addresses', address);
  return data.data.addresses;
};

// PUT /api/users/addresses/:addressId
export const updateAddress = async (addressId, address) => {
  const { data } = await api.put(`/users/addresses/${addressId}`, address);
  return data.data.addresses;
};

// DELETE /api/users/addresses/:addressId
export const deleteAddress = async (addressId) => {
  const { data } = await api.delete(`/users/addresses/${addressId}`);
  return data.data.addresses;
};