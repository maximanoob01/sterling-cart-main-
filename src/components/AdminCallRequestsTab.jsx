import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Phone, Clock, Edit2, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  Pending:   'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800'
};

// '11:00 AM - 2:00 PM' → { startHour: 11, endHour: 14 }
const parseSlot = (slot) => {
  if (!slot) return { startHour: 11, endHour: 20 };
  const [startStr, endStr] = slot.split(' - ');
  const toH24 = (s) => {
    const [time, period] = s.trim().split(' ');
    let [h] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h;
  };
  return { startHour: toH24(startStr), endHour: toH24(endStr) };
};

// "11:30 AM" ↔ { h24, min }
const parseTimeStr = (v) => {
  if (!v) return null;
  const [time, period] = v.split(' ');
  if (!time || !period) return null;
  let [h, m] = time.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return { h24: h, min: m };
};

const formatTime = (h24, min) => {
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h = h24 % 12 || 12;
  return `${h}:${String(min).padStart(2, '0')} ${period}`;
};

// ── Analog Clock + Hour/Minute Picker ─────────────────────────────────────────
const TimePickerWidget = ({ value, onChange, requestedSlot }) => {
  const parsed = parseTimeStr(value);
  const { startHour, endHour } = parseSlot(requestedSlot);

  const h24  = parsed?.h24  ?? startHour;
  const min  = parsed?.min  ?? 0;
  const hasValue = parsed !== null;

  const hourAngle   = (h24 % 12) * 30 + min * 0.5;
  const minuteAngle = min * 6;

  // Build hour list from slot start to end (inclusive)
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const MINUTES = [0, 15, 30, 45];

  const pick = (newH, newM) => onChange(formatTime(newH, newM));

  // SVG clock helpers
  const handX = (angle, len) => 50 + len * Math.sin((angle * Math.PI) / 180);
  const handY = (angle, len) => 50 - len * Math.cos((angle * Math.PI) / 180);

  return (
    <div className="select-none">
      {/* Requested slot badge */}
      <div className="flex items-center gap-1.5 mb-4 justify-center">
        <Clock size={12} className="text-[#D4527A]" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Requested slot:
        </span>
        <span className="text-[11px] font-bold text-[#D4527A]">{requestedSlot}</span>
      </div>

      {/* Analog Clock Face */}
      <div className="flex justify-center mb-5">
        <svg viewBox="0 0 100 100" className="w-40 h-40 drop-shadow-md">
          {/* Outer ring */}
          <circle cx="50" cy="50" r="49" fill="#fff7f9" stroke="#f1d8de" strokeWidth="1" />
          <circle cx="50" cy="50" r="46" fill="white" />

          {/* Hour tick marks */}
          {[...Array(12)].map((_, i) => {
            const a = (i * 30 - 90) * (Math.PI / 180);
            const inner = i % 3 === 0 ? 38 : 41;
            return (
              <line
                key={i}
                x1={50 + inner * Math.cos(a)}  y1={50 + inner * Math.sin(a)}
                x2={50 + 44 * Math.cos(a)}     y2={50 + 44 * Math.sin(a)}
                stroke={i % 3 === 0 ? '#d1d5db' : '#e5e7eb'}
                strokeWidth={i % 3 === 0 ? 1.5 : 1}
                strokeLinecap="round"
              />
            );
          })}

          {/* Minute hand */}
          {hasValue && (
            <line
              x1="50" y1="50"
              x2={handX(minuteAngle, 34)} y2={handY(minuteAngle, 34)}
              stroke="#D4527A" strokeWidth="1.8" strokeLinecap="round"
            />
          )}

          {/* Hour hand */}
          {hasValue && (
            <line
              x1="50" y1="50"
              x2={handX(hourAngle, 23)} y2={handY(hourAngle, 23)}
              stroke="#1a1a1a" strokeWidth="2.8" strokeLinecap="round"
            />
          )}

          {/* Center cap */}
          <circle cx="50" cy="50" r="2.8" fill="#1a1a1a" />
          <circle cx="50" cy="50" r="1.2" fill="white" />

          {/* Time label */}
          <text
            x="50" y="74"
            textAnchor="middle"
            fontSize="8.5"
            fill={hasValue ? '#1a1a1a' : '#9ca3af'}
            fontFamily="sans-serif"
            fontWeight="700"
            letterSpacing="0.5"
          >
            {hasValue ? formatTime(h24, min) : 'pick a time'}
          </text>
        </svg>
      </div>

      {/* Hour selector */}
      <div className="mb-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Hour</p>
        <div className="flex flex-wrap gap-1.5">
          {hours.map((hr) => {
            const active = hasValue && h24 === hr;
            const label = `${hr % 12 || 12} ${hr >= 12 ? 'PM' : 'AM'}`;
            return (
              <button
                key={hr}
                type="button"
                onClick={() => pick(hr, min)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? 'bg-[#D4527A] text-white shadow-sm shadow-pink-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minute selector */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Minute</p>
        <div className="flex gap-2">
          {MINUTES.map((m) => {
            const active = hasValue && min === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => pick(h24, m)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? 'bg-[#D4527A] text-white shadow-sm shadow-pink-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                :{String(m).padStart(2, '0')}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const AdminCallRequestsTab = ({ onCountChange }) => {
  const [requests, setRequests]             = useState([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [filter, setFilter]                 = useState('All');
  const [search, setSearch]                 = useState('');

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [isQuickConfirmOpen, setIsQuickConfirmOpen] = useState(false);
  const [quickTime, setQuickTime]             = useState('');
  const [expandedRows, setExpandedRows]       = useState({});

  const [modalForm, setModalForm] = useState({
    status: '', finalTime: '', preferredDate: '', adminNotes: ''
  });

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/call-requests?status=${filter}`);
      if (res.success) {
        setRequests(res.requests);
        // Keep the parent badge in sync: always reflect current Pending total
        if (onCountChange) {
          const pendingRes = await api.get('/admin/call-requests?status=Pending').catch(() => ({ requests: [] }));
          onCountChange((pendingRes.requests || []).length);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load call requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const handleOpenModal = (req) => {
    setSelectedRequest(req);
    setModalForm({
      status:       req.status,
      finalTime:    req.finalTime || '',
      preferredDate: req.preferredDate || '',
      adminNotes:   req.adminNotes || ''
    });
    setIsModalOpen(true);
  };

  const toggleExpand = (id) =>
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

  const handleQuickConfirmOpen = (req) => {
    setSelectedRequest(req);
    setQuickTime('');
    setIsQuickConfirmOpen(true);
  };

  const handleQuickConfirmSubmit = async (e) => {
    e.preventDefault();
    if (!quickTime) { toast.error('Please select a time'); return; }
    try {
      const res = await api.put(`/admin/call-requests/${selectedRequest.id}`, {
        status: 'Confirmed', finalTime: quickTime
      });
      if (res.success) {
        toast.success('Call request confirmed');
        setIsQuickConfirmOpen(false);
        fetchRequests();
      }
    } catch (err) {
      toast.error('Failed to confirm request');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/admin/call-requests/${selectedRequest.id}`, modalForm);
      if (res.success) {
        toast.success('Call request updated successfully');
        setIsModalOpen(false);
        fetchRequests();
      }
    } catch (err) {
      toast.error('Failed to update request');
    }
  };

  const filteredData = requests.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search)
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h2 className="font-serif text-xl font-bold text-gray-900">Call Requests</h2>
          <p className="text-sm text-gray-500">Manage personalized consultation bookings</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#D4527A]"
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#D4527A] bg-white cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 md:px-6 md:py-4 font-medium">Customer</th>
              <th className="hidden md:table-cell px-6 py-4 font-medium">Requested Slot</th>
              <th className="px-4 py-3 md:px-6 md:py-4 font-medium">Status</th>
              <th className="hidden md:table-cell px-6 py-4 font-medium">Confirmed Time</th>
              <th className="px-4 py-3 md:px-6 md:py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading requests...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No requests found.</td></tr>
            ) : (
              filteredData.map(req => (
                <React.Fragment key={req.id}>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 md:px-6 md:py-4">
                      <div className="flex items-start gap-2">
                        <button onClick={() => toggleExpand(req.id)} className="md:hidden mt-0.5 p-1 -ml-2 text-gray-400 hover:text-[#D4527A] transition-colors">
                          {expandedRows[req.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <div>
                          <div className="font-semibold text-gray-900">{req.name}</div>
                          <div className="text-gray-500 text-xs flex items-center gap-1 mt-0.5"><Phone size={12}/> {req.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">
                      <div className="text-gray-900 font-medium">
                        {new Date(req.preferredDate + 'T00:00:00').toLocaleDateString()}
                      </div>
                      <div className="text-gray-500 text-xs">{req.timeSlot}</div>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold ${STATUS_COLORS[req.status]}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-gray-500">
                      {req.status === 'Confirmed' || req.status === 'Completed'
                        ? <span className="font-medium text-gray-900">{req.finalTime || 'Not set'}</span>
                        : '-'}
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-right flex items-center justify-end gap-1 md:gap-2">
                      {req.status === 'Pending' && (
                        <button
                          onClick={() => handleQuickConfirmOpen(req)}
                          title="Quick Confirm"
                          className="px-2 py-1.5 md:px-3 md:py-1.5 flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs font-bold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors shadow-sm whitespace-nowrap"
                        >
                          <Check size={14} strokeWidth={3} /> <span className="hidden sm:inline">Quick Confirm</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenModal(req)}
                        title="Edit Details"
                        className="p-1.5 text-gray-400 hover:text-[#D4527A] hover:bg-pink-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                  {expandedRows[req.id] && (
                    <tr className="md:hidden bg-gray-50/50">
                      <td colSpan="3" className="px-4 py-3 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="block font-medium text-gray-500 mb-0.5 uppercase tracking-wider text-[10px]">Requested Slot</span>
                            <div className="text-gray-900 font-medium">
                              {new Date(req.preferredDate + 'T00:00:00').toLocaleDateString()}
                            </div>
                            <div className="text-gray-500">{req.timeSlot}</div>
                          </div>
                          <div>
                            <span className="block font-medium text-gray-500 mb-0.5 uppercase tracking-wider text-[10px]">Confirmed Time</span>
                            {req.status === 'Confirmed' || req.status === 'Completed'
                              ? <span className="font-medium text-gray-900">{req.finalTime || 'Not set'}</span>
                              : '-'}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Full Edit Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && selectedRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl z-10 p-6 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold font-serif text-gray-900">Manage Request</h3>
                  <p className="text-sm text-gray-500 mt-1">Update status and finalize details for {selectedRequest.name}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={18}/></button>
              </div>

              {selectedRequest.message && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                  <span className="font-semibold block mb-1">Customer Message:</span>
                  <p className="text-gray-600">{selectedRequest.message}</p>
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                    <select
                      value={modalForm.status}
                      onChange={e => setModalForm({...modalForm, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#D4527A] outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date (Can Reschedule)</label>
                    <input
                      type="date"
                      value={modalForm.preferredDate}
                      onChange={e => setModalForm({...modalForm, preferredDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#D4527A] outline-none"
                    />
                  </div>
                </div>

                {/* Time picker */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <label className="block text-xs font-semibold text-gray-600 mb-3">Confirm Exact Time</label>
                  <TimePickerWidget
                    value={modalForm.finalTime}
                    onChange={v => setModalForm({...modalForm, finalTime: v})}
                    requestedSlot={selectedRequest.timeSlot}
                  />
                  {modalForm.finalTime && (
                    <p className="mt-3 text-center text-xs font-bold text-[#D4527A]">
                      ✓ Set to {modalForm.finalTime}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Internal Admin Notes</label>
                  <textarea
                    rows="3"
                    value={modalForm.adminNotes}
                    onChange={e => setModalForm({...modalForm, adminNotes: e.target.value})}
                    placeholder="Add notes about this call..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#D4527A] outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-5 py-2 text-sm font-semibold bg-[#D4527A] hover:bg-[#B33F62] text-white rounded-lg transition-colors flex items-center gap-2">
                    <Check size={16} /> Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Quick Confirm Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isQuickConfirmOpen && selectedRequest && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsQuickConfirmOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl z-10 p-6"
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-lg font-bold font-serif text-gray-900">Quick Confirm</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedRequest.name} · {selectedRequest.phone}</p>
                </div>
                <button onClick={() => setIsQuickConfirmOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={18}/></button>
              </div>

              <form onSubmit={handleQuickConfirmSubmit}>
                <TimePickerWidget
                  value={quickTime}
                  onChange={setQuickTime}
                  requestedSlot={selectedRequest.timeSlot}
                />

                {quickTime && (
                  <p className="mt-4 text-center text-xs font-bold text-[#D4527A]">
                    ✓ Will confirm at {quickTime}
                  </p>
                )}

                <div className="flex justify-end gap-3 mt-5">
                  <button type="button" onClick={() => setIsQuickConfirmOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button
                    type="submit"
                    disabled={!quickTime}
                    className="px-5 py-2 text-sm font-semibold bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Check size={16} /> Confirm
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCallRequestsTab;
