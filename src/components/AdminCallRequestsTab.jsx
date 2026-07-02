import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Phone, Calendar, Clock, Edit2, X, Check, Eye } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800'
};

const AdminCallRequestsTab = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState({
    status: '',
    finalTime: '',
    preferredDate: '',
    adminNotes: ''
  });

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/call-requests?status=${filter}`);
      if (res.success) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load call requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleOpenModal = (req) => {
    setSelectedRequest(req);
    setModalForm({
      status: req.status,
      finalTime: req.finalTime || '',
      preferredDate: req.preferredDate || '',
      adminNotes: req.adminNotes || ''
    });
    setIsModalOpen(true);
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

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Requested Slot</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Confirmed Time</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading requests...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No requests found.</td></tr>
            ) : (
              filteredData.map(req => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{req.name}</div>
                    <div className="text-gray-500 text-xs flex items-center gap-1 mt-0.5"><Phone size={12}/> {req.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-medium">{new Date(req.preferredDate).toLocaleDateString()}</div>
                    <div className="text-gray-500 text-xs">{req.timeSlot}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[req.status]}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {req.status === 'Confirmed' || req.status === 'Completed' ? (
                       <span className="font-medium text-gray-900">{req.finalTime || 'Not set'}</span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleOpenModal(req)}
                      className="p-1.5 text-gray-400 hover:text-[#D4527A] hover:bg-pink-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {isModalOpen && selectedRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl z-10 p-6">
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

              <form onSubmit={handleUpdate} className="space-y-4">
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

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Exact Time (e.g., 11:30 AM)</label>
                  <input 
                    type="text" 
                    placeholder="e.g., 11:30 AM"
                    value={modalForm.finalTime} 
                    onChange={e => setModalForm({...modalForm, finalTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#D4527A] outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Customer requested slot: {selectedRequest.timeSlot}</p>
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

                <div className="pt-4 flex justify-end gap-3">
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
    </div>
  );
};

export default AdminCallRequestsTab;
