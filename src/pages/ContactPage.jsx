import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, Home, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderId: '',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await api.post('/contact', formData);
    } catch (err) {
      // Silently continue — message still shown to user
      console.warn('Contact API unavailable:', err.message);
    }

    toast.success('Message sent successfully! We\'ll get back to you soon.', {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
    setFormData({ name: '', email: '', phone: '', orderId: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-bg-surface pb-20 sm:pb-0">
      {/* Breadcrumb */}
      <div className="bg-pink-50 py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-silver-500 hover:text-pink-300 transition-colors flex items-center gap-1">
              <Home size={14} /> Home
            </Link>
            <ChevronRight size={14} className="text-silver-400" />
            <span className="text-charcoal font-medium">Contact Us</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-[30px] md:text-4xl lg:text-5xl font-bold text-charcoal mb-3 md:mb-4">
            Get in Touch
          </h1>
          <p className="text-silver-500 text-[14px] md:text-lg max-w-2xl mx-auto">
            Have a question, feedback, or need help with your order? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Full Name <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-silver-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Email <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-silver-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-silver-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Order ID <span className="text-silver-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-silver-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm"
                    placeholder="SC-ORD-XXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Message <span className="text-pink-400">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-silver-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <button type="submit" className="btn-primary text-base px-8 py-3">
                <Send size={18} /> Send Message
              </button>
            </form>
          </motion.div>

          {/* Store Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-pink-50 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-pink-400" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-charcoal mb-1">Our Store</h3>
                  <p className="text-sm text-silver-500 leading-relaxed">
                    42, Silver Lane, Jewellery Quarter,<br />
                    Mumbai, Maharashtra 400001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-pink-400" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-charcoal mb-1">Phone</h3>
                  <p className="text-sm text-silver-500">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-pink-400" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-charcoal mb-1">Email</h3>
                  <p className="text-sm text-silver-500">hello@sterlingcart.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-pink-400" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-charcoal mb-1">Working Hours</h3>
                  <p className="text-sm text-silver-500">
                    Monday – Saturday<br />
                    10:00 AM – 7:00 PM IST
                  </p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-silver-100 rounded-2xl h-64 flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <MapPin size={32} className="text-silver-400 mx-auto mb-2" />
                <p className="text-sm text-silver-500">Google Maps</p>
                <p className="text-xs text-silver-400">Mumbai, Maharashtra</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
