import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings, TrendingUp, Clock, Search, Edit, Trash2, Eye, Download, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { products as initialProducts } from '../data/products';
import { mockOrders, mockCustomers, adminStats, revenueData } from '../data/orders';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const { user, isAdmin, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(mockOrders);

  // Redirect if not admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-silver-50">
        <div className="bg-bg-surface p-8 rounded-2xl shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-4 text-charcoal">Access Denied</h2>
          <p className="mb-6 text-silver-500">You do not have permission to view this page.</p>
          <button onClick={() => { navigate('/'); openAuthModal(); }} className="btn-primary">Login to Continue</button>
        </div>
      </div>
    );
  }

  const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={20} /> },
    { id: 'products', label: 'Products', icon: <Package size={20} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.success(`Order ${orderId} updated to ${newStatus}`);
  };

  const handleDeleteProduct = (productId) => {
    if(window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Delivered': return 'bg-[#E6F4EA] text-[#137333]';
      case 'Shipped': return 'bg-[#F3E8FF] text-[#7E22CE]';
      case 'Confirmed': return 'bg-[#E0F2FE] text-[#0369A1]';
      case 'Cancelled': return 'bg-[#FCE8E6] text-[#C5221F]';
      default: return 'bg-[#FFF3E0] text-[#E65100]'; // Pending, Packed
    }
  };

  const renderDashboard = () => (
    <div className="space-y-[24px]">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[24px]">
        <div className="bg-bg-surface rounded-[16px] p-[24px] shadow-product flex items-center justify-between border-none">
          <div>
            <p className="font-sans text-[13px] text-text-muted mb-[4px]">Total Orders</p>
            <h3 className="font-sans text-[24px] font-bold text-text-main">{adminStats.totalOrders}</h3>
          </div>
          <div className="w-[48px] h-[48px] bg-[#E0F2FE] text-[#0369A1] rounded-[12px] flex items-center justify-center"><ShoppingBag size={24} /></div>
        </div>
        <div className="bg-bg-surface rounded-[16px] p-[24px] shadow-product flex items-center justify-between border-none">
          <div>
            <p className="font-sans text-[13px] text-text-muted mb-[4px]">Revenue Today</p>
            <h3 className="font-sans text-[24px] font-bold text-text-main">{formatPrice(adminStats.revenueToday)}</h3>
          </div>
          <div className="w-[48px] h-[48px] bg-[#FFF0F5] text-[#D4527A] rounded-[12px] flex items-center justify-center"><TrendingUp size={24} /></div>
        </div>
        <div className="bg-bg-surface rounded-[16px] p-[24px] shadow-product flex items-center justify-between border-none">
          <div>
            <p className="font-sans text-[13px] text-text-muted mb-[4px]">Pending Orders</p>
            <h3 className="font-sans text-[24px] font-bold text-text-main">{adminStats.pendingOrders}</h3>
          </div>
          <div className="w-[48px] h-[48px] bg-[#FFF3E0] text-[#E65100] rounded-[12px] flex items-center justify-center"><Clock size={24} /></div>
        </div>
        <div className="bg-bg-surface rounded-[16px] p-[24px] shadow-product flex items-center justify-between border-none">
          <div>
            <p className="font-sans text-[13px] text-text-muted mb-[4px]">Total Products</p>
            <h3 className="font-sans text-[24px] font-bold text-text-main">{adminStats.totalProducts}</h3>
          </div>
          <div className="w-[48px] h-[48px] bg-[#F3E8FF] text-[#7E22CE] rounded-[12px] flex items-center justify-center"><Package size={24} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[24px]">
        {/* Chart */}
        <div className="xl:col-span-2 bg-bg-surface rounded-[16px] p-[24px] shadow-product border-none">
          <h3 className="font-serif text-[18px] font-bold text-text-main mb-[24px]">Revenue (Last 30 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E8E8" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#A8A8A8', fontFamily: 'Inter'}} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(val) => `₹${val/1000}k`} tick={{fontSize: 12, fill: '#A8A8A8', fontFamily: 'Inter'}} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => formatPrice(value)} contentStyle={{borderRadius: '12px', border: '1px solid #E8E8E8', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontFamily: 'Inter'}} />
                <Line type="monotone" dataKey="revenue" stroke="#F4A0B0" strokeWidth={3} dot={false} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-bg-surface rounded-[16px] p-[24px] shadow-product border-none">
          <div className="flex justify-between items-center mb-[24px]">
            <h3 className="font-serif text-[18px] font-bold text-text-main">Recent Orders</h3>
            <button onClick={() => setActiveTab('orders')} className="font-sans text-[13px] font-medium text-[#D4527A] hover:text-[#F4A0B0] transition-colors">View All</button>
          </div>
          <div className="space-y-[12px]">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex justify-between items-center p-[12px] hover:bg-[#FAFAFA] rounded-[12px] transition-colors">
                <div>
                  <p className="font-sans font-medium text-[14px] text-text-main">{order.id}</p>
                  <p className="font-sans text-[12px] text-text-muted mt-[2px]">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex font-sans text-[11px] font-bold uppercase tracking-[0.5px] px-[8px] py-[4px] rounded-[6px] ${getStatusBadgeClass(order.status)}`}>{order.status}</span>
                  <p className="font-sans text-[13px] font-semibold text-text-main mt-[4px]">{formatPrice(order.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="bg-bg-surface rounded-[16px] shadow-product border-none overflow-hidden">
      <div className="p-[24px] flex flex-col md:flex-row justify-between gap-[16px] items-start md:items-center">
        <h3 className="font-serif text-[18px] font-bold text-text-main">Manage Orders</h3>
        <div className="flex gap-[12px] w-full md:w-auto">
          <div className="relative flex-1 md:w-[240px]">
            <Search size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#A8A8A8]" />
            <input type="text" placeholder="Search orders..." className="w-full pl-[36px] pr-[16px] h-[40px] border border-border-main rounded-[8px] font-sans text-[13px] text-text-main outline-none focus:border-[#1A1A1A] transition-colors" />
          </div>
          <button onClick={() => toast.success('Exporting CSV...')} className="btn-secondary h-[40px] px-[16px] flex items-center justify-center gap-[8px] font-sans text-[13px] whitespace-nowrap"><Download size={16} /> Export</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FFF0F5]">
              <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Order ID</th>
              <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Date</th>
              <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Customer</th>
              <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Total</th>
              <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Payment</th>
              <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Status</th>
              <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[#D4527A] uppercase tracking-[0.5px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8E8] font-sans text-[14px]">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-[24px] py-[16px] font-medium text-text-main">{order.id}</td>
                <td className="px-[24px] py-[16px] text-text-muted">{order.date}</td>
                <td className="px-[24px] py-[16px] text-text-main">{order.customerName}</td>
                <td className="px-[24px] py-[16px] font-bold text-text-main">{formatPrice(order.total)}</td>
                <td className="px-[24px] py-[16px] text-text-muted">{order.paymentMethod}</td>
                <td className="px-[24px] py-[16px]">
                  <select 
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                    className={`font-sans text-[11px] font-bold uppercase tracking-[0.5px] px-[8px] py-[4px] rounded-[6px] outline-none cursor-pointer appearance-none ${getStatusBadgeClass(order.status)}`}
                  >
                    {['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => (
                      <option key={s} value={s} className="bg-bg-surface text-text-main">{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-[24px] py-[16px] text-right">
                  <button className="text-[#A8A8A8] hover:text-[#D4527A] transition-colors p-[4px]"><Eye size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="bg-bg-surface rounded-[16px] shadow-product border-none overflow-hidden">
      <div className="p-[24px] flex flex-col md:flex-row justify-between gap-[16px] items-start md:items-center">
        <h3 className="font-serif text-[18px] font-bold text-text-main">Manage Products</h3>
        <div className="flex gap-[12px] w-full md:w-auto">
          <div className="relative flex-1 md:w-[240px]">
            <Search size={16} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#A8A8A8]" />
            <input type="text" placeholder="Search products..." className="w-full pl-[36px] pr-[16px] h-[40px] border border-border-main rounded-[8px] font-sans text-[13px] text-text-main outline-none focus:border-[#1A1A1A] transition-colors" />
          </div>
          <button className="btn-primary h-[40px] px-[16px] flex items-center justify-center gap-[8px] font-sans text-[13px] whitespace-nowrap"><Plus size={16} /> Add Product</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FFF0F5]">
              <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Product</th>
              <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">SKU</th>
              <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Category</th>
              <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Price</th>
              <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Stock</th>
              <th className="px-[24px] py-[16px] font-sans text-[12px] font-bold text-[#D4527A] uppercase tracking-[0.5px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8E8] font-sans text-[14px]">
            {products.slice(0, 10).map(product => (
              <tr key={product.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-[24px] py-[16px] flex items-center gap-[12px]">
                   <div className="w-[40px] h-[40px] rounded-[8px] bg-[#FAFAFA] overflow-hidden border border-border-main"><img src={product.images[0]} alt="" className="w-full h-full object-cover" /></div>
                   <span className="font-medium text-text-main max-w-[200px] truncate">{product.name}</span>
                </td>
                <td className="px-[24px] py-[16px] text-text-muted">{product.sku}</td>
                <td className="px-[24px] py-[16px] text-text-main capitalize">{product.category.replace('-', ' ')}</td>
                <td className="px-[24px] py-[16px] font-bold text-text-main">{formatPrice(product.price)}</td>
                <td className="px-[24px] py-[16px]">
                  <span className={`inline-flex font-sans text-[11px] font-bold tracking-[0.5px] px-[8px] py-[4px] rounded-[6px] ${product.stockQty > 20 ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-[#FCE8E6] text-[#C5221F]'}`}>
                    {product.stockQty} in stock
                  </span>
                </td>
                <td className="px-[24px] py-[16px] text-right">
                  <button className="text-[#A8A8A8] hover:text-[#0369A1] transition-colors p-[4px]"><Edit size={16} /></button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="text-[#A8A8A8] hover:text-[#C5221F] transition-colors p-[4px] ml-[8px]"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FAFAFA] overflow-hidden">
      {/* Admin Sidebar */}
      <div className="w-[280px] bg-[#1C1C2E] text-white flex-shrink-0 flex flex-col h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.05)]">
        <div className="p-[24px]">
          <Link to="/" className="inline-flex items-center gap-[8px]">
            <span className="font-serif text-[24px] font-bold text-white tracking-[0.5px]">Sterling</span>
            <span className="font-sans text-[14px] font-semibold text-[#1C1C2E] bg-[#F4A0B0] px-[8px] py-[2px] rounded-[4px] tracking-[1px] uppercase">Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-[16px] space-y-[4px] mt-[16px]">
          {sidebarLinks.map(link => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`w-full flex items-center gap-[12px] px-[16px] py-[12px] rounded-[12px] transition-all duration-300 font-sans text-[14px] font-medium ${activeTab === link.id ? 'bg-[#2D2D44] text-[#FFF0F5] border-l-[4px] border-[#F4A0B0]' : 'text-[#A8A8A8] hover:bg-[#2D2D44]/50 hover:text-[#FFF0F5] border-l-[4px] border-transparent'}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-[16px] m-[16px] bg-[#2D2D44] rounded-[16px] flex items-center gap-[12px] border border-white/5">
          <div className="w-[40px] h-[40px] rounded-full bg-[#F4A0B0] text-[#1C1C2E] flex items-center justify-center font-sans font-bold text-[14px]">AD</div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[14px] font-semibold text-white truncate">Admin User</p>
            <p className="font-sans text-[12px] text-[#A8A8A8] truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Admin Header */}
        <header className="bg-bg-surface h-[72px] border-b border-border-main flex items-center justify-between px-[32px] flex-shrink-0 z-10 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <h1 className="font-serif text-[24px] font-bold text-text-main capitalize">{activeTab}</h1>
          <div className="flex items-center gap-[16px]">
            <Link to="/" className="font-sans text-[14px] font-medium text-text-main hover:text-[#D4527A] transition-colors bg-[#FAFAFA] px-[16px] py-[8px] rounded-[8px] border border-border-main">View Store</Link>
          </div>
        </header>
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-[32px]">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'products' && renderProducts()}
          {/* Customers Placeholder */}
          {activeTab === 'customers' && (
            <div className="bg-bg-surface rounded-xl shadow-sm border border-silver-100 p-6">
              <h3 className="font-bold text-lg mb-4">Customers ({mockCustomers.length})</h3>
              <p className="text-silver-500 text-sm mb-4">Customer management table would appear here.</p>
            </div>
          )}
          {/* Reports Placeholder */}
          {activeTab === 'reports' && (
            <div className="flex flex-col items-center justify-center h-64 bg-bg-surface rounded-xl border border-dashed border-silver-300 text-silver-400">
              <BarChart3 size={48} className="mb-4" />
              <p>Detailed reports module coming soon.</p>
            </div>
          )}
          {/* Settings Placeholder */}
          {activeTab === 'settings' && (
            <div className="bg-bg-surface rounded-xl p-6 shadow-sm border border-silver-100 max-w-2xl">
              <h3 className="font-bold text-lg mb-6">Store Settings</h3>
              <div className="space-y-4">
                <div><label className="block text-sm mb-1">Store Name</label><input type="text" value="Sterling Cart" disabled className="w-full border rounded p-2 bg-silver-50" /></div>
                <div><label className="block text-sm mb-1">Support Email</label><input type="text" value="hello@sterlingcart.com" disabled className="w-full border rounded p-2 bg-silver-50" /></div>
                <button className="btn-primary mt-4" disabled>Save Changes</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
