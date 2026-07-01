import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings,
  TrendingUp, TrendingDown, Clock, Search, Edit, Trash2, Eye, Download,
  Plus, X, Scale, Wrench, ChevronRight, ChevronDown, ChevronUp, Phone, MapPin, Mail,
  CheckCircle, Circle, Printer, Star, ArrowUpRight, ArrowDownRight,
  Image as ImageIcon, Upload, Bell, CheckCheck, Info, AlertTriangle, PackageCheck, Palette
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { categories } from '../data/products';
import { mockOrders, mockCustomers, revenueData } from '../data/orders';
import { formatPrice } from '../utils/formatPrice';
import { generateInvoice } from '../utils/generateInvoice';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  Delivered:        { bg: '#E6F4EA', text: '#137333' },
  Shipped:          { bg: '#F3E8FF', text: '#7E22CE' },
  Confirmed:        { bg: '#E0F2FE', text: '#0369A1' },
  Cancelled:        { bg: '#FCE8E6', text: '#C5221F' },
  Pending:          { bg: '#FFF3E0', text: '#E65100' },
  Packed:           { bg: '#FFF3E0', text: '#E65100' },
  'Out for Delivery': { bg: '#F3E8FF', text: '#7E22CE' },
  'Pending Approval': { bg: '#FEF3C7', text: '#D97706' },
  'Engraving': { bg: '#DBEAFE', text: '#2563EB' },
  'Rejected': { bg: '#FEE2E2', text: '#DC2626' },
  'Cancelled (Refunded)': { bg: '#FCE8E6', text: '#C5221F' },
};

const PIE_COLORS = ['#137333','#7E22CE','#0369A1','#E65100','#C5221F','#F4A0B0'];

const EMPTY_PRODUCT = {
  name: '', sku: '', category: 'rings', description: '', shortDescription: '',
  pricingType: 'mrp', weightGrams: '', makingCharges: '',
  price: '', mrp: '', stockQty: '', badge: 'New',
  metal: '925 Sterling Silver', stoneType: 'No Stone',
  occasion: 'everyday', style: 'minimalist',
  images: [], imagePreviewUrls: [],
};

// ─── Helper: status badge ──────────────────────────────────────────────────────
function StatusBadge({ status, size = 'sm' }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS['Pending'];
  const cls = size === 'sm'
    ? 'inline-flex font-sans text-[11px] font-bold uppercase tracking-[0.5px] px-[8px] py-[4px] rounded-[6px]'
    : 'inline-flex font-sans text-[12px] font-bold uppercase tracking-[0.5px] px-[10px] py-[5px] rounded-[8px]';
  return (
    <span className={cls} style={{ background: c.bg, color: c.text }}>{status}</span>
  );
}

// ─── Order Detail Panel ────────────────────────────────────────────────────────
function OrderDetailPanel({ order, onClose }) {
  const handlePrintInvoice = () => {
    const addr = order.shippingAddress;
    const itemsHTML = order.items.map(item => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;">
          ${item.name}
          ${item.engravingText ? `<br><small style="color:#D4527A;font-weight:600;">Engraving: "${item.engravingText}"</small>` : ''}
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;">${item.qty}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">₹${item.price.toLocaleString()}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">₹${(item.price * item.qty).toLocaleString()}</td>
      </tr>
    `).join('');

    const invoiceHTML = `
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8"><title>Invoice ${order.id}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Segoe UI',sans-serif;color:#1a1a1a;padding:40px;max-width:720px;margin:0 auto}
        .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #D4527A}
        .brand{font-size:28px;font-weight:700;color:#D4527A;letter-spacing:1px}
        .brand-sub{font-size:11px;color:#888;letter-spacing:2px;margin-top:2px}
        .invoice-meta{text-align:right}
        .invoice-meta h2{font-size:20px;color:#1a1a1a;margin-bottom:6px}
        .invoice-meta p{font-size:13px;color:#666}
        .section{margin:20px 0}
        .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#D4527A;margin-bottom:10px}
        .address-block{font-size:14px;line-height:1.7;color:#333}
        table{width:100%;border-collapse:collapse;margin:16px 0}
        thead tr{background:#FFF0F5}
        th{padding:10px 8px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#D4527A}
        th:last-child,th:nth-child(3),th:nth-child(2){text-align:right}
        .totals{display:flex;flex-direction:column;align-items:flex-end;gap:6px;margin-top:16px;padding-top:16px;border-top:1px solid #eee}
        .totals .row{display:flex;gap:60px;font-size:14px}
        .totals .row span:last-child{min-width:100px;text-align:right}
        .totals .grand{font-size:18px;font-weight:700;color:#D4527A;border-top:2px solid #D4527A;padding-top:10px;margin-top:4px}
        .footer{margin-top:40px;text-align:center;font-size:12px;color:#999;border-top:1px solid #eee;padding-top:20px}
        @media print{body{padding:20px}}
      </style></head><body>
      <div class="header">
        <div><div class="brand">STERLING KART</div><div class="brand-sub">925 SILVER JEWELS</div></div>
        <div class="invoice-meta">
          <h2>TAX INVOICE</h2>
          <p><strong>${order.id}</strong></p>
          <p>Date: ${new Date(order.date).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</p>
          <p>Payment: ${order.paymentMethod}</p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px">
        <div class="section">
          <div class="section-title">Bill To</div>
          <div class="address-block">
            <strong>${addr.fullName}</strong><br>
            ${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}<br>
            ${addr.city}, ${addr.state} — ${addr.pincode}<br>
            ${addr.landmark ? 'Landmark: ' + addr.landmark + '<br>' : ''}
            Phone: ${order.customerPhone}<br>
            Email: ${order.customerEmail}
          </div>
        </div>
        <div class="section">
          <div class="section-title">Shipped To</div>
          <div class="address-block">
            <strong>${addr.fullName}</strong><br>
            ${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}<br>
            ${addr.city}, ${addr.state} — ${addr.pincode}
            ${order.trackingNumber ? '<br><br><strong>Tracking:</strong> ' + order.trackingNumber + '<br><strong>Courier:</strong> ' + order.courierName : ''}
          </div>
        </div>
      </div>
      <table>
        <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
        <tbody>${itemsHTML}</tbody>
      </table>
      <div class="totals">
        <div class="row"><span>Subtotal</span><span>₹${order.subtotal.toLocaleString()}</span></div>
        ${order.discount > 0 ? `<div class="row"><span>Discount${order.couponCode ? ' (' + order.couponCode + ')' : ''}</span><span style="color:#137333">−₹${order.discount.toLocaleString()}</span></div>` : ''}
        <div class="row"><span>Shipping</span><span>${order.shipping === 0 ? 'FREE' : '₹' + order.shipping}</span></div>
        <div class="row"><span>GST (3%)</span><span>₹${order.gst.toLocaleString()}</span></div>
        <div class="row grand"><span>Total Payable</span><span>₹${order.total.toLocaleString()}</span></div>
      </div>
      <div class="footer">Thank you for shopping with Sterling Kart! For queries: hello@sterlingcart.com | +91 99999 00000</div>
      </body></html>
    `;

    const win = window.open('', '_blank', 'width=800,height=900');
    win.document.write(invoiceHTML);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  const addr = order.shippingAddress;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed top-0 right-0 z-[210] h-full w-full max-w-[520px] bg-bg-surface shadow-[−8px_0_40px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
        style={{ animation: 'slideInRight 0.3s cubic-bezier(0.25,1,0.5,1)' }}
      >
        <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-main bg-bg-surface shrink-0">
          <div>
            <h2 className="font-serif text-[20px] text-text-main font-bold">{order.id}</h2>
            <p className="font-sans text-[12px] text-text-muted mt-0.5">{new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintInvoice}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-[#1A1A1A] text-white text-[12px] font-semibold hover:bg-[#D4527A] transition-colors"
            >
              <Printer size={14} /> Invoice
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F5F0F1] flex items-center justify-center text-text-muted hover:text-text-main transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Status */}
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} size="lg" />
            {order.trackingNumber && (
              <span className="font-sans text-[12px] text-text-muted">
                {order.courierName} · {order.trackingNumber}
              </span>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-[#FAFAFA] rounded-[14px] p-4 space-y-2.5">
            <p className="font-sans text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-3">Customer</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-pink-100 text-[#D4527A] flex items-center justify-center font-bold text-[14px] shrink-0">
                {order.customerName.charAt(0)}
              </div>
              <div>
                <p className="font-sans font-semibold text-[14px] text-text-main">{order.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-text-muted">
              <Phone size={13} className="text-[#D4527A] shrink-0" />
              <span>{order.customerPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-text-muted">
              <Mail size={13} className="text-[#D4527A] shrink-0" />
              <span>{order.customerEmail}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-[#FAFAFA] rounded-[14px] p-4">
            <p className="font-sans text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-3">Shipping Address</p>
            <div className="flex gap-2">
              <MapPin size={14} className="text-[#D4527A] shrink-0 mt-0.5" />
              <div className="font-sans text-[13px] text-text-main leading-relaxed">
                <p className="font-semibold">{addr.fullName}</p>
                <p>{addr.addressLine1}{addr.addressLine2 ? ', ' + addr.addressLine2 : ''}</p>
                <p>{addr.city}, {addr.state} — {addr.pincode}</p>
                {addr.landmark && <p className="text-text-muted text-[12px]">📍 {addr.landmark}</p>}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <p className="font-sans text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-3">Items Ordered</p>
            <div className="space-y-2.5">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#FAFAFA] rounded-[12px]">
                  <div className="w-10 h-10 rounded-[8px] bg-white border border-border-main overflow-hidden shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center text-[10px] text-[#D4527A] font-bold">
                      {item.name.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-medium text-[13px] text-text-main truncate">{item.name}</p>
                    {item.size && <p className="text-[11px] text-text-muted">Size: {item.size}</p>}
                    {item.engravingText && <p className="text-[11px] font-medium text-[#D4527A] mt-0.5">Engraving: "{item.engravingText}"</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-sans font-bold text-[13px] text-text-main">{formatPrice(item.price * item.qty)}</p>
                    <p className="font-sans text-[11px] text-text-muted">×{item.qty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-[#FAFAFA] rounded-[14px] p-4 space-y-2">
            <p className="font-sans text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-3">Price Summary</p>
            <div className="flex justify-between font-sans text-[13px] text-text-muted">
              <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between font-sans text-[13px] text-[#137333]">
                <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                <span>−{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-sans text-[13px] text-text-muted">
              <span>Shipping</span><span>{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between font-sans text-[13px] text-text-muted">
              <span>GST</span><span>{formatPrice(order.gst)}</span>
            </div>
            <div className="flex justify-between font-sans text-[15px] font-bold text-text-main pt-2 border-t border-border-main">
              <span>Total Paid</span><span className="text-[#D4527A]">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between font-sans text-[12px] text-text-muted">
              <span>Payment Method</span><span>{order.paymentMethod}</span>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="font-sans text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-3">Order Timeline</p>
            <div className="space-y-0">
              {order.timeline.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {step.completed
                      ? <CheckCircle size={16} className="text-[#137333] shrink-0" fill="#137333" color="white" />
                      : <Circle size={16} className="text-[#D0D0D0] shrink-0" />
                    }
                    {i < order.timeline.length - 1 && (
                      <div className={`w-[1.5px] flex-1 my-1 min-h-[16px] ${step.completed ? 'bg-[#137333]/30' : 'bg-[#E0E0E0]'}`} />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className={`font-sans text-[13px] font-medium ${step.completed ? 'text-text-main' : 'text-text-muted'}`}>{step.status}</p>
                    {step.date && (
                      <p className="font-sans text-[11px] text-text-muted">
                        {new Date(step.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' · '}
                        {new Date(step.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Add/Edit Product Modal ────────────────────────────────────────────────────
function ProductModal({ product, onSave, onClose, mode = 'edit' }) {
  const [form, setForm] = useState(product);
  const fileInputRef = useRef(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const remaining = 4 - (form.imagePreviewUrls || []).length;
    if (remaining <= 0) { toast.error('Maximum 4 images allowed'); return; }
    const newUrls = files.slice(0, remaining).map(f => URL.createObjectURL(f));
    set('imagePreviewUrls', [...(form.imagePreviewUrls || []), ...newUrls]);
    set('images', [...(form.images || []), ...newUrls]);
  };

  const removeImage = (idx) => {
    const urls = [...(form.imagePreviewUrls || [])];
    const imgs = [...(form.images || [])];
    urls.splice(idx, 1);
    imgs.splice(idx, 1);
    setForm(f => ({ ...f, imagePreviewUrls: urls, images: imgs }));
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!form.price && !form.weightGrams) { toast.error('Price or weight is required'); return; }
    onSave({
      ...form,
      price: parseInt(form.price) || 0,
      mrp: parseInt(form.mrp) || parseInt(form.price) || 0,
      stockQty: parseInt(form.stockQty) || 0,
      weightGrams: form.pricingType === 'weight' ? parseFloat(form.weightGrams) || 0 : null,
      makingCharges: form.pricingType === 'weight' ? parseInt(form.makingCharges) || 0 : null,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg-surface rounded-[24px] shadow-2xl w-full max-w-[680px] max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border-main sticky top-0 bg-bg-surface z-10">
          <h3 className="font-serif text-[20px] text-text-main">{mode === 'add' ? 'Add New Product' : 'Edit Product'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F5F0F1] flex items-center justify-center text-text-muted hover:text-text-main"><X size={16} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-2">Product Images (up to 4)</label>
            <div className="flex gap-2 flex-wrap">
              {(form.imagePreviewUrls || []).map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-[10px] overflow-hidden border border-border-main group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ))}
              {(form.imagePreviewUrls || []).length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-[10px] border-2 border-dashed border-[#D4527A]/40 flex flex-col items-center justify-center gap-1 text-[#D4527A] hover:bg-pink-50 transition-colors"
                >
                  <Upload size={16} />
                  <span className="text-[9px] font-bold">Upload</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </div>
          </div>

          {/* Name & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-1.5">Product Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Floral CZ Ring" className="w-full h-[40px] px-3 border border-border-main rounded-[10px] font-sans text-[13px] outline-none focus:border-[#D4527A]" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-1.5">SKU</label>
              <input value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="SC-RNG-001" className="w-full h-[40px] px-3 border border-border-main rounded-[10px] font-sans text-[13px] outline-none focus:border-[#D4527A]" />
            </div>
          </div>

          {/* Category & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-1.5">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full h-[40px] px-3 border border-border-main rounded-[10px] font-sans text-[13px] outline-none focus:border-[#D4527A] bg-white appearance-none">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-1.5">Badge</label>
              <select value={form.badge || ''} onChange={e => set('badge', e.target.value || null)} className="w-full h-[40px] px-3 border border-border-main rounded-[10px] font-sans text-[13px] outline-none focus:border-[#D4527A] bg-white appearance-none">
                <option value="">None</option>
                <option value="New">New</option>
                <option value="Bestseller">Bestseller</option>
                <option value="Sale">Sale</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-1.5">Short Description</label>
            <input value={form.shortDescription || ''} onChange={e => set('shortDescription', e.target.value)} placeholder="Brief description for product card" className="w-full h-[40px] px-3 border border-border-main rounded-[10px] font-sans text-[13px] outline-none focus:border-[#D4527A]" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-1.5">Full Description</label>
            <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={3} placeholder="Detailed product description..." className="w-full px-3 py-2.5 border border-border-main rounded-[10px] font-sans text-[13px] outline-none focus:border-[#D4527A] resize-none" />
          </div>

          {/* Pricing Type */}

          {/* ── Settings Tab ── */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-2">Pricing Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => set('pricingType', 'mrp')}
                className={`flex-1 h-[40px] rounded-[10px] text-[12px] font-bold border-2 transition-all ${form.pricingType === 'mrp' ? 'border-[#137333] bg-[#E6F4EA] text-[#137333]' : 'border-border-main bg-white text-text-muted'}`}
              >Fixed MRP</button>
              <button
                type="button"
                onClick={() => set('pricingType', 'weight')}
                className={`flex-1 h-[40px] rounded-[10px] text-[12px] font-bold border-2 transition-all flex items-center justify-center gap-1.5 ${form.pricingType === 'weight' ? 'border-[#0369A1] bg-[#E0F2FE] text-[#0369A1]' : 'border-border-main bg-white text-text-muted'}`}
              >
                <Scale size={14} /> Weight-Based
              </button>
            </div>
          </div>

          {/* Weight fields */}
          {form.pricingType === 'weight' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-[#E0F2FE]/40 rounded-[12px] border border-[#BAE6FD]">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#0369A1] mb-1.5 flex items-center gap-1"><Scale size={11} /> Weight (grams)</label>
                <input type="number" step="0.1" min="0" value={form.weightGrams} onChange={e => set('weightGrams', e.target.value)} placeholder="e.g. 5.2" className="w-full h-[40px] px-3 border border-[#BAE6FD] rounded-[10px] font-sans text-[13px] outline-none focus:border-[#0369A1] bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[1px] text-[#0369A1] mb-1.5 flex items-center gap-1"><Wrench size={11} /> Making Charges (₹)</label>
                <input type="number" step="1" min="0" value={form.makingCharges} onChange={e => set('makingCharges', e.target.value)} placeholder="e.g. 350" className="w-full h-[40px] px-3 border border-[#BAE6FD] rounded-[10px] font-sans text-[13px] outline-none focus:border-[#0369A1] bg-white" />
              </div>
              <div className="col-span-2 text-[11px] text-[#0369A1] bg-white/70 rounded-[8px] px-3 py-2">
                Estimated price: <strong>₹{Math.round(102.4 * (parseFloat(form.weightGrams) || 0) + (parseInt(form.makingCharges) || 0))}</strong> + 3% GST
              </div>
            </div>
          )}

          {/* Price & MRP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-1.5">Selling Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" className="w-full h-[40px] px-3 border border-border-main rounded-[10px] font-sans text-[13px] outline-none focus:border-[#D4527A]" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-1.5">MRP (₹)</label>
              <input type="number" value={form.mrp} onChange={e => set('mrp', e.target.value)} placeholder="0" className="w-full h-[40px] px-3 border border-border-main rounded-[10px] font-sans text-[13px] outline-none focus:border-[#D4527A]" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-1.5">Stock Qty</label>
              <input type="number" value={form.stockQty} onChange={e => set('stockQty', e.target.value)} placeholder="0" className="w-full h-[40px] px-3 border border-border-main rounded-[10px] font-sans text-[13px] outline-none focus:border-[#D4527A]" />
            </div>
          </div>

          {/* Metal & Stone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-1.5">Metal</label>
              <select value={form.metal || '925 Sterling Silver'} onChange={e => set('metal', e.target.value)} className="w-full h-[40px] px-3 border border-border-main rounded-[10px] font-sans text-[13px] outline-none focus:border-[#D4527A] bg-white appearance-none">
                <option>925 Sterling Silver</option>
                <option>999 Pure Silver</option>
                <option>Silver with Gold Plating</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-1.5">Stone Type</label>
              <select value={form.stoneType || 'No Stone'} onChange={e => set('stoneType', e.target.value)} className="w-full h-[40px] px-3 border border-border-main rounded-[10px] font-sans text-[13px] outline-none focus:border-[#D4527A] bg-white appearance-none">
                {['No Stone','Cubic Zirconia','Pearl','Turquoise','Onyx','Moonstone','Amethyst'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 h-[44px] rounded-full border border-border-main text-text-muted font-bold text-[12px] uppercase tracking-[1px] hover:bg-[#FAFAFA] transition-colors">Cancel</button>
            <button onClick={handleSave} className="flex-1 h-[44px] rounded-full bg-[#1A1A1A] text-white font-bold text-[12px] uppercase tracking-[1px] hover:bg-[#D4527A] transition-colors">
              {mode === 'add' ? 'Add Product' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, iconBg, iconColor, trend, trendLabel }) {
  const isUp = trend >= 0;
  return (
    <div className="bg-bg-surface rounded-[16px] p-[24px] shadow-product flex items-start justify-between border-none">
      <div className="flex-1">
        <p className="font-sans text-[12px] text-text-muted mb-[6px] uppercase tracking-[0.6px]">{label}</p>
        <h3 className="font-sans text-[26px] font-bold text-text-main leading-tight">{value}</h3>
        {sub && <p className="font-sans text-[11px] text-text-muted mt-1">{sub}</p>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-[12px] font-semibold ${isUp ? 'text-[#137333]' : 'text-[#C5221F]'}`}>
            {isUp ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
            <span>{Math.abs(trend)}% {trendLabel || 'vs last week'}</span>
          </div>
        )}
      </div>
      <div className="w-[48px] h-[48px] rounded-[12px] flex items-center justify-center shrink-0" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
    </div>
  );
}

// ─── Notification Bell ───────────────────────────────────────────────────────
const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'order',
    icon: PackageCheck,
    iconBg: '#E0F2FE',
    iconColor: '#0369A1',
    title: 'New order received',
    message: 'SC-ORD-10010 · Meera Iyer — ₹3,713',
    time: '2 min ago',
    read: false,
  },
  {
    id: 2,
    type: 'order',
    icon: PackageCheck,
    iconBg: '#E6F4EA',
    iconColor: '#137333',
    title: 'Order delivered',
    message: 'SC-ORD-10004 · Ritu Agarwal marked as delivered',
    time: '18 min ago',
    read: false,
  },
  {
    id: 3,
    type: 'alert',
    icon: AlertTriangle,
    iconBg: '#FFF3E0',
    iconColor: '#E65100',
    title: 'Low stock alert',
    message: 'Plain Silver Band Ring — only 4 units left',
    time: '1 hr ago',
    read: false,
  },
  {
    id: 4,
    type: 'info',
    icon: Info,
    iconBg: '#F3E8FF',
    iconColor: '#7E22CE',
    title: 'New customer signed up',
    message: 'Sanya Kapoor joined Sterling Kart',
    time: '3 hr ago',
    read: true,
  },
  {
    id: 5,
    type: 'order',
    icon: PackageCheck,
    iconBg: '#FFF0F5',
    iconColor: '#D4527A',
    title: 'Payment received',
    message: 'SC-ORD-10009 · ₹2,546 via Net Banking',
    time: '5 hr ago',
    read: true,
  },
  {
    id: 6,
    type: 'alert',
    icon: AlertTriangle,
    iconBg: '#FCE8E6',
    iconColor: '#C5221F',
    title: 'Order cancelled',
    message: 'SC-ORD-10008 · Ishita Gupta cancelled her order',
    time: 'Yesterday',
    read: true,
  },
];

function NotificationBell({ notifications, onMarkAllRead, onMarkRead }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unread = notifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`relative w-9 h-9 rounded-[8px] flex items-center justify-center transition-all duration-200 border ${
          open
            ? 'bg-[#FFF0F5] border-[#F4A0B0] text-[#D4527A]'
            : 'bg-[#FAFAFA] border-border-main text-text-muted hover:bg-[#FFF0F5] hover:border-[#F4A0B0] hover:text-[#D4527A]'
        }`}
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D4527A] text-white text-[9px] font-bold flex items-center justify-center shadow-sm animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="fixed left-[16px] right-[16px] top-[72px] md:absolute md:left-auto md:right-0 md:top-[calc(100%+10px)] md:w-[360px] bg-bg-surface rounded-[18px] shadow-[0_8px_40px_rgba(0,0,0,0.14)] border border-border-main z-[300] overflow-hidden"
          style={{ animation: 'notifSlideDown 0.22s cubic-bezier(0.25,1,0.5,1)' }}
        >
          <style>{`@keyframes notifSlideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-main">
            <div>
              <h3 className="font-sans font-bold text-[15px] text-text-main">Notifications</h3>
              {unread > 0 && (
                <p className="font-sans text-[11px] text-text-muted mt-0.5">{unread} unread</p>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[#D4527A] hover:text-[#F4A0B0] transition-colors"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-[#F5F0F2]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={28} className="mx-auto text-text-muted mb-3 opacity-40" />
                <p className="font-sans text-[13px] text-text-muted">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const Icon = n.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => onMarkRead(n.id)}
                    className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors ${
                      n.read ? 'hover:bg-[#FAFAFA]' : 'bg-[#FFF8FA] hover:bg-[#FFF0F5]'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: n.iconBg }}
                    >
                      <Icon size={16} style={{ color: n.iconColor }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-sans text-[13px] leading-snug ${
                        n.read ? 'text-text-muted font-normal' : 'text-text-main font-semibold'
                      }`}>{n.title}</p>
                      <p className="font-sans text-[11px] text-text-muted mt-0.5 leading-snug truncate">{n.message}</p>
                      <p className="font-sans text-[10px] text-[#C0C0C0] mt-1">{n.time}</p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-[#D4527A] shrink-0 mt-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border-main bg-[#FAFAFA]">
            <button
              onClick={() => setOpen(false)}
              className="w-full text-center font-sans text-[12px] font-semibold text-[#D4527A] hover:text-[#F4A0B0] transition-colors"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Custom Tooltip for charts ─────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-surface rounded-[12px] border border-border-main shadow-lg p-3 font-sans text-[13px]">
      <p className="text-text-muted text-[11px] mb-1">{label}</p>
      <p className="font-bold text-text-main">{currency ? formatPrice(payload[0].value) : payload[0].value}</p>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { user, isAdmin, openAuthModal } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productSort, setProductSort] = useState('newest');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('sterling_orders');
    return saved ? JSON.parse(saved) : mockOrders;
  });

  useEffect(() => {
    localStorage.setItem('sterling_orders', JSON.stringify(orders));
  }, [orders]);

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [expandedOrders, setExpandedOrders] = useState({});
  const [expandedProducts, setExpandedProducts] = useState({});
  const toggleOrderExpand = (id) => setExpandedOrders(prev => ({...prev, [id]: !prev[id]}));
  const toggleProductExpand = (id) => setExpandedProducts(prev => ({...prev, [id]: !prev[id]}));

  const handleMarkAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
  const handleMarkRead = (id) => setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x));

  // ── Redirect ────────────────────────────────────────────────────────────────
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="bg-bg-surface p-8 rounded-2xl shadow-sm text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-400 flex items-center justify-center mx-auto mb-4">
            <X size={28} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-text-main">Access Denied</h2>
          <p className="mb-6 text-text-muted text-sm">You do not have permission to view this page.</p>
          <button onClick={() => { navigate('/'); openAuthModal(); }} className="btn-primary">Login as Admin</button>
        </div>
      </div>
    );
  }

  // ── Derived analytics data ───────────────────────────────────────────────────
  const totalRevenue = orders.reduce((s, o) => s + (o.status !== 'Cancelled' ? o.total : 0), 0);
  const revenueToday = 24890;
  const pendingOrders = orders.filter(o => ['Pending', 'Confirmed', 'Packed'].includes(o.status)).length;

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const catRevenueMap = {};
  orders.forEach(o => {
    if (o.status === 'Cancelled') return;
    o.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const cat = prod ? prod.category : 'other';
      catRevenueMap[cat] = (catRevenueMap[cat] || 0) + item.price * item.qty;
    });
  });
  const catBarData = Object.entries(catRevenueMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, revenue]) => ({ name: name.replace('-', ' '), revenue }));

  const topProducts = [...products]
    .filter(p => p.reviewCount > 0)
    .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    .slice(0, 5);

  // ── Filtered data ─────────────────────────────────────────────────────────
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(productSearch.toLowerCase());
    const matchCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    return matchSearch && matchCategory;
  }).sort((a, b) => {
    if (productSort === 'newest') return 0;
    
    const getPrice = (p) => {
      const val = p.price;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') return parseFloat(val.replace(/,/g, '')) || 0;
      return 0;
    };
    
    if (productSort === 'price-low-high') return getPrice(a) - getPrice(b);
    if (productSort === 'price-high-low') return getPrice(b) - getPrice(a);
    if (productSort === 'stock-low-high') return (a.stockQty || 0) - (b.stockQty || 0);
    
    return 0;
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.success(`Order ${orderId} → ${newStatus}`);
    
    if (newStatus === 'Delivered') {
      try {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        
        toast.loading('Generating invoice...', { id: 'invoice' });
        const pdfBase64 = generateInvoice(order, null, { mode: 'datauri' });
        
        await axios.post(
          `http://localhost:5000/api/orders/${order.orderId || order.id}/email-invoice`,
          { pdfBase64 },
          { withCredentials: true }
        );
        toast.success('Invoice emailed to customer.', { id: 'invoice' });
      } catch (err) {
        console.error('Invoice email error:', err);
        toast.error('Failed to email invoice.', { id: 'invoice' });
      }
    }
  };

  const handleApproveCustomOrder = async (orderId) => {
    try {
      const { data } = await axios.post(`http://localhost:5000/api/custom-orders/${orderId}/approve`, {}, { withCredentials: true });
      if (data.success) {
        setOrders(orders.map(o => o.id === orderId || o.orderId === orderId ? { ...o, status: 'Engraving' } : o));
        toast.success(`Design approved! Order moved to Engraving.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve order');
    }
  };

  const handleOpenRejectModal = (orderId) => {
    setRejectOrderId(orderId);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectCustomOrder = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }

    try {
      const { data } = await axios.post(`http://localhost:5000/api/custom-orders/${rejectOrderId}/reject`, { reason: rejectReason }, { withCredentials: true });
      if (data.success) {
        if (data.refunded) {
          toast.success(`Razorpay Refund Processed for ${rejectOrderId}`, { icon: '💸' });
          setOrders(orders.map(o => (o.id === rejectOrderId || o.orderId === rejectOrderId) ? { ...o, status: 'Cancelled', rejectionReason: rejectReason } : o));
        } else {
          setOrders(orders.map(o => {
            if (o.id !== rejectOrderId && o.orderId !== rejectOrderId) return o;
            return { ...o, status: 'Rejected', rejectionReason: rejectReason, resubmitToken: data.token };
          }));
          toast.success(`Design rejected. Resubmit Link Generated!`);
          console.log(`[WHATSAPP MOCK] Send to customer: ${data.resubmitUrl}`);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject order');
    } finally {
      setRejectModalOpen(false);
    }
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Delete this product?')) {
      deleteProduct(productId);
      toast.success('Product deleted');
    }
  };

  const handleSaveProduct = (updated) => {
    updateProduct(updated);
    setEditingProduct(null);
    toast.success('Product updated successfully');
  };

  const handleAddProduct = (newProduct) => {
    addProduct(newProduct);
    setIsAddingProduct(false);
    toast.success(`"${newProduct.name}" added to store!`);
  };

  const getStatusBadgeStyle = (status) => {
    const c = STATUS_COLORS[status] || STATUS_COLORS['Pending'];
    return { background: c.bg, color: c.text };
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={20} />, badge: pendingOrders || null },
    { id: 'custom-orders', label: 'Custom Orders', icon: <Palette size={20} /> },
    { id: 'products', label: 'Products', icon: <Package size={20} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER SECTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div className="space-y-[24px]">
      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[20px]">
        <KpiCard label="Total Revenue" value={formatPrice(totalRevenue)} sub={`${orders.filter(o=>o.status!=='Cancelled').length} orders`} icon={<TrendingUp size={22}/>} iconBg="#FFF0F5" iconColor="#D4527A" trend={12.4} trendLabel="vs last month"/>
        <KpiCard label="Revenue Today" value={formatPrice(revenueToday)} sub="Live estimate" icon={<TrendingUp size={22}/>} iconBg="#FFF0F5" iconColor="#D4527A" trend={8.1}/>
        <KpiCard label="Pending Orders" value={pendingOrders} sub="Need attention" icon={<Clock size={22}/>} iconBg="#FFF3E0" iconColor="#E65100" trend={-5} trendLabel="vs last week"/>
        <KpiCard label="Total Products" value={products.length} sub={`${products.filter(p=>p.badge==='New'||p.isNew).length} new arrivals`} icon={<Package size={22}/>} iconBg="#F3E8FF" iconColor="#7E22CE" trend={3.2}/>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[24px]">
        {/* Revenue chart */}
        <div className="xl:col-span-2 bg-bg-surface rounded-[16px] p-[24px] shadow-product">
          <div className="flex items-center justify-between mb-[20px]">
            <h3 className="font-serif text-[18px] font-bold text-text-main">Revenue — Last 30 Days</h3>
            <span className="font-sans text-[12px] text-text-muted">₹ INR</span>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F4A0B0" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#F4A0B0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0"/>
                <XAxis dataKey="date" tick={{fontSize:11,fill:'#A8A8A8',fontFamily:'Inter'}} axisLine={false} tickLine={false} interval={4}/>
                <YAxis tickFormatter={v=>`₹${v/1000}k`} tick={{fontSize:11,fill:'#A8A8A8',fontFamily:'Inter'}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip currency/>}/>
                <Line type="monotone" dataKey="revenue" stroke="#F4A0B0" strokeWidth={2.5} dot={false} activeDot={{r:5,fill:'#D4527A'}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-bg-surface rounded-[16px] p-[24px] shadow-product">
          <div className="flex justify-between items-center mb-[20px]">
            <h3 className="font-serif text-[18px] font-bold text-text-main">Recent Orders</h3>
            <button onClick={() => setActiveTab('orders')} className="font-sans text-[12px] font-semibold text-[#D4527A] hover:text-[#F4A0B0] transition-colors flex items-center gap-1">View all <ChevronRight size={14}/></button>
          </div>
          <div className="space-y-[10px]">
            {orders.slice(0, 6).map(order => (
              <div key={order.id} className="flex justify-between items-center p-[10px] hover:bg-[#FAFAFA] rounded-[10px] transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                <div>
                  <p className="font-sans font-semibold text-[13px] text-text-main">{order.id}</p>
                  <p className="font-sans text-[11px] text-text-muted mt-[1px]">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex font-sans text-[10px] font-bold uppercase tracking-[0.5px] px-[6px] py-[3px] rounded-[5px]" style={getStatusBadgeStyle(order.status)}>{order.status}</span>
                  <p className="font-sans text-[12px] font-bold text-text-main mt-[3px]">{formatPrice(order.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second row: pie + top products */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[24px]">
        {/* Status Pie */}
        <div className="bg-bg-surface rounded-[16px] p-[24px] shadow-product">
          <h3 className="font-serif text-[18px] font-bold text-text-main mb-[20px]">Orders by Status</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-[200px] w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 flex-1">
              {pieData.map((entry, i) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background: PIE_COLORS[i % PIE_COLORS.length]}}/>
                    <span className="font-sans text-[12px] text-text-main">{entry.name}</span>
                  </div>
                  <span className="font-sans text-[12px] font-bold text-text-main">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top products */}
        <div className="bg-bg-surface rounded-[16px] p-[24px] shadow-product">
          <h3 className="font-serif text-[18px] font-bold text-text-main mb-[20px]">Top Products</h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="font-sans text-[13px] font-bold text-text-muted w-5 shrink-0">#{i+1}</span>
                <div className="w-9 h-9 rounded-[8px] bg-[#FAFAFA] border border-border-main overflow-hidden shrink-0">
                  <img src={p.images[0]} alt="" className="w-full h-full object-cover"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-medium text-[13px] text-text-main truncate">{p.name}</p>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="fill-[#D9909F] text-[#D9909F]"/>
                    <span className="font-sans text-[11px] text-text-muted">{p.rating} ({p.reviewCount})</span>
                  </div>
                </div>
                <span className="font-sans text-[13px] font-bold text-text-main shrink-0">{formatPrice(p.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="bg-bg-surface rounded-[16px] shadow-product overflow-hidden">
      <div className="p-[24px] flex flex-col md:flex-row justify-between gap-[16px] items-start md:items-center border-b border-border-main">
        <div>
          <h3 className="font-serif text-[18px] font-bold text-text-main">Manage Orders</h3>
          <p className="font-sans text-[12px] text-text-muted mt-0.5">{filteredOrders.length} orders</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-[220px]">
            <Search size={15} className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[#A8A8A8]"/>
            <input type="text" placeholder="Search orders..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)} className="w-full pl-[34px] pr-[12px] h-[38px] border border-border-main rounded-[8px] font-sans text-[13px] outline-none focus:border-[#1A1A1A]"/>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full md:flex md:w-auto">
            <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)} className="w-full h-[38px] px-3 border border-border-main rounded-[8px] font-sans text-[13px] outline-none focus:border-[#1A1A1A] bg-white appearance-none cursor-pointer">
              <option>All</option>
              {Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => toast.success('Exporting CSV...')} className="btn-secondary w-full justify-center h-[38px] px-[14px] flex items-center gap-[6px] font-sans text-[13px] whitespace-nowrap"><Download size={15}/> Export</button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-pink-50">
              <th className="px-[12px] md:px-[20px] py-[10px] md:py-[14px] font-sans text-[10px] md:text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Order ID</th>
              <th className="hidden md:table-cell px-[20px] py-[14px] font-sans text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Date</th>
              <th className="hidden md:table-cell px-[20px] py-[14px] font-sans text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Customer</th>
              <th className="px-[12px] md:px-[20px] py-[10px] md:py-[14px] font-sans text-[10px] md:text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Total</th>
              <th className="hidden md:table-cell px-[20px] py-[14px] font-sans text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Payment</th>
              <th className="px-[12px] md:px-[20px] py-[10px] md:py-[14px] font-sans text-[10px] md:text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Status</th>
              <th className="px-[12px] md:px-[20px] py-[10px] md:py-[14px] font-sans text-[10px] md:text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {filteredOrders.map(order => (
              <React.Fragment key={order.id}>
                <tr className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-[12px] md:px-[20px] py-[10px] md:py-[14px]">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleOrderExpand(order.id)} className="md:hidden p-1 text-text-muted hover:text-[#D4527A]">
                        {expandedOrders[order.id] ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                      </button>
                      <div>
                        <p className="font-sans font-semibold text-[12px] md:text-[13px] text-text-main">{order.id}</p>
                        <p className="md:hidden font-sans text-[10px] text-text-muted mt-0.5">{order.customerName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-[20px] py-[14px] font-sans text-[13px] text-text-muted">{order.date}</td>
                  <td className="hidden md:table-cell px-[20px] py-[14px]">
                    <p className="font-sans text-[13px] text-text-main font-medium">{order.customerName}</p>
                    <p className="font-sans text-[11px] text-text-muted">{order.customerPhone}</p>
                  </td>
                  <td className="px-[12px] md:px-[20px] py-[10px] md:py-[14px] font-sans font-bold text-[12px] md:text-[13px] text-text-main">{formatPrice(order.total)}</td>
                  <td className="hidden md:table-cell px-[20px] py-[14px] font-sans text-[13px] text-text-muted">{order.paymentMethod}</td>
                  <td className="px-[12px] md:px-[20px] py-[10px] md:py-[14px]">
                    <select
                      value={order.status}
                      onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="font-sans text-[10px] md:text-[11px] font-bold uppercase tracking-[0.5px] px-[6px] md:px-[8px] py-[4px] rounded-[6px] outline-none cursor-pointer appearance-none border-0"
                      style={getStatusBadgeStyle(order.status)}
                    >
                      {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s} className="bg-white text-[#1A1A1A]">{s}</option>)}
                    </select>
                  </td>
                  <td className="px-[12px] md:px-[20px] py-[10px] md:py-[14px] text-right">
                    <button onClick={() => setSelectedOrder(order)} className="text-[#A8A8A8] hover:text-[#D4527A] transition-colors p-[4px] ml-1">
                      <Eye size={17}/>
                    </button>
                  </td>
                </tr>
                {expandedOrders[order.id] && (
                  <tr className="md:hidden bg-[#FAFAFA]">
                    <td colSpan="4" className="px-[12px] py-[10px]">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <p className="font-bold text-text-muted uppercase tracking-[0.5px]">Date</p>
                          <p className="text-text-main">{order.date}</p>
                        </div>
                        <div>
                          <p className="font-bold text-text-muted uppercase tracking-[0.5px]">Payment</p>
                          <p className="text-text-main">{order.paymentMethod}</p>
                        </div>
                        <div className="col-span-2 mt-1 border-t border-border-main pt-2">
                          <p className="font-bold text-text-muted uppercase tracking-[0.5px]">Customer Details</p>
                          <p className="text-text-main mt-0.5">{order.customerName}</p>
                          <p className="text-text-muted">{order.customerPhone} · {order.customerEmail}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="py-16 text-center text-text-muted font-sans text-[14px]">No orders found</div>
        )}
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="bg-bg-surface rounded-[16px] shadow-product overflow-hidden">
      <div className="p-[24px] flex flex-col md:flex-row justify-between gap-[16px] items-start md:items-center border-b border-border-main">
        <div>
          <h3 className="font-serif text-[18px] font-bold text-text-main">Manage Products</h3>
          <p className="font-sans text-[12px] text-text-muted mt-0.5">{filteredProducts.length} products</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-[220px]">
            <Search size={15} className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[#A8A8A8]"/>
            <input type="text" placeholder="Search products..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="w-full pl-[34px] pr-[12px] h-[38px] border border-border-main rounded-[8px] font-sans text-[13px] outline-none focus:border-[#1A1A1A]"/>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full md:flex md:w-auto">
            <select
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value)}
              className="w-full h-[38px] px-[12px] border border-border-main rounded-[8px] font-sans text-[13px] outline-none focus:border-[#1A1A1A] bg-white text-text-main"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={productSort}
              onChange={(e) => setProductSort(e.target.value)}
              className="w-full h-[38px] px-[12px] border border-border-main rounded-[8px] font-sans text-[13px] outline-none focus:border-[#1A1A1A] bg-white text-text-main"
            >
              <option value="newest">Newest First</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="stock-low-high">Stock: Low to High</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full md:flex md:w-auto">
            <button onClick={() => setIsBulkUploadOpen(true)} className="btn-secondary w-full justify-center h-[38px] px-[16px] flex items-center gap-[6px] font-sans text-[13px] whitespace-nowrap">Bulk Upload</button>
            <button onClick={() => setIsAddingProduct(true)} className="btn-primary w-full justify-center h-[38px] px-[16px] flex items-center gap-[6px] font-sans text-[13px] whitespace-nowrap"><Plus size={15}/> Add Product</button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-pink-50">
              <th className="px-[12px] md:px-[16px] py-[10px] md:py-[13px] font-sans text-[10px] md:text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Product</th>
              <th className="hidden md:table-cell px-[16px] py-[13px] font-sans text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">SKU</th>
              <th className="hidden md:table-cell px-[16px] py-[13px] font-sans text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Category</th>
              <th className="hidden md:table-cell px-[16px] py-[13px] font-sans text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Pricing</th>
              <th className="px-[12px] md:px-[16px] py-[10px] md:py-[13px] font-sans text-[10px] md:text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Price</th>
              <th className="px-[12px] md:px-[16px] py-[10px] md:py-[13px] font-sans text-[10px] md:text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Stock</th>
              <th className="px-[12px] md:px-[16px] py-[10px] md:py-[13px] font-sans text-[10px] md:text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {filteredProducts.map(product => (
              <React.Fragment key={product.id}>
                <tr className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-[12px] md:px-[16px] py-[10px] md:py-[13px]">
                    <div className="flex items-center gap-[6px] md:gap-[10px]">
                      <button onClick={() => toggleProductExpand(product.id)} className="md:hidden p-1 text-text-muted hover:text-[#D4527A] shrink-0">
                        {expandedProducts[product.id] ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                      </button>
                      <div className="w-[30px] h-[30px] md:w-[38px] md:h-[38px] rounded-[8px] bg-[#FAFAFA] overflow-hidden border border-border-main shrink-0">
                        {product.images?.[0]
                          ? <img src={product.images[0]} alt="" className="w-full h-full object-cover"/>
                          : <div className="w-full h-full flex items-center justify-center text-text-muted"><ImageIcon size={14}/></div>
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="font-sans font-medium text-[12px] md:text-[13px] text-text-main max-w-[100px] md:max-w-[140px] truncate">{product.name}</p>
                        <div className="md:hidden flex items-center gap-1 mt-0.5">
                          {product.badge && <StatusBadge status={product.badge} size="sm"/>}
                        </div>
                        <div className="hidden md:block mt-0.5">
                          {product.badge && <StatusBadge status={product.badge}/>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-[16px] py-[13px] font-sans text-[11px] text-text-muted">{product.sku}</td>
                  <td className="hidden md:table-cell px-[16px] py-[13px] font-sans text-[13px] text-text-main capitalize">{product.category?.replace('-',' ')}</td>
                  <td className="hidden md:table-cell px-[16px] py-[13px]">
                    {product.pricingType === 'weight'
                      ? <span className="inline-flex items-center gap-1 text-[11px] font-bold px-[7px] py-[3px] rounded-[5px] bg-[#E0F2FE] text-[#0369A1]"><Scale size={10}/> Weight</span>
                      : <span className="text-[11px] font-bold px-[7px] py-[3px] rounded-[5px] bg-[#E6F4EA] text-[#137333]">MRP</span>
                    }
                  </td>
                  <td className="px-[12px] md:px-[16px] py-[10px] md:py-[13px]">
                    <p className="font-sans font-bold text-[12px] md:text-[13px] text-text-main">{formatPrice(product.price)}</p>
                    {product.mrp > product.price && <p className="font-sans text-[10px] md:text-[11px] text-text-muted line-through">{formatPrice(product.mrp)}</p>}
                  </td>
                  <td className="px-[12px] md:px-[16px] py-[10px] md:py-[13px]">
                    <span className={`font-sans text-[10px] md:text-[11px] font-bold px-[6px] md:px-[7px] py-[3px] rounded-[5px] ${product.stockQty > 10 ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#FCE8E6] text-[#C5221F]'}`}>
                      {product.stockQty} <span className="hidden md:inline">in stock</span>
                    </span>
                  </td>
                  <td className="px-[12px] md:px-[16px] py-[10px] md:py-[13px] text-right">
                    <button onClick={() => setEditingProduct({...product, imagePreviewUrls: product.images || []})} className="text-[#A8A8A8] hover:text-[#0369A1] transition-colors p-[4px]"><Edit size={14} className="md:w-[15px] md:h-[15px]"/></button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="text-[#A8A8A8] hover:text-[#C5221F] transition-colors p-[4px] ml-[2px] md:ml-[6px]"><Trash2 size={14} className="md:w-[15px] md:h-[15px]"/></button>
                  </td>
                </tr>
                {expandedProducts[product.id] && (
                  <tr className="md:hidden bg-[#FAFAFA]">
                    <td colSpan="4" className="px-[12px] py-[10px]">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <p className="font-bold text-text-muted uppercase tracking-[0.5px]">SKU</p>
                          <p className="text-text-main">{product.sku || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="font-bold text-text-muted uppercase tracking-[0.5px]">Category</p>
                          <p className="text-text-main capitalize">{product.category?.replace('-',' ')}</p>
                        </div>
                        <div className="col-span-2 mt-1 border-t border-border-main pt-2">
                          <p className="font-bold text-text-muted uppercase tracking-[0.5px]">Pricing Details</p>
                          <p className="text-text-main mt-0.5">
                            {product.pricingType === 'weight' ? 'Weight-based' : 'Fixed MRP'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="bg-bg-surface rounded-[16px] shadow-product overflow-hidden">
      <div className="p-[24px] border-b border-border-main">
        <h3 className="font-serif text-[18px] font-bold text-text-main">Customers</h3>
        <p className="font-sans text-[12px] text-text-muted mt-0.5">{mockCustomers.length} registered customers</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-pink-50">
              <th className="px-[20px] py-[14px] font-sans text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Customer</th>
              <th className="px-[20px] py-[14px] font-sans text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Phone</th>
              <th className="px-[20px] py-[14px] font-sans text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Orders</th>
              <th className="px-[20px] py-[14px] font-sans text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Total Spend</th>
              <th className="px-[20px] py-[14px] font-sans text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Joined</th>
              <th className="px-[20px] py-[14px] font-sans text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {mockCustomers.map(c => (
              <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-[20px] py-[14px]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-200 to-pink-300 text-[#D4527A] flex items-center justify-center font-bold text-[13px] shrink-0">
                      {c.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-sans font-semibold text-[13px] text-text-main">{c.name}</p>
                      <p className="font-sans text-[11px] text-text-muted">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-[20px] py-[14px] font-sans text-[13px] text-text-muted">{c.phone}</td>
                <td className="px-[20px] py-[14px] font-sans font-bold text-[13px] text-text-main">{c.totalOrders}</td>
                <td className="px-[20px] py-[14px] font-sans font-bold text-[13px] text-[#D4527A]">{formatPrice(c.totalSpend)}</td>
                <td className="px-[20px] py-[14px] font-sans text-[13px] text-text-muted">{new Date(c.joinedDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td>
                <td className="px-[20px] py-[14px]">
                  <span className={`font-sans text-[11px] font-bold px-[8px] py-[4px] rounded-[6px] ${c.totalSpend > 5000 ? 'bg-[#F3E8FF] text-[#7E22CE]' : 'bg-[#E6F4EA] text-[#137333]'}`}>
                    {c.totalSpend > 5000 ? 'VIP' : 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KpiCard label="Total Revenue" value={formatPrice(totalRevenue)} sub="All time" icon={<TrendingUp size={22}/>} iconBg="#FFF0F5" iconColor="#D4527A" trend={12.4}/>
        <KpiCard label="Avg Order Value" value={formatPrice(Math.round(totalRevenue / orders.filter(o=>o.status!=='Cancelled').length))} icon={<ShoppingBag size={22}/>} iconBg="#E0F2FE" iconColor="#0369A1" trend={4.2}/>
        <KpiCard label="Total Customers" value={mockCustomers.length} sub={`${mockCustomers.filter(c=>c.totalSpend>5000).length} VIPs`} icon={<Users size={22}/>} iconBg="#E6F4EA" iconColor="#137333" trend={18.7}/>
      </div>

      {/* Revenue + category charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-bg-surface rounded-[16px] p-6 shadow-product">
          <h3 className="font-serif text-[18px] font-bold text-text-main mb-5">Revenue Over Time</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0"/>
                <XAxis dataKey="date" tick={{fontSize:10,fill:'#A8A8A8'}} axisLine={false} tickLine={false} interval={5}/>
                <YAxis tickFormatter={v=>`₹${v/1000}k`} tick={{fontSize:10,fill:'#A8A8A8'}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip currency/>}/>
                <Line type="monotone" dataKey="revenue" stroke="#D4527A" strokeWidth={2} dot={false} activeDot={{r:4}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-bg-surface rounded-[16px] p-6 shadow-product">
          <h3 className="font-serif text-[18px] font-bold text-text-main mb-5">Revenue by Category</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catBarData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0"/>
                <XAxis dataKey="name" tick={{fontSize:10,fill:'#A8A8A8'}} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={v=>`₹${v/1000}k`} tick={{fontSize:10,fill:'#A8A8A8'}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip currency/>}/>
                <Bar dataKey="revenue" fill="#F4A0B0" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pie + Top customers */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-bg-surface rounded-[16px] p-6 shadow-product">
          <h3 className="font-serif text-[18px] font-bold text-text-main mb-5">Orders by Status</h3>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="h-[200px] w-[180px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5 flex-1">
              {pieData.map((entry, i) => (
                <div key={entry.name} className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{background: PIE_COLORS[i % PIE_COLORS.length]}}/>
                    <span className="text-text-main">{entry.name}</span>
                  </div>
                  <span className="font-bold text-text-main">{entry.value} orders</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-bg-surface rounded-[16px] p-6 shadow-product">
          <h3 className="font-serif text-[18px] font-bold text-text-main mb-5">Top Customers by Spend</h3>
          <div className="space-y-3">
            {[...mockCustomers].sort((a,b) => b.totalSpend - a.totalSpend).slice(0,5).map((c,i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="font-bold text-[12px] text-text-muted w-4">{i+1}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center font-bold text-[11px] text-[#D4527A] shrink-0">
                  {c.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-medium text-[13px] text-text-main truncate">{c.name}</p>
                  <p className="font-sans text-[11px] text-text-muted">{c.totalOrders} orders</p>
                </div>
                <span className="font-sans font-bold text-[13px] text-[#D4527A] shrink-0">{formatPrice(c.totalSpend)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomOrders = () => (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-text-main mb-1">Custom Coin Orders</h2>
        <p className="text-sm text-text-muted">Review and manage personalized engraving orders.</p>
      </div>
      
      <div className="bg-bg-surface rounded-xl shadow-sm border border-border-main overflow-hidden">
        <div className="p-5 border-b border-border-main flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-text-main">Custom Orders Pipeline</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA] text-text-muted text-[11px] uppercase tracking-wider border-b border-border-main">
                <th className="p-4 font-semibold w-[180px]">Order ID & Date</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Design File</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-text-main">
              {orders.filter(o => o.isCustomCoin).length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No custom coin orders found.</td></tr>
              ) : (
                orders.filter(o => o.isCustomCoin).sort((a,b) => new Date(b.date) - new Date(a.date)).map(order => {
                  const customItem = order.items.find(i => i.category === 'coins');
                  const designName = customItem?.engravingText?.replace('Custom Design: ', '') || 'Unknown File';
                  
                  return (
                    <tr key={order.id} className="border-b border-border-main hover:bg-[#FAFAFA] transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-text-main cursor-pointer hover:text-[#D4527A]" onClick={() => setSelectedOrder(order)}>
                          {order.id}
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">{order.date}</div>
                        {order.resubmitCount > 0 && <span className="inline-block mt-1 text-[10px] bg-orange-100 text-orange-700 px-2 rounded-full font-bold">Resubmitted</span>}
                      </td>
                      <td className="p-4">
                        <div>{order.customerName}</div>
                        <div className="text-xs text-text-muted">{order.customerPhone}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                            <ImageIcon size={14} className="text-gray-400" />
                          </div>
                          <span className="text-xs font-mono bg-gray-50 px-2 py-1 border border-gray-200 rounded truncate max-w-[120px]" title={designName}>
                            {designName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="p-4 text-right">
                        {order.status === 'Pending Approval' ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleOpenRejectModal(order.id)} className="px-3 py-1.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors border border-red-200">
                              Reject
                            </button>
                            <button onClick={() => handleApproveCustomOrder(order.id)} className="px-3 py-1.5 text-[11px] font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors border border-green-200">
                              Approve
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setSelectedOrder(order)} className="text-[12px] font-bold text-[#D4527A] hover:underline">
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="bg-bg-surface rounded-[16px] p-6 shadow-product max-w-2xl space-y-6">
      <h3 className="font-serif text-[20px] font-bold text-text-main">Store Settings</h3>
      <div className="space-y-4">
        {[
          { label: 'Store Name', value: 'Sterling Kart' },
          { label: 'Support Email', value: 'hello@sterlingcart.com' },
          { label: 'Support Phone', value: '+91 99999 00000' },
          { label: 'GST Number', value: '27AABCS1429B1ZB' },
        ].map(({ label, value }) => (
          <div key={label}>
            <label className="block text-[11px] font-bold uppercase tracking-[1px] text-text-muted mb-1.5">{label}</label>
            <input type="text" defaultValue={value} className="w-full h-[42px] px-3 border border-border-main rounded-[10px] font-sans text-[13px] outline-none focus:border-[#D4527A] bg-[#FAFAFA]"/>
          </div>
        ))}
        <button className="btn-primary mt-2" onClick={() => toast.success('Settings saved!')}>Save Changes</button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // LAYOUT
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#F8F8FA] overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex w-[260px] bg-[#1C1C2E] text-white flex-shrink-0 flex-col h-full z-20">
        <div className="p-[22px] pb-[16px]">
          <Link to="/" className="inline-flex items-center gap-[8px]">
            <span className="font-serif text-[22px] font-bold text-white tracking-[0.5px]">Sterling</span>
            <span className="font-sans text-[12px] font-bold text-[#1C1C2E] bg-[#F4A0B0] px-[7px] py-[2px] rounded-[4px] tracking-[1px] uppercase">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-[12px] space-y-[2px] overflow-y-auto">
          {sidebarLinks.map(link => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`w-full flex items-center gap-[10px] px-[14px] py-[11px] rounded-[10px] transition-all duration-200 font-sans text-[13.5px] font-medium ${
                activeTab === link.id
                  ? 'bg-[#2D2D44] text-[#FFF0F5] border-l-[3px] border-[#F4A0B0]'
                  : 'text-[#A8A8A8] hover:bg-[#2D2D44]/50 hover:text-[#FFF0F5] border-l-[3px] border-transparent'
              }`}
            >
              {link.icon}
              <span className="flex-1 text-left">{link.label}</span>
              {link.badge && (
                <span className="w-5 h-5 rounded-full bg-[#D4527A] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {link.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-[12px] m-[12px] bg-[#2D2D44] rounded-[14px] flex items-center gap-[10px] border border-white/5 mt-auto">
          <div className="w-[36px] h-[36px] rounded-full bg-[#F4A0B0] text-[#1C1C2E] flex items-center justify-center font-bold text-[13px] shrink-0">AD</div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[13px] font-semibold text-white truncate">Admin User</p>
            <p className="font-sans text-[11px] text-[#A8A8A8] truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-bg-surface h-[68px] border-b border-border-main flex items-center justify-between px-[16px] md:px-[28px] flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <h1 className="font-serif text-[22px] font-bold text-text-main capitalize">{activeTab.replace('-', ' ')}</h1>
          <div className="flex items-center gap-[10px]">
            <button
              onClick={() => setActiveTab('settings')}
              className="md:hidden relative w-9 h-9 rounded-[8px] flex items-center justify-center transition-all duration-200 border bg-[#FAFAFA] border-border-main text-text-muted hover:bg-[#FFF0F5] hover:border-[#F4A0B0] hover:text-[#D4527A]"
              aria-label="Settings"
            >
              <Settings size={16} />
            </button>
            <NotificationBell
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onMarkRead={handleMarkRead}
            />
            <Link to="/" className="font-sans text-[13px] font-medium text-text-main hover:text-[#D4527A] transition-colors bg-[#FAFAFA] px-[14px] py-[7px] rounded-[8px] border border-border-main flex items-center gap-1.5">
              <ArrowUpRight size={14}/> View Store
            </Link>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-[16px] md:p-[28px] pb-[80px] md:pb-[28px]">
          {activeTab === 'dashboard'  && renderDashboard()}
          {activeTab === 'orders'     && renderOrders()}
          {activeTab === 'custom-orders' && renderCustomOrders()}
          {activeTab === 'products'   && renderProducts()}
          {activeTab === 'customers'  && renderCustomers()}
          {activeTab === 'analytics'  && renderAnalytics()}
          {activeTab === 'settings'   && renderSettings()}
        </main>
        
        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-surface/95 backdrop-blur-md border-t border-border-main z-50 flex items-center justify-around px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          {sidebarLinks.slice(0, 5).map(link => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                activeTab === link.id ? 'text-[#D4527A]' : 'text-text-muted hover:text-[#D4527A]'
              }`}
            >
              <div className="relative">
                {link.icon}
                {link.badge && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#D4527A] text-white text-[9px] font-bold flex items-center justify-center border border-bg-surface">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.5px]">{link.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Order Detail Panel */}
      {selectedOrder && (
        <OrderDetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)}/>
      )}

      {/* Add Product Modal */}
      {isAddingProduct && (
        <ProductModal
          product={EMPTY_PRODUCT}
          mode="add"
          onSave={handleAddProduct}
          onClose={() => setIsAddingProduct(false)}
        />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <ProductModal
          product={editingProduct}
          mode="edit"
          onSave={handleSaveProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {/* Bulk Upload Modal */}
      {isBulkUploadOpen && (
        <BulkUploadModal onClose={() => setIsBulkUploadOpen(false)} />
      )}
    </div>
  );
}

// ─── Bulk Upload Modal ────────────────────────────────────────────────────────
function BulkUploadModal({ onClose }) {
  const { addMultipleProducts } = useProducts();
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const TEMPLATE_HEADERS = ['name', 'category', 'price', 'originalPrice', 'stockQty', 'description', 'shortDescription', 'metal'];

  const handleDownloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Product_Upload_Template.xlsx");
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const XLSX = await import('xlsx');

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const dataWithImages = data.map(row => ({
        ...row,
        images: [],
        price: Number(row.price) || 0,
        originalPrice: Number(row.originalPrice) || 0,
        stockQty: Number(row.stockQty) || 0,
      }));
      setParsedData(dataWithImages);
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleImageUpload = (rowIndex, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setParsedData(prev => prev.map((row, i) => 
      i === rowIndex ? { ...row, images: [...(row.images || []), ...newImageUrls] } : row
    ));
  };

  const removeImage = (rowIndex, imgIndex) => {
    setParsedData(prev => prev.map((row, i) => 
      i === rowIndex ? { ...row, images: row.images.filter((_, idx) => idx !== imgIndex) } : row
    ));
  };

  const handleApprove = () => {
    if (!parsedData || parsedData.length === 0) return;
    setIsUploading(true);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        addMultipleProducts(parsedData);
        
        setTimeout(() => {
          toast.success(`${parsedData.length} products uploaded successfully!`);
          setIsUploading(false);
          onClose();
        }, 500);
      }
      setUploadProgress(progress);
    }, 200);
  };

  if (isUploading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-10 flex flex-col items-center max-w-sm w-full shadow-2xl">
          <div className="relative w-20 h-20 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle className="text-gray-200 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
              <circle className="text-[#D4527A] stroke-current transition-all duration-300 ease-out" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * uploadProgress) / 100}></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-text-main">{uploadProgress}%</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">Uploading Products...</h3>
          <p className="text-sm text-text-muted text-center">Please wait while we process and upload your products and images securely.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border-main">
          <h2 className="font-serif text-2xl font-bold text-text-main flex items-center gap-2">
            Bulk Upload Products
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          {!parsedData ? (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Info size={16} /> Instructions
                </h3>
                <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1.5 ml-1">
                  <li>Download the Excel template using the button below.</li>
                  <li>Fill in your product details without changing the column headers.</li>
                  <li>Upload the filled Excel file back here.</li>
                  <li>Preview the products and attach images to each product line.</li>
                  <li>Click Approve to publish all products.</li>
                </ol>
                <button onClick={handleDownloadTemplate} className="mt-4 flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 text-sm font-semibold hover:bg-blue-50 transition-colors shadow-sm">
                  <Download size={16} /> Download Template
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 bg-white text-center hover:border-[#D4527A] transition-colors relative">
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Click or drag Excel file to upload</h3>
                <p className="mt-1 text-sm text-gray-500">Supports .xlsx, .xls, .csv</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-text-main">Preview Products ({parsedData.length})</h3>
                <button onClick={() => { setParsedData(null); setFile(null); }} className="text-sm text-red-500 hover:text-red-700 font-medium">Cancel & Re-upload</button>
              </div>
              
              <div className="bg-white border border-border-main rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-border-main">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-600">Product Info</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Pricing</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Images</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 align-top">
                          <p className="font-semibold text-text-main">{row.name || 'Unnamed Product'}</p>
                          <p className="text-xs text-text-muted mt-0.5">Category: {row.category}</p>
                          <p className="text-xs text-text-muted mt-0.5">Stock: {row.stockQty}</p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="font-medium text-text-main">₹{row.price}</p>
                          {row.originalPrice && <p className="text-xs text-text-muted line-through">₹{row.originalPrice}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2 items-center">
                            {row.images?.map((imgUrl, imgIdx) => (
                              <div key={imgIdx} className="relative w-12 h-12 rounded-md overflow-hidden border border-gray-200 group">
                                <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                                <button onClick={() => removeImage(idx, imgIdx)} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                            <label className="w-12 h-12 rounded-md border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-[#D4527A] hover:border-[#D4527A] transition-colors cursor-pointer bg-gray-50 shrink-0">
                              <Plus size={20} />
                              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(idx, e)} />
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border-main bg-white flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-border-main text-text-main font-semibold hover:bg-gray-50 transition-colors">
            Close
          </button>
          {parsedData && parsedData.length > 0 && (
            <button onClick={handleApprove} className="px-6 py-2.5 rounded-lg bg-[#D4527A] text-white font-semibold flex items-center gap-2 hover:bg-[#B94B68] transition-colors shadow-sm">
              <CheckCircle size={18} /> Approve & Upload
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
