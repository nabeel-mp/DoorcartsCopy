import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Boxes,
  FolderTree,
  PackageCheck,
  Users,
  RefreshCw,
  Shield,
  Pencil,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/authContext';
import * as adminService from '../api/adminService';

const TABS = [
  { key: 'overview', label: 'Overview', icon: Shield },
  { key: 'products', label: 'Products', icon: Boxes },
  { key: 'categories', label: 'Categories', icon: FolderTree },
  { key: 'orders', label: 'Orders', icon: PackageCheck },
  { key: 'users', label: 'Users', icon: Users },
];

const initialProductForm = {
  name: '',
  description: '',
  category: '',
  price: '',
  discountPrice: '',
  stock: '',
  brand: '',
  images: '',
};

const initialCategoryForm = {
  name: '',
  image: '',
};

const formatINR = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const parseImages = (value) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingProductId, setEditingProductId] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [productForm, setProductForm] = useState(initialProductForm);
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);
  const successTimeoutRef = useRef(null);

  const loadAdminData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [nextProducts, nextCategories, nextOrders, nextUsers] = await Promise.all([
        adminService.getAdminProducts(),
        adminService.getAdminCategories(),
        adminService.getAdminOrders(),
        adminService.getAdminUsers(),
      ]);

      setProducts(nextProducts);
      setCategories(nextCategories);
      setOrders(nextOrders);
      setUsers(nextUsers);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    window.clearTimeout(successTimeoutRef.current);
    successTimeoutRef.current = window.setTimeout(() => setSuccessMessage(''), 2500);
  };

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      loadAdminData();
    }, 0);

    return () => {
      window.clearTimeout(loadTimer);
      window.clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const resetProductForm = () => {
    setEditingProductId('');
    setProductForm(initialProductForm);
  };

  const resetCategoryForm = () => {
    setEditingCategoryId('');
    setCategoryForm(initialCategoryForm);
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    try {
      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        category: productForm.category,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        brand: productForm.brand.trim(),
        images: parseImages(productForm.images),
      };

      if (productForm.discountPrice !== '') {
        payload.discountPrice = Number(productForm.discountPrice);
      }

      if (editingProductId) {
        await adminService.updateAdminProduct(editingProductId, payload);
        showSuccess('Product updated');
      } else {
        await adminService.createAdminProduct(payload);
        showSuccess('Product created');
      }

      resetProductForm();
      await loadAdminData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not save the product.');
    } finally {
      setSaving(false);
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage('');
    try {
      const payload = {
        name: categoryForm.name.trim(),
        image: categoryForm.image.trim(),
      };

      if (editingCategoryId) {
        await adminService.updateAdminCategory(editingCategoryId, payload);
        showSuccess('Category updated');
      } else {
        await adminService.createAdminCategory(payload);
        showSuccess('Category created');
      }

      resetCategoryForm();
      await loadAdminData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not save the category.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditProduct = (product) => {
    setActiveTab('products');
    setEditingProductId(product._id);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category?._id || product.category || '',
      price: product.price ?? '',
      discountPrice: product.discountPrice ?? '',
      stock: product.stock ?? '',
      brand: product.brand || '',
      images: (product.images || []).join('\n'),
    });
  };

  const handleEditCategory = (category) => {
    setActiveTab('categories');
    setEditingCategoryId(category._id);
    setCategoryForm({
      name: category.name || '',
      image: category.image || '',
    });
  };

  const handleDeleteProduct = async (productId) => {
    setSaving(true);
    setErrorMessage('');
    try {
      await adminService.deleteAdminProduct(productId);
      showSuccess('Product archived');
      if (editingProductId === productId) resetProductForm();
      await loadAdminData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not archive the product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    setSaving(true);
    setErrorMessage('');
    try {
      await adminService.deleteAdminCategory(categoryId);
      showSuccess('Category archived');
      if (editingCategoryId === categoryId) resetCategoryForm();
      await loadAdminData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not archive the category.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    setSaving(true);
    setErrorMessage('');
    try {
      await adminService.confirmAdminOrder(orderId);
      showSuccess('Order confirmed');
      await loadAdminData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not confirm the order.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    setSaving(true);
    setErrorMessage('');
    try {
      await adminService.updateAdminOrderStatus(orderId, status);
      showSuccess(`Order marked ${status}`);
      await loadAdminData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not update order status.');
    } finally {
      setSaving(false);
    }
  };

  const overviewCards = [
    { label: 'Products', value: products.length, tone: 'bg-[#e8f0ff] text-[#004aad]' },
    { label: 'Categories', value: categories.length, tone: 'bg-[#eefbf3] text-[#147a3f]' },
    { label: 'Orders', value: orders.length, tone: 'bg-[#fff5e8] text-[#b96300]' },
    { label: 'Users', value: users.length, tone: 'bg-[#f4edff] text-[#6d3bd1]' },
  ];

  const paidOrders = orders.filter((order) => order.isPaid).length;
  const inactiveProducts = products.filter((product) => product.isActive === false).length;
  const inactiveCategories = categories.filter((category) => category.isActive === false).length;

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[100dvh] bg-[#f9f9fc] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-[28px] p-8 text-center shadow-sm border border-gray-100">
          <Shield className="mx-auto text-[#004aad]" size={36} />
          <h1 className="mt-4 text-2xl font-black text-gray-900">Admin Access Required</h1>
          <p className="mt-3 text-sm text-gray-500">This panel is only available to admin accounts.</p>
          <button
            onClick={() => navigate('/home')}
            className="mt-6 w-full rounded-2xl bg-[#004aad] text-white py-3.5 font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#f4f7fb] text-gray-900">
      <header className="sticky top-0 z-30 bg-[#0b2242] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-black">Doorcarts Admin</h1>
              <p className="text-[11px] text-white/70 uppercase tracking-[0.2em]">Operations Console</p>
            </div>
          </div>
          <button
            onClick={loadAdminData}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {errorMessage && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 flex items-center gap-2">
            <CheckCircle2 size={16} />
            {successMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-3 h-fit">
            <div className="px-3 py-4 border-b border-gray-100">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">Signed in as</p>
              <h2 className="mt-2 text-lg font-black text-[#0b2242]">{user?.name || 'Admin'}</h2>
              <p className="text-sm text-gray-500">{user?.phone}</p>
            </div>
            <div className="mt-3 space-y-1">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 font-bold transition-colors ${
                    activeTab === key ? 'bg-[#e8f0ff] text-[#004aad]' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </aside>

          <section className="space-y-6">
            {loading ? (
              <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-10 text-center text-gray-500 font-semibold">
                Loading admin data...
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {overviewCards.map((card) => (
                        <div key={card.label} className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5">
                          <div className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${card.tone}`}>
                            {card.label}
                          </div>
                          <div className="mt-5 text-4xl font-black text-[#0b2242]">{card.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Revenue Health</h3>
                        <p className="mt-4 text-3xl font-black text-[#0b2242]">{paidOrders}</p>
                        <p className="mt-2 text-sm text-gray-500">Paid orders cleared for fulfillment.</p>
                      </div>
                      <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Archived Products</h3>
                        <p className="mt-4 text-3xl font-black text-[#0b2242]">{inactiveProducts}</p>
                        <p className="mt-2 text-sm text-gray-500">Inactive products still visible to admins.</p>
                      </div>
                      <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Archived Categories</h3>
                        <p className="mt-4 text-3xl font-black text-[#0b2242]">{inactiveCategories}</p>
                        <p className="mt-2 text-sm text-gray-500">Inactive categories hidden from shoppers.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'products' && (
                  <div className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
                    <form onSubmit={handleProductSubmit} className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-black text-[#0b2242]">{editingProductId ? 'Edit Product' : 'New Product'}</h2>
                          <p className="text-sm text-gray-500">Create or update inventory items.</p>
                        </div>
                        {editingProductId && (
                          <button type="button" onClick={resetProductForm} className="text-sm font-bold text-[#004aad]">
                            Cancel edit
                          </button>
                        )}
                      </div>
                      <input className="w-full rounded-2xl border border-gray-200 px-4 py-3" placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))} required />
                      <textarea className="w-full rounded-2xl border border-gray-200 px-4 py-3 min-h-28" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))} required />
                      <select className="w-full rounded-2xl border border-gray-200 px-4 py-3 bg-white" value={productForm.category} onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))} required>
                        <option value="">Select category</option>
                        {categories.filter((category) => category.isActive !== false).map((category) => (
                          <option key={category._id} value={category._id}>{category.name}</option>
                        ))}
                      </select>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input className="w-full rounded-2xl border border-gray-200 px-4 py-3" type="number" min="0" step="0.01" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))} required />
                        <input className="w-full rounded-2xl border border-gray-200 px-4 py-3" type="number" min="0" step="0.01" placeholder="Discount price" value={productForm.discountPrice} onChange={(e) => setProductForm((prev) => ({ ...prev, discountPrice: e.target.value }))} />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input className="w-full rounded-2xl border border-gray-200 px-4 py-3" type="number" min="0" step="1" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm((prev) => ({ ...prev, stock: e.target.value }))} required />
                        <input className="w-full rounded-2xl border border-gray-200 px-4 py-3" placeholder="Brand" value={productForm.brand} onChange={(e) => setProductForm((prev) => ({ ...prev, brand: e.target.value }))} />
                      </div>
                      <textarea className="w-full rounded-2xl border border-gray-200 px-4 py-3 min-h-24" placeholder="Image URLs, one per line or comma-separated" value={productForm.images} onChange={(e) => setProductForm((prev) => ({ ...prev, images: e.target.value }))} />
                      <button disabled={saving} className="w-full rounded-2xl bg-[#0b2242] text-white py-3.5 font-black disabled:opacity-60">
                        {saving ? 'Saving...' : editingProductId ? 'Update Product' : 'Create Product'}
                      </button>
                    </form>

                    <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-black text-[#0b2242]">Inventory</h2>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50 text-gray-500 uppercase tracking-[0.14em] text-xs">
                            <tr>
                              <th className="px-5 py-3 text-left">Name</th>
                              <th className="px-5 py-3 text-left">Category</th>
                              <th className="px-5 py-3 text-left">Price</th>
                              <th className="px-5 py-3 text-left">Stock</th>
                              <th className="px-5 py-3 text-left">Status</th>
                              <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((product) => (
                              <tr key={product._id} className="border-t border-gray-100 align-top">
                                <td className="px-5 py-4">
                                  <div className="font-bold text-gray-900">{product.name}</div>
                                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</div>
                                </td>
                                <td className="px-5 py-4">{product.category?.name || 'Unassigned'}</td>
                                <td className="px-5 py-4">{formatINR(product.discountPrice || product.price)}</td>
                                <td className="px-5 py-4">{product.stock}</td>
                                <td className="px-5 py-4">
                                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${product.isActive === false ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'}`}>
                                    {product.isActive === false ? 'Archived' : 'Active'}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => handleEditProduct(product)} className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 font-bold text-gray-700">
                                      <Pencil size={14} />
                                      Edit
                                    </button>
                                    {product.isActive !== false && (
                                      <button onClick={() => handleDeleteProduct(product._id)} className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 font-bold text-red-600">
                                        <Trash2 size={14} />
                                        Archive
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'categories' && (
                  <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <form onSubmit={handleCategorySubmit} className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-black text-[#0b2242]">{editingCategoryId ? 'Edit Category' : 'New Category'}</h2>
                          <p className="text-sm text-gray-500">Manage storefront taxonomy.</p>
                        </div>
                        {editingCategoryId && (
                          <button type="button" onClick={resetCategoryForm} className="text-sm font-bold text-[#004aad]">
                            Cancel edit
                          </button>
                        )}
                      </div>
                      <input className="w-full rounded-2xl border border-gray-200 px-4 py-3" placeholder="Category name" value={categoryForm.name} onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))} required />
                      <input className="w-full rounded-2xl border border-gray-200 px-4 py-3" placeholder="Category image URL" value={categoryForm.image} onChange={(e) => setCategoryForm((prev) => ({ ...prev, image: e.target.value }))} />
                      <button disabled={saving} className="w-full rounded-2xl bg-[#0b2242] text-white py-3.5 font-black disabled:opacity-60">
                        {saving ? 'Saving...' : editingCategoryId ? 'Update Category' : 'Create Category'}
                      </button>
                    </form>

                    <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-black text-[#0b2242]">Categories</h2>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {categories.map((category) => (
                          <div key={category._id} className="px-5 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="font-bold text-gray-900">{category.name}</h3>
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${category.isActive === false ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'}`}>
                                  {category.isActive === false ? 'Archived' : 'Active'}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">{category.slug}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleEditCategory(category)} className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 font-bold text-gray-700">
                                <Pencil size={14} />
                                Edit
                              </button>
                              {category.isActive !== false && (
                                <button onClick={() => handleDeleteCategory(category._id)} className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 font-bold text-red-600">
                                  <Trash2 size={14} />
                                  Archive
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h2 className="text-xl font-black text-[#0b2242]">Orders</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {orders.map((order) => (
                        <div key={order._id} className="px-5 py-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                          <div className="space-y-1">
                            <h3 className="font-bold text-gray-900">#{order._id.slice(-8).toUpperCase()}</h3>
                            <p className="text-sm text-gray-500">
                              {order.user?.name || 'Customer'} • {order.user?.phone || 'No phone'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.items?.length || 0} items • {formatINR(order.totalPrice)}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${order.isPaid ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                              {order.isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                            <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold bg-[#e8f0ff] text-[#004aad]">
                              {order.orderStatus}
                            </span>
                            {!order.stockDecremented && order.paymentMethod === 'razorpay' && order.isPaid && (
                              <button onClick={() => handleConfirmOrder(order._id)} className="rounded-full bg-[#0b2242] text-white px-4 py-2 text-xs font-black">
                                Confirm
                              </button>
                            )}
                            {['shipped', 'delivered', 'cancelled'].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleUpdateOrderStatus(order._id, status)}
                                className="rounded-full border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700"
                              >
                                Mark {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h2 className="text-xl font-black text-[#0b2242]">Users</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase tracking-[0.14em] text-xs">
                          <tr>
                            <th className="px-5 py-3 text-left">Name</th>
                            <th className="px-5 py-3 text-left">Phone</th>
                            <th className="px-5 py-3 text-left">Role</th>
                            <th className="px-5 py-3 text-left">Addresses</th>
                            <th className="px-5 py-3 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((account) => (
                            <tr key={account._id} className="border-t border-gray-100">
                              <td className="px-5 py-4 font-bold text-gray-900">{account.name || 'Unnamed user'}</td>
                              <td className="px-5 py-4">{account.phone}</td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${account.role === 'admin' ? 'bg-[#e8f0ff] text-[#004aad]' : 'bg-gray-100 text-gray-600'}`}>
                                  {account.role}
                                </span>
                              </td>
                              <td className="px-5 py-4">{account.addresses?.length || 0}</td>
                              <td className="px-5 py-4">
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${account.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                  {account.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
