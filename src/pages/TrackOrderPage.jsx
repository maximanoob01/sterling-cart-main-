import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Package, Check, Home, ChevronRight, ExternalLink, HelpCircle } from 'lucide-react';
import { formatPrice, formatDateTime } from '../utils/formatPrice';
import api from '../services/api';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setHasSearched(true);
    
    // Strip '#' if the user copied it from the dashboard
    const cleanOrderId = orderId.trim().replace(/^#/, '');

    if (!cleanOrderId) {
      setError('Please enter a valid Order ID');
      setOrder(null);
      return;
    }

    try {
      const res = await api.get(`/orders/track/${cleanOrderId}`);
      if (res.success && res.order) {
        // Map backend format to match what the UI expects
        const mappedOrder = {
          ...res.order,
          id: res.order.orderId,
          date: res.order.createdAt,
          total: res.order.totalAmount
        };
        setOrder(mappedOrder);
        setError('');
      } else {
        setOrder(null);
        setError('Order not found. Please check your Order ID and try again.');
      }
    } catch (err) {
      // Fallback: try local mock data
      try {
        const { mockOrders } = await import('../data/orders');
        const found = mockOrders.find(o => o.id.toLowerCase() === cleanOrderId.toLowerCase());
        if (found) {
          setOrder(found);
          setError('');
        } else {
          setOrder(null);
          setError('Order not found. Please check your Order ID and try again.');
        }
      } catch {
        setOrder(null);
        setError('Order not found. Please check your Order ID and try again.');
      }
    }
  };

  return (
    <div className="bg-bg-surface min-h-screen pb-20 sm:pb-0 pb-16">
      {/* Breadcrumb */}
      <div className="bg-pink-50 py-3 px-4 md:px-8 lg:px-16 text-sm text-charcoal mb-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link to="/" className="flex items-center gap-1 hover:text-pink-400">
             <Home size={16} /> Home
          </Link>
          <ChevronRight size={14} className="text-silver-400" />
          <span className="text-pink-400">Track Order</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-charcoal mb-4">Track Your Order</h1>
          <p className="text-silver-500">Enter your order details below to see its current status.</p>
        </div>

        {/* Tracking Form */}
        <div className="bg-silver-50 rounded-2xl p-6 md:p-8 mb-10">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-charcoal mb-2">Order ID</label>
              <input 
                type="text" 
                placeholder="e.g. SC-ORD-10001" 
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-silver-200 outline-none focus:border-pink-300"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-charcoal mb-2">Email or Phone</label>
              <input 
                type="text" 
                placeholder="Used during checkout" 
                value={contactInfo}
                onChange={e => setContactInfo(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-silver-200 outline-none focus:border-pink-300"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full md:w-auto py-3 px-8 shadow-pink">
                <Search size={18} /> Track
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {hasSearched && error && (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
            <Package size={32} className="mx-auto mb-3 opacity-50" />
            <h3 className="font-bold mb-1">Order Not Found</h3>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Order Tracking Results */}
        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-bg-surface border border-silver-200 rounded-2xl overflow-hidden shadow-sm">
            
            {/* Header */}
            <div className="bg-pink-50 p-6 border-b border-pink-100 flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-1">Order Status</p>
                <h3 className="font-serif text-2xl font-bold text-charcoal">{order.id}</h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-silver-500">Order placed on</p>
                <p className="font-medium text-charcoal">{order.date}</p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              
              {/* Timeline */}
              <div className="mb-12 relative">
                 <div className="absolute left-6 top-8 bottom-8 w-1 bg-silver-200 md:left-8"></div>
                 
                 <div className="space-y-8 relative">
                   {order.timeline.map((step, idx) => (
                     <div key={idx} className="flex items-start gap-4 md:gap-6">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-4 border-white shadow-sm transition-colors ${step.completed ? 'bg-pink-400 text-white' : 'bg-silver-200 text-silver-500'}`}>
                          {step.completed ? <Check size={20} /> : <div className="w-3 h-3 rounded-full bg-silver-400"></div>}
                        </div>
                        <div className="pt-2">
                           <h4 className={`font-bold ${step.completed ? 'text-charcoal' : 'text-silver-400'}`}>{step.status}</h4>
                           {step.date && <p className="text-sm text-silver-500 mt-1">{formatDateTime(step.date)}</p>}
                           
                           {/* Add tracking link for Shipped status */}
                           {step.status === 'Shipped' && step.completed && order.trackingNumber && (
                             <div className="mt-3 bg-silver-50 p-3 rounded-lg border border-silver-200 inline-block">
                               <p className="text-xs text-silver-500 mb-1">Courier: {order.courierName}</p>
                               <a href="#" className="text-sm font-medium text-pink-400 flex items-center gap-1 hover:underline">
                                 {order.trackingNumber} <ExternalLink size={14} />
                               </a>
                             </div>
                           )}
                        </div>
                     </div>
                   ))}
                 </div>
              </div>

              {/* Order Items Summary */}
              <div className="border-t border-silver-200 pt-8">
                <h4 className="font-bold text-charcoal mb-4">Items in this shipment</h4>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-16 h-16 bg-silver-100 rounded-lg overflow-hidden flex-shrink-0">
                         {/* Placeholder image approach since we don't have direct access to image imports here, assuming it's in public or we use a fallback */}
                         <div className="w-full h-full bg-pink-50 flex items-center justify-center text-pink-300">
                           <Package size={24} />
                         </div>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-charcoal text-sm">{item.name}</h5>
                        {item.size && <p className="text-xs text-silver-500 mt-0.5">Size: {item.size}</p>}
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-silver-500">Qty: {item.qty}</p>
                          <p className="font-medium text-sm">{formatPrice(item.price)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-silver-200 flex flex-wrap justify-between items-center gap-4">
                <p className="text-sm text-charcoal font-medium">Total: <span className="font-bold text-lg">{formatPrice(order.total)}</span></p>
                <Link to="/contact" className="text-sm text-pink-400 hover:underline flex items-center gap-1">
                  <HelpCircle size={14} /> Need Help with this order?
                </Link>
              </div>

            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
