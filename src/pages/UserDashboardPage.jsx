import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Heart, MapPin, User, Truck, LogOut, ShoppingCart,
  Download, ChevronRight, Home, Plus, Star, Trash2, X, Edit, Menu, Lock, Coins, TrendingUp, Gift, Share2, Copy, ShieldCheck, ShoppingBag, Headphones
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { useProducts } from '../context/ProductContext';
import { mockOrders } from '../data/orders';
import { formatPrice, formatDate } from '../utils/formatPrice';
import { generateInvoice } from '../utils/generateInvoice';
import { shareGiftCardToWhatsApp } from '../utils/shareUtils';
import toast from 'react-hot-toast';
import api from '../services/api';
import royalPointsCoinImg from '../assets/images/royal_points_coin.webp';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  Packed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  'Out for Delivery': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  Delivered: 'bg-green-100 text-green-800 border-green-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

// Custom Crown icon as it is missing from this version of lucide-react
const Crown = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm1 16h18"/>
  </svg>
);

const sidebarTabs = [
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'rewards', label: 'Royal Points', icon: Crown },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'giftcards', label: 'My Gift Cards', icon: Gift },
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
      className="mt-3 inline-flex items-center gap-1.5 bg-[#FFEBF0] text-[#D4527A] px-4 py-1.5 rounded-full mx-auto shadow-sm"
    >
      <span className="text-sm">💎</span>
      <span className="font-sans text-[12px] font-bold">{balance} Royal Points</span>
    </motion.div>
  );
};

/* ==================== ORDERS TAB ==================== */
const OrderCard = ({ order }) => {
  const { user } = useAuth();
  const { products } = useProducts();
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
    <motion.div variants={fadeUpItem} className="bg-white border border-pink-100/60 rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgba(212,82,122,0.06)] transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FFEBF0] flex items-center justify-center text-[#D4527A] shrink-0">
            <ShoppingBag size={18} />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-charcoal text-[14px] font-sans">#{order.id}</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${order.status === 'CONFIRMED' ? 'bg-[#FFEBF0] text-[#B94B68]' : 'bg-gray-100 text-gray-700'}`}>
                {order.status}
              </span>
            </div>
            <span className="text-[12px] text-silver-500 font-medium">{formatDate(order.date)} • {totalItems} Item{totalItems !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-charcoal border border-pink-100 hover:bg-pink-50 rounded-xl text-[12px] font-semibold transition-colors shadow-sm"
          >
            <Download size={14} className="text-silver-500" /> Invoice
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B94B68] text-white rounded-xl text-[12px] font-semibold hover:bg-[#9f3e58] transition-colors shadow-sm min-w-[120px] justify-center"
          >
            {isExpanded ? 'Hide Details' : 'Show Details'} <ChevronRight size={14} className={`transform transition-transform ${isExpanded ? '-rotate-90' : 'rotate-90'}`} />
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
            <div className="mt-4 pt-4 border-t border-pink-50 grid grid-cols-1 gap-3">
              {order.items.map((item, idx) => {
                const product = products.find(p => p.id === item.productId);
                const imageUrl = item.image || (product ? product.images[0] : null);
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-[64px] h-[64px] rounded-[16px] overflow-hidden bg-[#FEF9F9] shrink-0 border border-pink-50/50 p-1">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="text-pink-200" /></div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 justify-center">
                      <h4 className="font-serif text-[#2D1F24] font-semibold truncate text-[15px] mb-0.5">{item.name}</h4>
                      <div className="flex items-center gap-1.5 text-[12px] text-[#2D1F24]/60 font-medium">
                        <span>Qty: {item.qty}</span>
                        <span className="w-1 h-1 rounded-full bg-silver-300"></span>
                        {item.size && <span>Size: {item.size}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-pink-50 flex items-center justify-between bg-[#FEF9F9]/50 -mx-4 -mb-4 p-4 rounded-b-2xl">
              <span className="text-[14px] font-medium text-silver-500">Total Amount</span>
              <span className="text-[20px] font-bold text-charcoal">{formatPrice(order.total)}</span>
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
            total: o.totalAmount || 0,
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center bg-[#FEF9F9] rounded-[24px] shadow-sm border border-pink-100/50">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-pink-50">
          <Package size={40} className="text-[#D4527A]" />
        </div>
        <h3 className="text-2xl font-serif text-[#2D1F24] mb-2">No orders yet</h3>
        <p className="text-silver-500 font-sans mb-8 max-w-sm">
          You haven't placed any orders. Start exploring our premium collection!
        </p>
        <Link to="/shop" className="px-8 py-3 bg-[#B94B68] text-white rounded-full font-semibold hover:bg-[#9f3e58] transition-all shadow-md flex items-center gap-2">
          <ShoppingCart size={18} /> Browse Collection
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4 bg-[#FEF9F9] rounded-[24px] p-5 relative overflow-hidden border border-pink-50 shadow-sm">
        <div className="relative z-10">
          <h2 className="text-[28px] font-serif text-[#2D1F24] tracking-tight mb-0.5">My Orders</h2>
          <p className="text-[13px] text-silver-500 font-medium">Track and manage all your orders in one place.</p>
        </div>
        
        {/* Right side graphic */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-30 hidden sm:block">
          <div className="relative text-5xl">
            🛍️
            <span className="absolute -top-4 -right-4 text-xl animate-pulse">✨</span>
            <span className="absolute bottom-0 -left-4 text-lg animate-pulse delay-150">✨</span>
          </div>
        </div>
      </div>
      
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </motion.div>

      <div className="mt-4 bg-[#FEF9F9] rounded-[24px] p-4 flex items-center justify-between border border-pink-50 shadow-sm flex-col sm:flex-row gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3 flex-col sm:flex-row">
          <div className="w-10 h-10 rounded-full bg-[#FFEBF0] flex items-center justify-center text-[#B94B68] shrink-0">
            <Headphones size={18} />
          </div>
          <div>
            <h4 className="font-serif text-[#2D1F24] font-semibold text-[15px] mb-0.5">Need help with your order?</h4>
            <p className="text-[12px] text-silver-500">Our support team is here to help you 24/7.</p>
          </div>
        </div>
        <Link to="/contact" className="px-4 py-2 rounded-xl bg-[#FFEBF0] border border-pink-100/50 text-[#B94B68] text-[13px] font-semibold hover:bg-pink-100 transition-colors flex items-center gap-1.5 shrink-0">
          Contact Support <ChevronRight size={14} />
        </Link>
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

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlistItems.map((product) => (
          <motion.div
            key={product.id}
            variants={fadeUpItem}
            className="group bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgba(212,82,122,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
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
                className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:scale-110 transition-all shadow-sm"
                title="Remove from wishlist"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="p-3.5 flex flex-col flex-1">
              <div className="flex items-center gap-1 mb-1.5">
                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                <span className="text-[11px] text-silver-500 font-bold">{product.rating}</span>
              </div>
              <h3 className="font-serif text-charcoal text-[13px] mb-2 line-clamp-2 group-hover:text-[#D4527A] transition-colors leading-snug flex-1">{product.name}</h3>
              <div className="flex items-center justify-between mt-auto pt-1">
                <div className="flex flex-col min-w-0 pr-1">
                  <span className="font-bold text-charcoal text-[15px] leading-none truncate">{formatPrice(product.price)}</span>
                  {product.mrp > product.price && (
                    <span className="text-[10px] text-silver-400 line-through mt-0.5 truncate">{formatPrice(product.mrp)}</span>
                  )}
                </div>
                <button
                  onClick={() => { addItem(product); removeItem(product.id); toast.success('Moved to Cart!'); }}
                  className="w-8 h-8 shrink-0 bg-charcoal hover:bg-[#D4527A] text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                  title="Move to Cart"
                >
                  <ShoppingCart size={14} />
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
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile({ name: profile.name, phone: profile.phone });
    toast.success('Profile updated successfully', {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const res = await api.delete('/auth/me');
      if (res.success) {
        toast.success('Account deleted successfully');
        logout();
        navigate('/');
      } else {
        toast.error(res.error || 'Failed to delete account');
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      toast.error('An error occurred while deleting account');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
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

      <motion.div variants={fadeUpItem} className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 md:p-8 mt-6 shadow-[0_8px_32px_rgba(212,82,122,0.05)]">
        <h3 className="text-xl font-serif text-charcoal mb-4">Support & Policies</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/contact" className="flex items-center justify-between p-3 rounded-2xl hover:bg-pink-50 transition-colors border border-transparent hover:border-pink-100/50 group">
            <span className="font-sans text-sm font-semibold text-charcoal group-hover:text-[#D4527A] transition-colors">Contact Support</span>
            <ChevronRight size={16} className="text-silver-400 group-hover:text-[#D4527A] transition-colors" />
          </Link>
          <Link to="/faq" className="flex items-center justify-between p-3 rounded-2xl hover:bg-pink-50 transition-colors border border-transparent hover:border-pink-100/50 group">
            <span className="font-sans text-sm font-semibold text-charcoal group-hover:text-[#D4527A] transition-colors">FAQs</span>
            <ChevronRight size={16} className="text-silver-400 group-hover:text-[#D4527A] transition-colors" />
          </Link>
          <Link to="/return-exchange" className="flex items-center justify-between p-3 rounded-2xl hover:bg-pink-50 transition-colors border border-transparent hover:border-pink-100/50 group">
            <span className="font-sans text-sm font-semibold text-charcoal group-hover:text-[#D4527A] transition-colors">Return Policy</span>
            <ChevronRight size={16} className="text-silver-400 group-hover:text-[#D4527A] transition-colors" />
          </Link>
          <Link to="/legal" className="flex items-center justify-between p-3 rounded-2xl hover:bg-pink-50 transition-colors border border-transparent hover:border-pink-100/50 group">
            <span className="font-sans text-sm font-semibold text-charcoal group-hover:text-[#D4527A] transition-colors">Privacy Policy</span>
            <ChevronRight size={16} className="text-silver-400 group-hover:text-[#D4527A] transition-colors" />
          </Link>
          <Link to="/legal" className="flex items-center justify-between p-3 rounded-2xl hover:bg-pink-50 transition-colors border border-transparent hover:border-pink-100/50 group sm:col-span-2">
            <span className="font-sans text-sm font-semibold text-charcoal group-hover:text-[#D4527A] transition-colors">Terms & Conditions</span>
            <ChevronRight size={16} className="text-silver-400 group-hover:text-[#D4527A] transition-colors" />
          </Link>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={fadeUpItem} className="bg-red-50/50 backdrop-blur-xl border border-red-100 rounded-3xl p-6 md:p-8 mt-6 shadow-[0_8px_32px_rgba(220,38,38,0.05)]">
        <h3 className="text-xl font-serif text-red-900 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-700/80 mb-6">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        
        {!showDeleteConfirm ? (
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-full font-semibold transition-all duration-300 shadow-sm flex items-center gap-2 text-sm"
          >
            <Trash2 size={16} /> Delete Account
          </button>
        ) : (
          <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-sm inline-block">
            <p className="text-sm font-bold text-red-900 mb-3">Are you absolutely sure?</p>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all shadow-sm text-sm disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-charcoal rounded-full font-semibold transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

/* helper icons for ProfileTab */
const PhoneIcon = ({ size, className }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
const MailIcon = ({ size, className }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>;

/* ==================== ADDRESSES TAB ==================== */
const AddressesTab = () => {
  const { user, setUser } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.addressLine1 || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingId) {
        const res = await api.put('/auth/addresses/' + editingId, form);
        if (res.success) {
          setUser({ ...user, addresses: res.addresses });
          toast.success('Address updated!', { style: { background: '#FFF0F5', color: '#2D2D2D' }, iconTheme: { primary: '#F4A0B0', secondary: '#FFF' } });
        }
      } else {
        const res = await api.post('/auth/addresses', { ...form, isDefault: addresses.length === 0 });
        if (res.success) {
          setUser({ ...user, addresses: res.addresses });
          toast.success('Address added!', { style: { background: '#FFF0F5', color: '#2D2D2D' }, iconTheme: { primary: '#F4A0B0', secondary: '#FFF' } });
        }
      }
      resetForm();
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete('/auth/addresses/' + id);
      if (res.success) {
        setUser({ ...user, addresses: res.addresses });
        toast.success('Address removed');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove address');
    }
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
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-1">
        <div>
          <h2 className="text-2xl font-serif text-[#5A1F2E] tracking-tight flex items-center gap-2">
            <span>👑</span> Royal Points
          </h2>
          <p className="text-xs text-silver-500 mt-0.5 font-medium">Earn points on every purchase and unlock exclusive rewards.</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFEBF0] text-[#D4527A] font-semibold text-xs hover:bg-pink-100 transition-colors border border-pink-100/50 shadow-sm">
          <span>🎁</span> How it works <ChevronRight size={12} />
        </button>
      </div>

      {/* Balance hero card */}
      <motion.div
        variants={fadeUpItem}
        className="relative rounded-[24px] overflow-hidden shadow-[0_12px_40px_rgba(90,31,46,0.15)] border border-[#5A1F2E]/30"
      >
        {/* Dark maroon gradient matching the image */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#3B1927] via-[#2A131F] to-[#1C0D15]" />
        
        {/* Decorative elements */}
        <div className="absolute -top-10 left-10 w-64 h-64 rounded-full bg-[#D4527A]/20 blur-[80px]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#D4527A]/10 blur-[100px]" />

        <div className="relative z-10 p-5 md:p-6 flex flex-col h-full">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-sans text-[10px] uppercase tracking-[2px] font-bold text-white/80 flex items-center gap-2 mb-2">
                <span className="text-base">👑</span> YOUR BALANCE
              </p>
              <div className="flex items-baseline gap-2 mb-0.5">
                <motion.span
                  key={balance}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-serif text-[48px] font-medium text-white leading-none drop-shadow-md"
                >
                  {balance}
                </motion.span>
                <span className="font-sans text-[18px] font-medium text-[#F4A0B0] mb-1.5">pts</span>
              </div>
              <p className="font-sans text-[12px] text-white/70 mt-1">≈ ₹{balance} redeemable value</p>
            </div>

            {/* Animated coin icon */}
            <div className="relative w-20 h-20 shrink-0 mt-1 mr-1">
              <div className="absolute inset-0 rounded-full bg-[#D4527A]/30 blur-2xl animate-pulse" />
              {/* Sparkles */}
              <span className="absolute -top-1 -left-1 text-[#F4A0B0] text-sm animate-pulse">✨</span>
              <span className="absolute bottom-1 -right-2 text-[#F4A0B0] text-xs animate-pulse delay-75">✨</span>
              
              <motion.img
                src={royalPointsCoinImg}
                alt="Royal Points"
                className="relative w-full h-full rounded-full object-cover drop-shadow-[0_0_10px_rgba(212,82,122,0.6)]"
                animate={{ rotate: [0, 5, -5, 5, 0], y: [0, -4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Tier + progress */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-[12px] font-sans mb-2.5">
              <span className="flex items-center gap-1.5 font-bold text-white tracking-wide">
                <span className="text-sm">{currentTier.name === 'Silver' ? '🥈' : currentTier.name === 'Gold' ? '🥇' : currentTier.name === 'Platinum' ? '💠' : '💎'}</span>
                {currentTier.name} Member
              </span>
              {nextTier && (
                <span className="text-white/70 font-medium tracking-wide">
                  <span className="text-[#F4A0B0]">{nextTier.min - balance} pts</span> to {nextTier.name}
                </span>
              )}
            </div>
            <div className="h-2 rounded-full bg-black/40 overflow-hidden shadow-inner border border-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#F4A0B0] to-[#D4527A]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Ways to Earn */}
      <div className="mt-6">
        <h3 className="font-serif text-[16px] text-[#5A1F2E] flex items-center gap-1.5 mb-3 font-bold">
          <Gift size={16} /> Ways to Earn
        </h3>
        <motion.div
          variants={fadeUpItem}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {[
            { icon: '🛍️', title: 'Shop', desc: 'Earn 10 points for every ₹1000 spent' },
            { icon: '📦', title: 'Collect', desc: 'Points auto-added after each delivery' },
            { icon: '🎁', title: 'Redeem', desc: 'Use points to get exciting rewards & offers' },
          ].map((step, i) => (
            <div key={i} className="bg-[#FEF9F9] backdrop-blur-md rounded-[16px] p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-pink-50 flex items-center justify-between group hover:shadow-[0_4px_15px_rgba(212,82,122,0.04)] transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFEBF0] flex items-center justify-center text-xl shrink-0 shadow-inner relative">
                  {step.icon}
                  <span className="absolute -bottom-1 -right-1 bg-[#F4A0B0] text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full border border-white shadow-sm">★</span>
                </div>
                <div>
                  <p className="font-serif text-[14px] font-bold text-[#2D1F24] mb-0.5">{step.title}</p>
                  <p className="font-sans text-[10px] text-[#2D1F24]/60 font-medium leading-snug pr-1">{step.desc}</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#D4527A]/50 group-hover:text-[#D4527A] transition-colors shrink-0" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* More Points, More Perks! Banner */}
      {nextTier && (
        <motion.div variants={fadeUpItem} className="mt-1 bg-gradient-to-r from-[#FFF0F3] to-[#FFE6EA] border border-pink-100 rounded-[16px] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-xl relative z-10 border border-pink-100">
                ⭐
              </div>
              <span className="absolute -top-1 -left-1 text-pink-400 text-[10px] animate-pulse">✨</span>
              <span className="absolute -bottom-1 -right-1 text-pink-400 text-[10px] animate-pulse delay-100">✨</span>
            </div>
            <div>
              <p className="font-serif text-[14px] font-bold text-[#5A1F2E] mb-0.5">More Points, More Perks!</p>
              <p className="font-sans text-[11px] text-[#5A1F2E]/70 max-w-sm font-medium leading-snug">Move to {nextTier.name} & enjoy exclusive benefits, early access to sales and more.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:border-l sm:border-[#D4527A]/15 sm:pl-4">
            <div className="text-center sm:text-right">
              <p className="font-serif text-[24px] font-bold text-[#D4527A] leading-none">{nextTier.min - balance} <span className="font-sans text-[12px] font-medium text-[#D4527A]/70">pts</span></p>
              <p className="font-sans text-[10px] font-medium text-[#5A1F2E]/60 mt-1 uppercase tracking-wider">away from {nextTier.name}</p>
            </div>
            <Link to="/shop" className="shrink-0 bg-[#C25874] hover:bg-[#A84A62] text-white px-4 py-2 rounded-full text-[12px] font-semibold transition-colors shadow-md flex items-center gap-1.5">
              Keep Shopping <ShoppingCart size={12} />
            </Link>
          </div>
        </motion.div>
      )}

      {/* History */}
      <motion.div variants={fadeUpItem}>
        <h3 className="font-serif text-lg text-charcoal mb-3">Transaction History</h3>
        {history.length === 0 ? (
          <div className="bg-white/40 backdrop-blur-md rounded-[20px] border border-white/50 p-6 text-center">
            <Coins size={28} className="text-[#D4527A]/30 mx-auto mb-2" />
            <p className="text-silver-500 text-xs">No transactions yet. Start shopping to earn points!</p>
            <Link to="/shop" className="inline-flex items-center gap-1 mt-3 px-4 py-2 bg-[#D4527A] text-white rounded-full font-semibold text-xs hover:bg-[#B94B68] transition-all">
              <ShoppingCart size={12} /> Browse Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {history.map((item, i) => (
              <motion.div
                key={item.id}
                variants={fadeUpItem}
                className="flex items-center gap-3 bg-white/60 backdrop-blur-md border border-white/60 rounded-[16px] p-3 shadow-sm hover:shadow-[0_4px_12px_rgba(212,82,122,0.05)] transition-shadow"
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  item.type === 'earned'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-[#FFF0F5] text-[#D4527A]'
                }`}>
                  {item.type === 'earned' ? <TrendingUp size={14} /> : <Gift size={14} />}
                </div>
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[12px] font-semibold text-charcoal truncate">{item.description}</p>
                  <p className="font-sans text-[10px] text-silver-500 mt-0.5">
                    {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {/* Points */}
                <div className={`font-sans text-[13px] font-bold shrink-0 ${
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

/* ==================== GIFT CARDS TAB ==================== */
const GiftCardsTab = () => {
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpModal, setOtpModal] = useState({ show: false, gcId: null });
  const [otpValue, setOtpValue] = useState('');

  useEffect(() => {
    fetchGiftCards();
  }, []);

  const fetchGiftCards = async () => {
    try {
      const res = await api.get('/gift-cards/mine');
      setGiftCards(res.giftCards || []);
    } catch (err) {
      toast.error('Failed to load gift cards');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReveal = async (gcId) => {
    try {
      const toastId = toast.loading('Sending OTP...');
      await api.post('/gift-cards/reveal-otp');
      toast.dismiss(toastId);
      toast.success('OTP sent to your email/WhatsApp');
      setOtpModal({ show: true, gcId });
    } catch (err) {
      toast.error('Failed to send OTP');
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpValue || otpValue.length < 6) return toast.error('Enter a valid OTP');
    try {
      const toastId = toast.loading('Verifying...');
      await api.post('/gift-cards/reveal', { giftCardId: otpModal.gcId, otp: otpValue });
      toast.dismiss(toastId);
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.error || 'Invalid OTP');
      setOtpModal({ show: false, gcId: null });
      setOtpValue('');
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-serif text-2xl lg:text-3xl text-charcoal">My Gift Cards</h2>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-[#D4527A] border-t-transparent rounded-full animate-spin" /></div>
      ) : giftCards.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 p-10 text-center">
          <Gift size={36} className="text-silver-400 mx-auto mb-3" />
          <p className="text-silver-500 font-medium mb-4">You haven't purchased any gift cards yet.</p>
          <Link to="/gifting" className="inline-block px-6 py-2.5 bg-[#D4527A] text-white rounded-full font-bold">Buy a Gift Card</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {giftCards.map(gc => (
            <motion.div key={gc.id} variants={fadeUpItem} className="relative overflow-hidden rounded-[24px] bg-[#FEF9F9] shadow-[0_8px_30px_rgba(212,82,122,0.06)] group transition-transform hover:-translate-y-1 border border-pink-100/50">
              
              <div className="relative z-10 p-5 sm:p-6 flex flex-col h-full">
                {/* Header: Value & Status */}
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <p className="text-[11px] text-[#D4527A] font-bold uppercase tracking-wider mb-1">Value</p>
                    <p className="font-serif text-3xl text-[#2D1F24]">₹{gc.originalValue}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${
                    gc.status === 'active' ? 'bg-[#FFEBEF] text-[#D4527A]' :
                    gc.status === 'expired' ? 'bg-red-50 text-red-500' :
                    'bg-yellow-50 text-yellow-600'
                  }`}>
                    {gc.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-[#D4527A]"></span>}
                    {gc.status}
                  </div>
                </div>

                <div className="border-t border-dashed border-pink-200/60 my-4"></div>
                
                {/* Code Box */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#D4527A] font-bold uppercase tracking-wider mb-1.5">Gift Card Code</p>
                    <p className="font-mono text-base sm:text-lg font-bold text-[#2D1F24] tracking-widest truncate">{gc.maskedCode}</p>
                  </div>
                  <button onClick={() => handleRequestReveal(gc.id)} className="shrink-0 text-[#D4527A] bg-[#FFEBEF] hover:bg-pink-100 p-2.5 rounded-xl transition-colors border border-pink-200/50 shadow-sm">
                    <Copy size={18} />
                  </button>
                </div>

                <div className="border-t border-dashed border-pink-200/60 my-4"></div>

                {/* Footer: Balance & Expiry */}
                <div className="flex items-center justify-between mt-auto mb-5">
                  <div>
                    <p className="text-[11px] text-[#D4527A] font-bold uppercase tracking-wider mb-1">Balance</p>
                    <p className="text-base font-bold text-[#2D1F24]">₹{gc.remainingBalance}</p>
                  </div>
                  <div className="w-px h-8 bg-pink-200/50 mx-2"></div>
                  <div className="text-right">
                    <p className="text-[11px] text-[#D4527A] font-bold uppercase tracking-wider mb-1">Expires On</p>
                    <p className="text-base font-bold text-[#2D1F24]">{new Date(gc.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                {gc.status !== 'exhausted' && (
                  <button
                    onClick={() => shareGiftCardToWhatsApp(gc.originalValue, gc.code || '(Check your email/profile)', new Date(gc.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))}
                    className="w-full flex items-center justify-center gap-2 bg-[#FFF0F3] hover:bg-[#FFE6EA] text-[#D4527A] border border-pink-200/60 py-3 rounded-2xl text-[13px] font-bold transition-colors mb-4 shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="opacity-90">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                    Share details via WhatsApp
                  </button>
                )}

                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#2D1F24]/50 font-medium pt-1">
                  <ShieldCheck size={14} className="text-[#D4527A]/80" />
                  Secure • Verified • Trusted
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* OTP Modal */}
      <AnimatePresence>
        {otpModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full relative"
            >
              <button onClick={() => setOtpModal({ show: false, gcId: null })} className="absolute top-4 right-4 text-silver-400 hover:text-charcoal"><X size={20}/></button>
              <h3 className="font-serif text-xl mb-2 text-center text-charcoal">Security Verification</h3>
              <p className="text-sm text-silver-500 text-center mb-6">Enter the OTP sent to your registered email/phone to reveal the code.</p>
              <input
                type="text"
                maxLength={6}
                value={otpValue}
                onChange={e => setOtpValue(e.target.value)}
                className="w-full text-center text-2xl tracking-[0.5em] font-mono p-3 border-2 border-pink-100 rounded-xl focus:border-[#D4527A] focus:outline-none mb-4"
                placeholder="------"
              />
              <button onClick={handleVerifyOTP} className="w-full bg-[#D4527A] text-white py-3 rounded-full font-bold">
                Verify & Reveal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ==================== MAIN PAGE ====================*/
const UserDashboardPage = () => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarTabs = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'rewards', label: 'Royal Points', icon: Crown },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'giftcards', label: 'Gift Cards', icon: Gift },
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  ];

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
      case 'giftcards': return <GiftCardsTab />;
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
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
          {/* Sidebar */}
          <aside className="w-full lg:w-[260px] shrink-0 z-10">
            <div className="bg-[#FEF9F9] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(212,82,122,0.03)] sticky top-32 p-3 pb-4 border border-pink-50">
              {/* User Info */}
              <div className="px-3 pt-4 pb-3 flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-[#B94B68] flex items-center justify-center mb-2 shadow-sm ring-4 ring-white">
                    <span className="text-white font-sans font-bold text-[20px]">
                      {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 1) || 'S'}
                    </span>
                  </div>
                  <div className="absolute top-0 -right-1 bg-[#FCE3CF] w-5 h-5 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                    <span className="text-[10px]">👑</span>
                  </div>
                </div>
                <h3 className="font-sans font-bold text-[#2D1F24] text-[16px] leading-tight mb-1">{user?.name}</h3>
                <p className="text-[10px] text-gray-500 font-medium bg-white border border-pink-100/50 px-2.5 py-0.5 rounded-full">{user?.phone || '+91 8267056560'}</p>
                {/* Points balance pill */}
                <LoyaltyBalancePill />
              </div>

              <div className="px-2 mb-1.5 mt-1">
                <span className="text-[9px] font-bold text-[#D4527A] tracking-wider uppercase">Account</span>
              </div>

              {/* Nav Links */}
              <nav className="flex flex-col gap-1.5">
                {sidebarTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab)}
                      className={`relative w-full flex items-center justify-between px-3 py-2 rounded-[12px] transition-all group ${
                        isActive ? 'bg-[#FFEBF0] text-[#D4527A] shadow-sm' : 'bg-white text-[#2D1F24] hover:bg-pink-50/50 shadow-sm border border-pink-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center transition-colors ${isActive ? 'bg-[#D4527A] text-white' : 'bg-[#FFEBF0] text-[#D4527A] group-hover:bg-[#D4527A] group-hover:text-white'}`}>
                          <Icon size={14} />
                        </div>
                        <span className={`font-sans text-[13px] ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
                      </div>
                      <ChevronRight size={14} className={isActive ? 'text-[#D4527A]' : 'text-silver-400 group-hover:text-[#D4527A]'} />
                    </button>
                  );
                })}
              </nav>

              <div className="mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[13px] font-sans font-semibold text-[#D4527A] bg-transparent hover:bg-pink-50 border border-pink-100 rounded-[12px] transition-all shadow-sm"
                >
                  <LogOut size={14} /> Logout
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
