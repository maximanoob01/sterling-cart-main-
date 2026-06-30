import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Heart, MapPin, User, Truck, LogOut, ShoppingCart,
  Download, ChevronRight, Home, Plus, Star, Trash2, X, Edit, Menu, Lock, Coins, TrendingUp, Gift
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { mockOrders } from '../data/orders';
import { products } from '../data/products';
import { formatPrice, formatDate } from '../utils/formatPrice';
import { generateInvoice } from '../utils/generateInvoice';
import toast from 'react-hot-toast';
import api from '../services/api';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  Packed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  'Out for Delivery': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  Delivered: 'bg-green-100 text-green-800 border-green-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const sidebarTabs = [
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'rewards', label: 'Sterling Pints', icon: Coins },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { id: 'profile', label: 'Profile Settings', icon: User },
  { id: 'track', label: 'Track Order', icon: Truck, link: '/track-order' },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#FFF0F5]">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        x: [0, 50, 0],
        y: [0, 30, 0],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-pink-200/50 mix-blend-multiply filter blur-[100px] opacity-70"
    />
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
        x: [0, -40, 0],
        y: [0, 40, 0],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#E5D5FA]/50 mix-blend-multiply filter blur-[100px] opacity-70"
    />
  </div>
);

/* ── Loyalty Points pill shown in sidebar ── */
const LoyaltyBalancePill = () => {
  const { balance } = useLoyalty();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="mt-2 inline-flex items-center gap-1.5 bg-gradient-to-r from-[#D4527A]/10 to-[#F4A0B0]/10 border border-[#D4527A]/20 rounded-full px-3 py-1 mx-auto"
    >
      <Coins size={12} className="text-[#D4527A]" />
      <span className="font-sans text-[11px] font-bold text-[#D4527A]">{balance} Sterling Pints</span>
    </motion.div>
  );
};

/* ==================== ORDERS TAB ==================== */
const OrderCard = ({ order }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const totalItems = order.items.reduce((acc, item) => acc + item.qty, 0);

  const handleDownloadInvoice = () => {
    generateInvoice(order, user);
    toast.success('Invoice downloaded successfully', {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
  };

  return (
    <motion.div variants={fadeUpItem} className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(212,82,122,0.08)] transition-shadow duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-charcoal text-base">#{order.id}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
              {order.status}
            </span>
          </div>
          <span className="text-xs text-silver-500 font-medium">{formatDate(order.date)} • {totalItems} item{totalItems !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {order.trackingNumber && (
            <Link to="/track-order" className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50/80 text-[#D4527A] hover:bg-pink-100 rounded-full text-[12px] font-semibold transition-colors">
              <Truck size={14} /> Track
            </Link>
          )}
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-silver-600 hover:text-charcoal border border-silver-200 hover:border-silver-300 rounded-full text-[12px] font-semibold transition-colors shadow-sm"
          >
            <Download size={14} /> Invoice
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-charcoal text-white rounded-full text-[12px] font-semibold hover:bg-[#D4527A] transition-colors shadow-sm"
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-6 pt-5 border-t border-pink-100/50 grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.items.map((item, idx) => {
                const product = products.find(p => p.id === item.productId);
                const imageUrl = item.image || (product ? product.images[0] : null);
                return (
                  <div key={idx} className="flex items-center gap-4 bg-white/40 p-3 rounded-2xl border border-white/50">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-pink-50 shrink-0 shadow-sm relative group">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="text-pink-200" /></div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h4 className="font-serif text-charcoal font-medium truncate text-base mb-1">{item.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-silver-500 mb-2">
                        <span className="bg-white/60 px-2 py-0.5 rounded-md">Qty: {item.qty}</span>
                        {item.size && <span className="bg-white/60 px-2 py-0.5 rounded-md">Size: {item.size}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-pink-100/50 flex items-center justify-between">
              <span className="text-sm font-medium text-silver-500">Total Amount</span>
              <span className="text-xl font-bold text-charcoal">{formatPrice(order.total)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        if (res.success) {
          const formatted = res.orders.map(o => ({
            id: o.orderId,
            status: o.orderStatus,
            date: o.createdAt,
            total: o.totalAmount,
            trackingNumber: o.trackingNumber,
            items: o.items.map(i => ({
              productId: i.productId,
              name: i.name,
              qty: i.qty,
              size: i.size,
              price: i.price,
              image: i.image,
            }))
          }));
          setOrders(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-[#D4527A] rounded-full animate-spin mb-4" />
        <p className="text-silver-500">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-[0_8px_32px_rgba(212,82,122,0.05)]">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-white rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Package size={40} className="text-[#D4527A]" />
        </div>
        <h3 className="text-2xl font-serif text-charcoal mb-2">No orders yet</h3>
        <p className="text-silver-500 font-sans mb-8 max-w-sm">
          You haven't placed any orders. Start exploring our premium collection!
        </p>
        <Link to="/shop" className="px-8 py-3 bg-[#D4527A] text-white rounded-full font-semibold hover:bg-[#B94B68] transition-all shadow-lg hover:shadow-pink-500/25 flex items-center gap-2">
          <ShoppingCart size={18} /> Browse Collection
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-serif text-charcoal tracking-tight">My Orders</h2>
      </div>
      
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </motion.div>
    </div>
  );
};

/* ==================== WISHLIST TAB ==================== */
const WishlistTab = () => {
  const { items: wishlistItems, removeItem } = useWishlist();
  const { addItem } = useCart();

  if (wishlistItems.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-[0_8px_32px_rgba(212,82,122,0.05)]">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-white rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Heart size={40} className="text-[#D4527A]" />
        </div>
        <h3 className="text-2xl font-serif text-charcoal mb-2">Your wishlist is empty</h3>
        <p className="text-silver-500 font-sans mb-8 max-w-sm">
          Curate your perfect collection here. Explore our exquisite pieces!
        </p>
        <Link to="/shop" className="px-8 py-3 bg-[#D4527A] text-white rounded-full font-semibold hover:bg-[#B94B68] transition-all shadow-lg hover:shadow-pink-500/25 flex items-center gap-2">
          <ShoppingCart size={18} /> Discover Jewellery
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-serif text-charcoal tracking-tight">
          My Wishlist <span className="text-silver-400 text-lg font-sans align-middle ml-2">({wishlistItems.length})</span>
        </h2>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((product) => (
          <motion.div
            key={product.id}
            variants={fadeUpItem}
            className="group bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgba(212,82,122,0.12)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="relative aspect-square overflow-hidden bg-pink-50/50">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <button
                onClick={() => removeItem(product.id)}
                className="absolute top-4 right-4 w-9 h-9 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:scale-110 transition-all shadow-sm"
                title="Remove from wishlist"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-1 mb-2">
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-silver-500 font-bold">{product.rating}</span>
              </div>
              <h3 className="font-serif text-charcoal text-base mb-3 line-clamp-1 group-hover:text-[#D4527A] transition-colors">{product.name}</h3>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-charcoal text-lg leading-none">{formatPrice(product.price)}</span>
                  {product.mrp > product.price && (
                    <span className="text-xs text-silver-400 line-through mt-1">{formatPrice(product.mrp)}</span>
                  )}
                </div>
                <button
                  onClick={() => { addItem(product); removeItem(product.id); toast.success('Moved to Cart!'); }}
                  className="w-10 h-10 bg-charcoal hover:bg-[#D4527A] text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                  title="Move to Cart"
                >
                  <ShoppingCart size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
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

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile({ name: profile.name, phone: profile.phone });
    toast.success('Profile updated successfully', {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-serif text-charcoal tracking-tight">Profile Settings</h2>
      </div>

      <motion.form variants={fadeUpItem} onSubmit={handleProfileSave} className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_rgba(212,82,122,0.05)] relative overflow-hidden">
        {/* Decorative bloop */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 relative z-10">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative flex items-center">
              <User size={16} className="absolute left-4 text-gray-400" />
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-white rounded-2xl focus:outline-none focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] transition-all font-sans text-sm shadow-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
            <div className="relative flex items-center">
              <PhoneIcon size={16} className="absolute left-4 text-gray-400" />
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-white rounded-2xl focus:outline-none focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] transition-all font-sans text-sm shadow-sm"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative flex items-center">
              <MailIcon size={16} className="absolute left-4 text-gray-400" />
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full pl-10 pr-4 py-3 bg-gray-100/50 backdrop-blur-sm border border-transparent rounded-2xl text-silver-500 cursor-not-allowed font-sans text-sm"
              />
            </div>
            <p className="text-[11px] text-silver-400 mt-2 font-medium flex items-center gap-1"><Lock size={10} /> Email cannot be changed</p>
          </div>
        </div>
        <div className="flex justify-end relative z-10">
          <button type="submit" className="px-8 py-3 bg-charcoal hover:bg-[#D4527A] text-white rounded-full font-semibold transition-all duration-300 shadow-md">
            Save Changes
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

/* helper icons for ProfileTab */
const PhoneIcon = ({ size, className }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
const MailIcon = ({ size, className }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>;

/* ==================== ADDRESSES TAB ==================== */
const AddressesTab = () => {
  const { user, updateProfile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    fullName: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', landmark: '',
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
      toast.success('Address updated!', { style: { background: '#FFF0F5', color: '#2D2D2D' }, iconTheme: { primary: '#F4A0B0', secondary: '#FFF' } });
    } else {
      const newAddr = { ...form, id: Date.now(), isDefault: addresses.length === 0 };
      newAddresses = [...addresses, newAddr];
      toast.success('Address added!', { style: { background: '#FFF0F5', color: '#2D2D2D' }, iconTheme: { primary: '#F4A0B0', secondary: '#FFF' } });
    }
    updateProfile({ addresses: newAddresses });
    resetForm();
  };

  const handleDelete = (id) => {
    const newAddresses = addresses.filter(a => a.id !== id);
    updateProfile({ addresses: newAddresses });
    toast.success('Address removed');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-serif text-charcoal tracking-tight">Saved Addresses</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1 px-5 py-2 bg-[#D4527A] text-white rounded-full text-sm font-semibold hover:bg-[#B94B68] transition-all shadow-md">
            <Plus size={16} /> Add New
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_rgba(212,82,122,0.08)] mb-8 overflow-hidden relative"
            onSubmit={handleSubmit}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-serif text-xl text-charcoal">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
              <button type="button" onClick={resetForm} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-silver-400 hover:text-charcoal shadow-sm transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name *</label>
                <input type="text" value={form.fullName} onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white rounded-xl focus:outline-none focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] transition-all font-sans text-sm shadow-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Address Line 1 *</label>
                <input type="text" value={form.addressLine1} onChange={(e) => setForm(f => ({ ...f, addressLine1: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white rounded-xl focus:outline-none focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] transition-all font-sans text-sm shadow-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Address Line 2</label>
                <input type="text" value={form.addressLine2} onChange={(e) => setForm(f => ({ ...f, addressLine2: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white rounded-xl focus:outline-none focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] transition-all font-sans text-sm shadow-sm" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">City *</label>
                <input type="text" value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white rounded-xl focus:outline-none focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] transition-all font-sans text-sm shadow-sm" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">State *</label>
                <input type="text" value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white rounded-xl focus:outline-none focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] transition-all font-sans text-sm shadow-sm" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Pincode *</label>
                <input type="text" value={form.pincode} onChange={(e) => setForm(f => ({ ...f, pincode: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white rounded-xl focus:outline-none focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] transition-all font-sans text-sm shadow-sm" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Landmark</label>
                <input type="text" value={form.landmark} onChange={(e) => setForm(f => ({ ...f, landmark: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white rounded-xl focus:outline-none focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] transition-all font-sans text-sm shadow-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 relative z-10">
              <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-full text-silver-600 font-semibold hover:bg-white transition-colors">Cancel</button>
              <button type="submit" className="px-8 py-2.5 bg-charcoal text-white rounded-full font-semibold hover:bg-[#D4527A] transition-all shadow-md">{editingId ? 'Update' : 'Save'} Address</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {!showForm && (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.length === 0 ? (
            <motion.div variants={fadeUpItem} className="col-span-2 flex flex-col items-center justify-center py-16 text-center bg-white/40 backdrop-blur-md rounded-3xl border border-white/50">
              <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                <MapPin size={32} className="text-[#D4527A]" />
              </div>
              <h3 className="text-xl font-serif text-charcoal mb-2">No saved addresses</h3>
              <p className="text-silver-500 font-sans text-sm">Add an address to make checkout faster.</p>
            </motion.div>
          ) : (
            addresses.map((addr) => (
              <motion.div key={addr.id} variants={fadeUpItem} className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-6 relative hover:shadow-[0_8px_32px_rgba(212,82,122,0.08)] transition-all duration-300">
                {addr.isDefault && (
                  <span className="absolute top-4 right-4 bg-pink-100/80 text-[#D4527A] text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                    Default
                  </span>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-silver-400">
                    <MapPin size={18} />
                  </div>
                  <h4 className="font-bold text-charcoal text-lg">{addr.fullName}</h4>
                </div>
                <p className="text-sm text-silver-600 leading-relaxed pl-[52px]">
                  {addr.addressLine1}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}<br />
                  {addr.city}, {addr.state} — {addr.pincode}
                  {addr.landmark && <><br /><span className="text-silver-400 text-xs">Landmark: {addr.landmark}</span></>}
                </p>
                <div className="flex items-center gap-4 mt-6 pl-[52px]">
                  <button onClick={() => handleEdit(addr)} className="text-sm font-semibold text-charcoal hover:text-[#D4527A] flex items-center gap-1.5 transition-colors">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="text-sm font-semibold text-red-400 hover:text-red-500 flex items-center gap-1.5 transition-colors">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
};

/* ==================== REWARDS TAB ==================== */
const RewardsTab = () => {
  const { balance, history } = useLoyalty();

  // Tier thresholds
  const tiers = [
    { name: 'Silver', min: 0, max: 499, color: '#9CA3AF', gradient: 'from-gray-300 to-gray-400' },
    { name: 'Gold', min: 500, max: 999, color: '#D97706', gradient: 'from-yellow-400 to-amber-500' },
    { name: 'Platinum', min: 1000, max: 2499, color: '#7C3AED', gradient: 'from-violet-500 to-purple-600' },
    { name: 'Diamond', min: 2500, max: Infinity, color: '#D4527A', gradient: 'from-[#D4527A] to-[#B94B68]' },
  ];
  const currentTier = tiers.find((t) => balance >= t.min && balance <= t.max) || tiers[0];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progressPct = nextTier
    ? Math.min(100, ((balance - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
    : 100;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-serif text-charcoal tracking-tight">Sterling Pints</h2>
      </div>

      {/* Balance hero card */}
      <motion.div
        variants={fadeUpItem}
        className="relative rounded-[28px] overflow-hidden shadow-[0_16px_48px_rgba(212,82,122,0.2)]"
      >
        {/* BG gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4527A] via-[#C04070] to-[#8B2252]" />
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-black/10" />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-white/5 blur-2xl" />

        <div className="relative z-10 p-7 md:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-sans text-[11px] uppercase tracking-[2.5px] font-bold text-white/60 mb-2">Your Balance</p>
              <div className="flex items-end gap-3">
                <motion.span
                  key={balance}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-serif text-[56px] font-bold text-white leading-none"
                >
                  {balance}
                </motion.span>
                <span className="font-sans text-[18px] font-semibold text-white/70 mb-2">pts</span>
              </div>
              <p className="font-sans text-[13px] text-white/60 mt-1">≈ ₹{balance} redeemable value</p>
            </div>

            {/* Animated coin icon */}
            <motion.div
              animate={{ rotate: [0, 8, -8, 8, 0], y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-full bg-white/15 border border-white/20 flex items-center justify-center shadow-[0_0_24px_rgba(255,255,255,0.2)]"
            >
              <Coins size={32} className="text-white" />
            </motion.div>
          </div>

          {/* Tier + progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-[12px] font-sans mb-2">
              <span className="flex items-center gap-1.5 font-bold text-white">
                <span className="w-2 h-2 rounded-full" style={{ background: currentTier.color }} />
                {currentTier.name} Member
              </span>
              {nextTier && (
                <span className="text-white/60">
                  {nextTier.min - balance} pts to {nextTier.name}
                </span>
              )}
            </div>
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${currentTier.gradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* How it works strip */}
      <motion.div
        variants={fadeUpItem}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { icon: '🛍️', title: 'Shop', desc: 'Earn 10 points for every 10k spent' },
          { icon: '🪙', title: 'Collect', desc: 'Points auto-added after delivery' },
          { icon: '🎁', title: 'Redeem', desc: 'Up to 3% off on next order' },
        ].map((step, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-4 text-center shadow-sm">
            <span className="text-[24px]">{step.icon}</span>
            <p className="font-serif text-[14px] text-charcoal mt-2 mb-1">{step.title}</p>
            <p className="font-sans text-[10px] text-silver-500 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* History */}
      <motion.div variants={fadeUpItem}>
        <h3 className="font-serif text-xl text-charcoal mb-4">Transaction History</h3>
        {history.length === 0 ? (
          <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 p-10 text-center">
            <Coins size={36} className="text-[#D4527A]/30 mx-auto mb-3" />
            <p className="text-silver-500 text-sm">No transactions yet. Start shopping to earn points!</p>
            <Link to="/shop" className="inline-flex items-center gap-1.5 mt-4 px-5 py-2.5 bg-[#D4527A] text-white rounded-full font-semibold text-sm hover:bg-[#B94B68] transition-all">
              <ShoppingCart size={14} /> Browse Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, i) => (
              <motion.div
                key={item.id}
                variants={fadeUpItem}
                className="flex items-center gap-4 bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-4 shadow-sm hover:shadow-[0_8px_24px_rgba(212,82,122,0.08)] transition-shadow"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  item.type === 'earned'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-[#FFF0F5] text-[#D4527A]'
                }`}>
                  {item.type === 'earned' ? <TrendingUp size={17} /> : <Gift size={17} />}
                </div>
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[13px] font-semibold text-charcoal truncate">{item.description}</p>
                  <p className="font-sans text-[11px] text-silver-500 mt-0.5">
                    {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {/* Points */}
                <div className={`font-sans text-[15px] font-bold shrink-0 ${
                  item.type === 'earned' ? 'text-green-600' : 'text-[#D4527A]'
                }`}>
                  {item.type === 'earned' ? '+' : '−'}{item.points} pts
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

/* ==================== MAIN PAGE ====================*/
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
      case 'orders': return <OrdersTab />;
      case 'rewards': return <RewardsTab />;
      case 'wishlist': return <WishlistTab />;
      case 'profile': return <ProfileTab />;
      case 'addresses': return <AddressesTab />;
      default: return <OrdersTab />;
    }
  };

  return (
    <div className="min-h-screen pb-20 sm:pb-0 relative z-0 selection:bg-pink-200 selection:text-charcoal">
      <BackgroundBlobs />
      
      {/* Breadcrumb */}
      <div className="bg-white/40 backdrop-blur-md border-b border-white/50 sticky top-[72px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-[13px] font-medium font-sans">
            <Link to="/" className="text-silver-500 hover:text-[#D4527A] transition-colors flex items-center gap-1">
              <Home size={14} /> Home
            </Link>
            <ChevronRight size={14} className="text-silver-400" />
            <span className="text-charcoal">My Account</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between mb-4 bg-white/60 backdrop-blur-xl p-4 rounded-3xl border border-white/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4527A] to-[#B94B68] flex items-center justify-center text-white font-serif text-lg font-bold shadow-md">
                {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h1 className="text-lg font-serif text-charcoal leading-tight">My Account</h1>
                <p className="text-xs text-silver-500 font-medium">{user?.name}</p>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2.5 bg-white rounded-full shadow-sm text-charcoal hover:text-[#D4527A] transition-colors">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="bg-white/80 backdrop-blur-2xl border border-white rounded-3xl overflow-hidden mb-4 shadow-xl z-30 relative"
              >
                <div className="p-2 space-y-1">
                  {sidebarTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all ${
                          isActive ? 'bg-[#D4527A] text-white shadow-md' : 'text-silver-600 hover:bg-white hover:text-charcoal'
                        }`}
                      >
                        <Icon size={18} /> {tab.label}
                      </button>
                    );
                  })}
                  <div className="h-px bg-pink-100/50 my-2 mx-4" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-8 lg:gap-12 relative">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0 z-10">
            <div className="bg-white/60 backdrop-blur-2xl border border-white rounded-[2rem] overflow-hidden shadow-[0_8px_32px_rgba(212,82,122,0.06)] sticky top-32 p-3">
              {/* User Info */}
              <div className="px-5 pt-6 pb-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4527A] to-[#B94B68] flex items-center justify-center mb-4 shadow-lg ring-4 ring-white">
                  <span className="text-white font-serif font-bold text-2xl tracking-wider">
                    {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <h3 className="font-serif text-charcoal text-xl leading-tight mb-1">{user?.name}</h3>
                <p className="text-xs text-silver-500 font-medium bg-white/80 px-3 py-1 rounded-full">{user?.phone}</p>
                {/* Points balance pill */}
                <LoyaltyBalancePill />
              </div>

              {/* Nav Links */}
              <nav className="p-2 relative flex flex-col gap-1">
                {sidebarTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab)}
                      className={`relative w-full flex items-center gap-3 px-5 py-4 text-sm font-semibold rounded-2xl transition-all z-10 overflow-hidden group ${
                        isActive ? 'text-white' : 'text-silver-600 hover:text-charcoal'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-[#D4527A] rounded-2xl z-[-1] shadow-md"
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                      )}
                      {!isActive && (
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 rounded-2xl z-[-1] transition-opacity duration-300" />
                      )}
                      <Icon size={18} className={isActive ? "text-white" : "text-silver-400 group-hover:text-[#D4527A] transition-colors"} />
                      {tab.label}
                      {tab.link && <ChevronRight size={14} className="ml-auto opacity-50" />}
                    </button>
                  );
                })}
              </nav>

              <div className="p-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-5 py-4 text-sm font-semibold text-charcoal bg-white hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all shadow-sm"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0 z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
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
