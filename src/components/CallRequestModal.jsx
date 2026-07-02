import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Clock, Phone, Mail, User, CheckCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const TIME_SLOTS = [
  '11:00 AM - 2:00 PM',
  '2:00 PM - 5:00 PM',
  '5:00 PM - 8:00 PM'
];

const CallRequestModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    preferredDate: '',
    timeSlot: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Get tomorrow's date as min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    if (selectedDate.getDay() === 0) {
      toast.error('Sundays are not available. Please select another day.');
      setForm({ ...form, preferredDate: '' });
      return;
    }
    setForm({ ...form, preferredDate: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.preferredDate || !form.timeSlot) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/call-requests', form);
      if (res.success) {
        setIsSuccess(true);
      } else {
        toast.error(res.error || 'Failed to submit request');
      }
    } catch (err) {
      toast.error('An error occurred while submitting.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    setForm({ name: '', phone: '', email: '', preferredDate: '', timeSlot: '', message: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetAndClose}
          className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl z-10"
        >
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-pink-100/50 to-[#D4527A]/10 -z-10" />
          
          <button
            onClick={resetAndClose}
            className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full text-charcoal/60 hover:text-charcoal transition-colors backdrop-blur-sm shadow-sm"
          >
            <X size={20} />
          </button>

          <div className="p-8">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} />
                </div>
                <h2 className="font-serif text-2xl text-charcoal mb-3">Request Received!</h2>
                <p className="text-silver-600 font-sans leading-relaxed mb-8">
                  Your call request has been received. We'll confirm your preferred time shortly via WhatsApp.
                </p>
                <button
                  onClick={resetAndClose}
                  className="w-full py-4 bg-charcoal hover:bg-[#D4527A] text-white rounded-2xl font-bold font-sans tracking-wide transition-colors"
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="font-serif text-2xl text-charcoal mb-2">Schedule a Call</h2>
                  <p className="text-silver-500 font-sans text-sm">
                    Book a personalized consultation with our experts to discuss your custom jewelry needs.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-silver-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Full Name *"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-silver-50 border border-silver-200 focus:border-[#D4527A] rounded-xl font-sans text-charcoal outline-none transition-colors"
                    />
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-silver-400">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="Mobile Number *"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-silver-50 border border-silver-200 focus:border-[#D4527A] rounded-xl font-sans text-charcoal outline-none transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-silver-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      placeholder="Email Address (Optional)"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-silver-50 border border-silver-200 focus:border-[#D4527A] rounded-xl font-sans text-charcoal outline-none transition-colors"
                    />
                  </div>

                  {/* Date & Time Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-silver-400">
                        <CalendarIcon size={18} />
                      </div>
                      <input
                        type="date"
                        required
                        min={minDate}
                        value={form.preferredDate}
                        onChange={handleDateChange}
                        className="w-full pl-9 pr-3 py-3.5 bg-silver-50 border border-silver-200 focus:border-[#D4527A] rounded-xl font-sans text-charcoal text-sm outline-none transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-silver-400">
                        <Clock size={18} />
                      </div>
                      <select
                        required
                        value={form.timeSlot}
                        onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                        className="w-full pl-9 pr-3 py-3.5 bg-silver-50 border border-silver-200 focus:border-[#D4527A] rounded-xl font-sans text-charcoal text-sm outline-none transition-colors appearance-none"
                      >
                        <option value="" disabled>Time Slot *</option>
                        {TIME_SLOTS.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <textarea
                      placeholder="Any specific requirements? (Optional)"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows="3"
                      className="w-full p-4 bg-silver-50 border border-silver-200 focus:border-[#D4527A] rounded-xl font-sans text-charcoal outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 mt-2 bg-gradient-to-r from-[#D4527A] to-[#B94B68] hover:from-[#B94B68] hover:to-[#A33E5A] text-white rounded-2xl font-bold font-sans tracking-wide shadow-lg shadow-pink-200 transition-all disabled:opacity-70"
                  >
                    {isSubmitting ? 'Submitting...' : 'Request a Call'}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CallRequestModal;
