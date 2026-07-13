import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Tag, CheckCircle, XCircle, Plus, Edit2, Trash2 } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';

const AdminOffersTab = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    discount: '',
    minOrderValue: 0,
    maxDiscount: '',
    usageLimit: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      if (res.success) {
        setCoupons(res.coupons);
      }
    } catch (error) {
      toast.error('Failed to load active offers');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const res = await api.put(`/coupons/${coupon.id}`, { isActive: !coupon.isActive });
      if (res.success) {
        toast.success(`Coupon ${coupon.code} ${!coupon.isActive ? 'enabled' : 'disabled'}`);
        fetchCoupons();
      }
    } catch (error) {
      toast.error('Failed to update coupon status');
    }
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await api.delete(`/coupons/${couponId}`);
      if (res.success) {
        toast.success('Coupon deleted');
        fetchCoupons();
      }
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      type: 'percentage',
      discount: '',
      minOrderValue: 0,
      maxDiscount: '',
      usageLimit: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      discount: coupon.discount,
      minOrderValue: coupon.minOrderValue || 0,
      maxDiscount: coupon.maxDiscount || '',
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        discount: Number(formData.discount),
        minOrderValue: Number(formData.minOrderValue),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      };

      if (editingCoupon) {
        const res = await api.put(`/coupons/${editingCoupon.id}`, payload);
        if (res.success) toast.success('Coupon updated successfully');
      } else {
        const res = await api.post('/coupons', payload);
        if (res.success) toast.success('Coupon created successfully');
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (error) {
      toast.error(error.message || 'Failed to save coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-text-muted">Loading offers...</div>;

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-serif font-semibold text-text-main">Active Offers</h2>
          <p className="text-[14px] text-text-muted mt-1">Manage and view currently active discount codes.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[#D4527A] text-white px-[20px] py-[10px] rounded-full font-sans text-[13px] font-bold flex items-center gap-2 hover:bg-[#B94B68] transition-colors"
        >
          <Plus size={16} /> Add Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
        {coupons.map(coupon => (
          <div key={coupon.id} className="bg-white border border-border-main rounded-2xl p-[20px] shadow-sm relative group">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button 
                onClick={() => handleToggleActive(coupon)}
                className={`text-[12px] font-bold px-2 py-1 rounded border ${coupon.isActive ? 'text-green-600 border-green-200 bg-green-50' : 'text-gray-500 border-gray-200 bg-gray-50'}`}
              >
                {coupon.isActive ? 'Enabled' : 'Disabled'}
              </button>
              <button onClick={() => openEditModal(coupon)} className="text-gray-400 hover:text-blue-500 transition-colors">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(coupon.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-start justify-between mb-4 mt-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${coupon.isActive ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#FCE8E6] text-[#C5221F]'}`}>
                  <Tag size={20} />
                </div>
                <div>
                  <h3 className="font-sans text-[16px] font-bold text-text-main">{coupon.code}</h3>
                  <p className="text-[12px] text-text-muted uppercase tracking-wider">{coupon.type}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mt-4 pt-4 border-t border-border-main">
              <div className="flex justify-between text-[13px]">
                <span className="text-text-muted">Discount</span>
                <span className="font-bold text-text-main">
                  {coupon.type === 'percentage' ? `${coupon.discount}%` : formatPrice(coupon.discount)}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-text-muted">Min Order</span>
                <span className="font-bold text-text-main">{formatPrice(coupon.minOrderValue)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-text-muted">Max Discount</span>
                <span className="font-bold text-text-main">{coupon.maxDiscount ? formatPrice(coupon.maxDiscount) : 'No limit'}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-text-muted">Used</span>
                <span className="font-bold text-text-main">{coupon.usedCount} times {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}</span>
              </div>
            </div>
          </div>
        ))}
        {coupons.length === 0 && (
          <div className="col-span-full py-12 text-center text-text-muted bg-white rounded-2xl border border-dashed border-border-main">
            No offers found.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-serif font-bold text-text-main mb-4">
              {editingCoupon ? 'Edit Offer' : 'Add New Offer'}
            </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-text-main mb-1">Coupon Code</label>
                <input 
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2 border border-border-main rounded-xl focus:ring-1 focus:ring-[#D4527A] outline-none uppercase"
                  placeholder="e.g. SUMMER20"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text-main mb-1">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-border-main rounded-xl focus:ring-1 focus:ring-[#D4527A] outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-1">Discount</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    className="w-full px-4 py-2 border border-border-main rounded-xl focus:ring-1 focus:ring-[#D4527A] outline-none"
                    placeholder="e.g. 10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main mb-1">Minimum Order Value (₹)</label>
                <input 
                  type="number"
                  min="0"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({...formData, minOrderValue: e.target.value})}
                  className="w-full px-4 py-2 border border-border-main rounded-xl focus:ring-1 focus:ring-[#D4527A] outline-none"
                />
              </div>

              {formData.type === 'percentage' && (
                <div>
                  <label className="block text-sm font-bold text-text-main mb-1">Max Discount Amount (₹) [Optional]</label>
                  <input 
                    type="number"
                    min="1"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                    className="w-full px-4 py-2 border border-border-main rounded-xl focus:ring-1 focus:ring-[#D4527A] outline-none"
                    placeholder="e.g. 500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-text-main mb-1">Usage Limit [Optional]</label>
                <input 
                  type="number"
                  min="1"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  className="w-full px-4 py-2 border border-border-main rounded-xl focus:ring-1 focus:ring-[#D4527A] outline-none"
                  placeholder="Total times this can be used"
                />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input 
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-[#D4527A] rounded focus:ring-[#D4527A]"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-text-main">Active</label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-main">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#D4527A] text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-[#B94B68] disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffersTab;
