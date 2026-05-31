import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Heart, MapPin, User, Truck, LogOut, ShoppingCart,
  Download, ChevronRight, Home, Plus, Star, Trash2, X, Edit, Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { mockOrders } from '../data/orders';
import { products } from '../data/products';
import { formatPrice, formatDate } from '../utils/formatPrice';
import toast from 'react-hot-toast';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Packed: 'bg-indigo-100 text-indigo-800',
  Shipped: 'bg-purple-100 text-purple-800',
  'Out for Delivery': 'bg-cyan-100 text-cyan-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const sidebarTabs = [
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { id: 'profile', label: 'Profile Settings', icon: User },
  { id: 'track', label: 'Track Order', icon: Truck, link: '/track-order' },
];

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

/* ==================== ORDERS TAB ==================== */
const OrdersTab = () => {
  const orders = mockOrders;

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6">
          <Package size={40} className="text-pink-300" />
        </div>
        <h3 className="text-xl font-serif text-charcoal mb-2">No orders yet</h3>
        <p className="text-silver-500 font-sans mb-6 max-w-sm">
          You haven't placed any orders. Start exploring our collection!
        </p>
        <Link to="/shop" className="btn-primary">
          <ShoppingCart size={16} /> Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-serif text-charcoal mb-6">My Orders</h2>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-silver-200">
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="bg-pink-50 text-charcoal">
              <th className="text-left px-4 py-3 font-semibold">Order ID</th>
              <th className="text-left px-4 py-3 font-semibold">Date</th>
              <th className="text-left px-4 py-3 font-semibold">Items</th>
              <th className="text-left px-4 py-3 font-semibold">Total</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-center px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-silver-100 hover:bg-pink-50/40 transition-colors">
                <td className="px-4 py-3.5 font-medium text-charcoal">{order.id}</td>
                <td className="px-4 py-3.5 text-silver-600">{formatDate(order.date)}</td>
                <td className="px-4 py-3.5 max-w-[250px]">
                  <div className="flex flex-col gap-3">
                    {order.items.map((item, idx) => {
                      const product = products.find(p => p.id === item.productId);
                      const imageUrl = product ? product.images[0] : null;
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          {imageUrl ? (
                            <img src={imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-silver-200 shadow-sm shrink-0 bg-pink-50" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-pink-50 border border-silver-200 shrink-0 flex items-center justify-center">
                              <Package size={16} className="text-pink-300" />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-medium text-charcoal truncate">{item.name}</span>
                            <span className="text-[11px] text-silver-500">Qty: {item.qty} {item.size ? `| Size: ${item.size}` : ''}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-3.5 font-semibold text-charcoal">{formatPrice(order.total)}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {order.trackingNumber && (
                      <Link
                        to="/track-order"
                        className="text-pink-400 hover:text-pink-500 transition-colors p-1.5 rounded-lg hover:bg-pink-50"
                        title="Track Order"
                      >
                        <Truck size={16} />
                      </Link>
                    )}
                    <button
                      onClick={() => toast.success('Invoice download started!', {
                        style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFE4EE' },
                        iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
                      })}
                      className="text-silver-500 hover:text-charcoal transition-colors p-1.5 rounded-lg hover:bg-silver-100"
                      title="Download Invoice"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-bg-surface border border-silver-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-charcoal text-sm">{order.id}</p>
                <p className="text-xs text-silver-500 mt-0.5">{formatDate(order.date)}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                {order.status}
              </span>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {order.items.map((item, idx) => {
                const product = products.find(p => p.id === item.productId);
                const imageUrl = product ? product.images[0] : null;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-silver-200 shadow-sm shrink-0 bg-pink-50" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-pink-50 border border-silver-200 shrink-0 flex items-center justify-center">
                        <Package size={16} className="text-pink-300" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-medium text-charcoal truncate">{item.name}</span>
                      <span className="text-[11px] text-silver-500">Qty: {item.qty} {item.size ? `| Size: ${item.size}` : ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between border-t border-silver-100 pt-3">
              <p className="font-semibold text-charcoal">{formatPrice(order.total)}</p>
              <div className="flex items-center gap-2">
                {order.trackingNumber && (
                  <Link to="/track-order" className="text-pink-400 p-1.5">
                    <Truck size={16} />
                  </Link>
                )}
                <button
                  onClick={() => toast.success('Invoice download started!', {
                    style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFE4EE' },
                    iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
                  })}
                  className="text-silver-500 p-1.5"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==================== WISHLIST TAB ==================== */
const WishlistTab = () => {
  const { items: wishlistItems, removeItem } = useWishlist();
  const { addItem } = useCart();

  if (wishlistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6">
          <Heart size={40} className="text-pink-300" />
        </div>
        <h3 className="text-xl font-serif text-charcoal mb-2">Your wishlist is empty</h3>
        <p className="text-silver-500 font-sans mb-6 max-w-sm">
          Save your favourite pieces here for later. Explore our collection to find something you love!
        </p>
        <Link to="/shop" className="btn-primary">
          <ShoppingCart size={16} /> Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-serif text-charcoal mb-6">
        My Wishlist <span className="text-silver-500 text-base font-sans">({wishlistItems.length})</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {wishlistItems.map((product) => (
          <motion.div
            key={product.id}
            className="bg-bg-surface border border-silver-200 rounded-xl overflow-hidden product-card"
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="relative aspect-square bg-pink-50 overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeItem(product.id)}
                className="absolute top-3 right-3 w-8 h-8 bg-bg-surface/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors shadow-sm"
                title="Remove from wishlist"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-serif text-charcoal text-sm mb-1 line-clamp-1">{product.name}</h3>
              <div className="flex items-center gap-1 mb-3">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-silver-500 font-sans">{product.rating}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-charcoal font-sans">{formatPrice(product.price)}</span>
                  {product.mrp > product.price && (
                    <span className="text-xs text-silver-400 line-through ml-2 font-sans">{formatPrice(product.mrp)}</span>
                  )}
                </div>
                <button
                  onClick={() => addItem(product)}
                  className="bg-pink-300 hover:bg-pink-400 text-white p-2 rounded-full transition-colors"
                  title="Add to Cart"
                >
                  <ShoppingCart size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* ==================== PROFILE TAB ==================== */
const ProfileTab = () => {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwords, setPasswords] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile({ name: profile.name, phone: profile.phone });
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.newPassword || !passwords.confirm) {
      toast.error('Please fill all password fields');
      return;
    }
    if (passwords.newPassword !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    toast.success('Password updated successfully!', {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFE4EE' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
    setPasswords({ current: '', newPassword: '', confirm: '' });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif text-charcoal mb-6">Profile Settings</h2>
        <form onSubmit={handleProfileSave} className="bg-bg-surface border border-silver-200 rounded-xl p-5 md:p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5 font-sans">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-silver-200 rounded-lg focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-colors font-sans text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5 font-sans">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-4 py-2.5 border border-silver-200 rounded-lg focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-colors font-sans text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-charcoal mb-1.5 font-sans">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2.5 border border-silver-200 rounded-lg bg-silver-100 text-silver-500 cursor-not-allowed font-sans text-sm"
              />
              <p className="text-xs text-silver-400 mt-1 font-sans">Email cannot be changed</p>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary w-full sm:w-auto px-8">
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-xl font-serif text-charcoal mb-4">Change Password</h3>
        <form onSubmit={handlePasswordUpdate} className="bg-bg-surface border border-silver-200 rounded-xl p-5 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5 font-sans">Current Password</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                className="w-full px-4 py-2.5 border border-silver-200 rounded-lg focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-colors font-sans text-sm"
                placeholder="Current"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5 font-sans">New Password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                className="w-full px-4 py-2.5 border border-silver-200 rounded-lg focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-colors font-sans text-sm"
                placeholder="New"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5 font-sans">Confirm Password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                className="w-full px-4 py-2.5 border border-silver-200 rounded-lg focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-colors font-sans text-sm"
                placeholder="Confirm"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-secondary w-full sm:w-auto px-8">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ==================== ADDRESSES TAB ==================== */
const AddressesTab = () => {
  const { user, updateProfile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  const addresses = user?.addresses || [];

  const resetForm = () => {
    setForm({ fullName: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', landmark: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (addr) => {
    setForm({ ...addr });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.addressLine1 || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all required fields');
      return;
    }

    let newAddresses;
    if (editingId) {
      newAddresses = addresses.map(a => (a.id === editingId ? { ...form, id: editingId } : a));
      toast.success('Address updated!', {
        style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFE4EE' },
        iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
      });
    } else {
      const newAddr = { ...form, id: Date.now(), isDefault: addresses.length === 0 };
      newAddresses = [...addresses, newAddr];
      toast.success('Address added!', {
        style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFE4EE' },
        iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
      });
    }
    updateProfile({ addresses: newAddresses });
    resetForm();
  };

  const handleDelete = (id) => {
    const newAddresses = addresses.filter(a => a.id !== id);
    updateProfile({ addresses: newAddresses });
    toast.success('Address removed', {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFE4EE' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-charcoal">Saved Addresses</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
            <Plus size={16} /> Add New
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-bg-surface border border-silver-200 rounded-xl p-6 mb-6 overflow-hidden"
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-charcoal">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
              <button type="button" onClick={resetForm} className="text-silver-400 hover:text-charcoal">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-charcoal mb-1 font-sans">Full Name *</label>
                <input type="text" value={form.fullName} onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-silver-200 rounded-lg focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-colors font-sans text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-charcoal mb-1 font-sans">Address Line 1 *</label>
                <input type="text" value={form.addressLine1} onChange={(e) => setForm(f => ({ ...f, addressLine1: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-silver-200 rounded-lg focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-colors font-sans text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-charcoal mb-1 font-sans">Address Line 2</label>
                <input type="text" value={form.addressLine2} onChange={(e) => setForm(f => ({ ...f, addressLine2: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-silver-200 rounded-lg focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-colors font-sans text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1 font-sans">City *</label>
                <input type="text" value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-silver-200 rounded-lg focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-colors font-sans text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1 font-sans">State *</label>
                <input type="text" value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-silver-200 rounded-lg focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-colors font-sans text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1 font-sans">Pincode *</label>
                <input type="text" value={form.pincode} onChange={(e) => setForm(f => ({ ...f, pincode: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-silver-200 rounded-lg focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-colors font-sans text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1 font-sans">Landmark</label>
                <input type="text" value={form.landmark} onChange={(e) => setForm(f => ({ ...f, landmark: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-silver-200 rounded-lg focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-colors font-sans text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit" className="btn-primary">{editingId ? 'Update Address' : 'Save Address'}</button>
              <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {addresses.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
            <MapPin size={32} className="text-pink-300" />
          </div>
          <h3 className="text-lg font-serif text-charcoal mb-2">No saved addresses</h3>
          <p className="text-silver-500 font-sans text-sm">Add an address to make checkout faster.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-bg-surface border border-silver-200 rounded-xl p-5 relative">
              {addr.isDefault && (
                <span className="absolute top-3 right-3 bg-pink-100 text-pink-400 text-xs font-semibold px-2.5 py-0.5 rounded-full font-sans">
                  Default
                </span>
              )}
              <h4 className="font-semibold text-charcoal font-sans mb-1">{addr.fullName}</h4>
              <p className="text-sm text-silver-600 font-sans leading-relaxed">
                {addr.addressLine1}
                {addr.addressLine2 && `, ${addr.addressLine2}`}<br />
                {addr.city}, {addr.state} — {addr.pincode}
                {addr.landmark && <><br />Landmark: {addr.landmark}</>}
              </p>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handleEdit(addr)}
                  className="text-sm text-pink-400 hover:text-pink-500 font-sans flex items-center gap-1 transition-colors"
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-sm text-red-400 hover:text-red-500 font-sans flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ==================== MAIN PAGE ==================== */
const UserDashboardPage = () => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      openAuthModal();
    }
  }, [isAuthenticated, navigate, openAuthModal]);

  if (!isAuthenticated) return null;

  const handleTabClick = (tab) => {
    if (tab.link) {
      navigate(tab.link);
      return;
    }
    setActiveTab(tab.id);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <OrdersTab />;
      case 'wishlist':
        return <WishlistTab />;
      case 'profile':
        return <ProfileTab />;
      case 'addresses':
        return <AddressesTab />;
      default:
        return <OrdersTab />;
    }
  };

  return (
    <div className="min-h-screen bg-silver-100">
      {/* Breadcrumb */}
      <div className="bg-pink-50 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm font-sans">
            <Link to="/" className="text-silver-500 hover:text-pink-400 transition-colors flex items-center gap-1">
              <Home size={14} />
              Home
            </Link>
            <ChevronRight size={14} className="text-silver-400" />
            <span className="text-charcoal font-medium">My Account</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Mobile Header */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-serif text-charcoal">My Account</h1>
              <p className="text-sm text-silver-500 font-sans">Welcome, {user?.name}</p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-bg-surface border border-silver-200 rounded-lg"
            >
              <Menu size={20} className="text-charcoal" />
            </button>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-bg-surface border border-silver-200 rounded-xl overflow-hidden mb-4"
              >
                {sidebarTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-sans transition-colors ${
                        isActive ? 'bg-pink-100 text-pink-400 border-l-3 border-pink-300' : 'text-silver-600 hover:bg-pink-50'
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-sans text-red-400 hover:bg-red-50 transition-colors border-t border-silver-100"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[250px] shrink-0">
            <div className="bg-bg-surface border border-silver-200 rounded-xl overflow-hidden sticky top-24">
              {/* User Info */}
              <div className="p-5 border-b border-silver-100">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-200 to-pink-400 flex items-center justify-center mb-3">
                  <span className="text-white font-serif font-bold text-lg">
                    {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <h3 className="font-serif text-charcoal text-lg">{user?.name}</h3>
                <p className="text-sm text-silver-500 font-sans">{user?.email}</p>
              </div>

              {/* Nav Links */}
              <nav className="py-2">
                {sidebarTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab)}
                      className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-sans transition-all ${
                        isActive
                          ? 'bg-pink-100 text-pink-400 border-l-[3px] border-pink-300 font-medium'
                          : 'text-silver-600 hover:bg-pink-50 hover:text-charcoal border-l-[3px] border-transparent'
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                      {tab.link && <ChevronRight size={14} className="ml-auto text-silver-400" />}
                    </button>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="border-t border-silver-100 py-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm font-sans text-red-400 hover:bg-red-50 transition-colors border-l-[3px] border-transparent"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
