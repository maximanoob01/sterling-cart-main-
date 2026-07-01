import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, CheckCircle, ArrowRight, ShieldCheck,
  Image as ImageIcon, Check, ChevronDown, Clock, Sparkles, X, AlertCircle, Timer
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ResubmitDesignPage() {
  const { orderId, token } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasRights, setHasRights] = useState(false);
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/custom-orders/resubmit/${orderId}/${token}`);
        if (data.success) {
          setOrder(data.order);
          // Initialize timer
          const remaining = Math.max(0, Math.floor((data.order.expiresAt - Date.now()) / 1000));
          setTimeLeft(remaining);
          if (remaining === 0) setIsExpired(true);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid or expired link');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSession();
  }, [orderId, token]);

  // Countdown timer logic
  useEffect(() => {
    if (!order || isExpired) return;

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [order, isExpired]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop      = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (!isExpired && e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
  };

  const handleFileChange = (f) => {
    if (!f || isExpired) return;
    setFileError('');
    const valid = ['image/png', 'image/svg+xml', 'application/pdf'];
    if (!valid.includes(f.type)) {
      setFileError('Only PNG, SVG, or PDF files are accepted.');
      return;
    }
    if (f.size < 1_000_000) { setFileError('File must be at least 1MB to ensure quality.'); return; }
    if (f.size > 10_000_000) { setFileError('File must be under 10MB.'); return; }
    setFile(f);
  };

  const canSubmit = file && hasRights && !isExpired;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('designFile', file);
      
      const { data } = await axios.post(`http://localhost:5000/api/custom-orders/resubmit/${orderId}/${token}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (data.success) {
        toast.success('New design submitted successfully! Our artisans will review it shortly.');
        navigate('/'); 
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-bg-main flex items-center justify-center font-sans">Loading session...</div>;
  
  if (error) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center font-sans p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <X size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Link Expired or Invalid</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="w-full btn-primary bg-[#D4527A] hover:bg-[#B94B68] text-white py-3 rounded-xl font-bold">Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-main min-h-screen pt-24 pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[#D4527A] uppercase tracking-[0.18em] text-xs font-bold mb-4 flex items-center justify-center gap-2">
            <Timer size={14} className={isExpired ? 'text-red-500' : 'animate-pulse'} /> 
            {isExpired ? 'Session Expired' : `${formatTime(timeLeft)} Remaining`}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
            Resubmit Your Design
          </h1>
          <p className="text-gray-500 text-sm">Order {order.orderId}</p>
        </div>

        {/* Rejection Reason Alert */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 flex gap-4">
          <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-red-800 font-semibold mb-2">Previous Design Rejected</h3>
            <p className="text-sm text-red-700 leading-relaxed">
              <strong>Admin Note:</strong> {order.rejectionReason}
            </p>
            <p className="text-xs text-red-600/80 mt-3 font-semibold uppercase tracking-wider">
              Note: If your design is rejected a second time, your order will be cancelled and a full refund will be issued.
            </p>
          </div>
        </div>

        {/* Upload card */}
        <div className={`bg-white rounded-2xl p-6 md:p-10 shadow-sm border ${isExpired ? 'border-red-200 opacity-75 grayscale-[0.5]' : 'border-gray-100'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-xl font-semibold text-gray-900">Upload New Design</h2>
            {isExpired && <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">EXPIRED</span>}
          </div>
          
          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && !isExpired && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 ${
              isExpired
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : file
                ? 'border-[#D4527A]/40 bg-pink-50/40 cursor-default'
                : isDragging
                ? 'border-[#D4527A] bg-pink-50/60 cursor-copy'
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100/80 hover:border-gray-300 cursor-pointer'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e.target.files[0])}
              accept=".png,.svg,.pdf"
              className="hidden"
              disabled={isExpired}
            />

            {file ? (
              <div className="flex flex-col items-center w-full">
                <div className="w-12 h-12 bg-[#D4527A]/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={24} className="text-[#D4527A]" strokeWidth={1.5} />
                </div>
                <p className="font-semibold text-gray-900 text-sm mb-1 max-w-xs truncate">{file.name}</p>
                <p className="text-xs text-gray-400 mb-5">{(file.size / 1024 / 1024).toFixed(2)} MB · Ready to submit</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); setFileError(''); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg"
                  disabled={isExpired}
                >
                  <X size={12} /> Remove file
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon size={22} className="text-gray-400" strokeWidth={1.5} />
                </div>
                <p className="font-semibold text-gray-800 text-sm mb-1.5">
                  {isDragging ? 'Drop it here' : 'Click or drag file to upload'}
                </p>
                <p className="text-xs text-gray-400 max-w-xs leading-relaxed mb-5">
                  PNG, SVG, or PDF · High contrast, solid black/white · No gradients or photos
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Min 300 DPI', '1MB – 10MB', 'B&W only'].map((t) => (
                    <span key={t} className="text-[10px] font-bold uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-gray-200 text-gray-500">{t}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* File error */}
          <AnimatePresence>
            {fileError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-3 text-xs text-red-500 font-medium flex items-center gap-1.5"
              >
                <X size={12} /> {fileError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Copyright checkbox */}
          <button
            onClick={() => !isExpired && setHasRights(!hasRights)}
            disabled={isExpired}
            className={`mt-8 flex items-start gap-3 text-left w-full group ${isExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center mt-0.5 border transition-colors ${
              hasRights ? 'bg-[#D4527A] border-[#D4527A]' : 'bg-white border-gray-300 group-hover:border-gray-400'
            }`}>
              {hasRights && <Check size={11} className="text-white" strokeWidth={3} />}
            </div>
            <span className="text-xs text-gray-500 leading-relaxed">
              I confirm I own the rights to this design and it does not contain copyrighted logos, trademarks, or protected artwork. I understand unauthorised designs will be rejected.
            </span>
          </button>

          {/* CTA */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting || isExpired}
            className={`w-full mt-8 py-4 rounded-xl flex items-center justify-center gap-2.5 font-bold text-sm transition-all duration-300 ${
              isExpired 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : canSubmit && !isSubmitting
                ? 'bg-[#D4527A] hover:bg-[#B94B68] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isExpired ? 'Session Expired' : isSubmitting ? 'Submitting...' : <>Submit Design for Review <ArrowRight size={16} /></>}
          </button>
        </div>

      </div>
    </div>
  );
}
