import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  getAllOrders, 
  updateOrderStatus, 
  getMenuItems, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  batchSaveMenuItems,
  batchUpdateOrderStatus,
  batchDeleteOrders,
  getAllReservations,
  updateReservationStatus,
  deleteReservation,
  batchUpdateReservationStatus,
  batchDeleteReservations
} from '../services/db';
import BatchMenuEditor from './BatchMenuEditor';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  LayoutDashboard, 
  Utensils, 
  Edit2, 
  Trash2, 
  Plus, 
  X, 
  Search,
  Calendar,
  Phone,
  MessageCircle,
  Users,
  Sparkles,
  FileText,
  Globe
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard({ onNavigateHome }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'reservations' | 'menu'
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  
  // Kitchen Order Ticket (KOT) Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Reservation Filter & Search
  const [resSearchQuery, setResSearchQuery] = useState('');
  const [resStatusFilter, setResStatusFilter] = useState('all');

  // Menu Management State
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', desc: '', price: '', category: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Batch Operations State
  const [menuMode, setMenuMode] = useState('batch'); // 'batch' (default) | 'standard'
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [selectedResIds, setSelectedResIds] = useState(new Set());

  // Alarm & Notification State
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [alarmMessage, setAlarmMessage] = useState('');
  const [alarmTargetTab, setAlarmTargetTab] = useState('overview');
  const audioRef = useRef(null);

  // Helper to extract mobile number from delivery address
  const extractPhone = (deliveryAddress) => {
    if (!deliveryAddress) return null;
    const match = deliveryAddress.match(/Mobile:\s*([+0-9\s-]+)/i) || deliveryAddress.match(/(\+?91[\s-]?)?[6-9]\d{9}/);
    return match ? match[1] || match[0] : null;
  };

  // Safe helper to format order IDs cleanly without throwing
  const formatOrderId = (id) => {
    if (!id) return 'ORD';
    const str = String(id);
    const parts = str.split('-');
    if (parts.length > 1 && parts[1]) {
      return parts[1].slice(-6);
    }
    return str.slice(-6);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch Orders
        const fetchedOrders = await getAllOrders();
        setOrders(prevOrders => {
          if (prevOrders.length > 0 && fetchedOrders.length > prevOrders.length) {
            const newest = fetchedOrders[0];
            const itemsCount = Array.isArray(newest?.items) ? newest.items.reduce((s, i) => s + (i.quantity || 1), 0) : 0;
            const displayId = formatOrderId(newest?.id);
            const total = Number(newest?.total ?? newest?.totalAmount ?? 0);
            setAlarmMessage(`🚨 NEW FOOD ORDER #${displayId} (₹${total}) with ${itemsCount} items!`);
            setAlarmTargetTab('overview');
            setIsAlarmRinging(true);
          }
          return fetchedOrders;
        });

        // Fetch Reservations
        const fetchedReservations = await getAllReservations();
        setReservations(prevRes => {
          if (prevRes.length > 0 && fetchedReservations.length > prevRes.length) {
            const newestRes = fetchedReservations[0];
            setAlarmMessage(`🛎️ NEW TABLE RESERVATION! ${newestRes.code} for ${newestRes.name} (${newestRes.guests} Guests on ${newestRes.date} at ${newestRes.time})`);
            setAlarmTargetTab('reservations');
            setIsAlarmRinging(true);
          }
          return fetchedReservations;
        });

      } catch (e) {
        console.error('Admin sync error:', e);
      }
    };

    fetchAllData();
    getMenuItems().then(setMenuItems).catch(console.error);

    // Poll every 5s for live updates from customers
    const intervalId = setInterval(fetchAllData, 5000);

    // Instant local listener
    const handleOrderEvent = () => fetchAllData();
    const handleResEvent = () => fetchAllData();
    window.addEventListener('order-updated', handleOrderEvent);
    window.addEventListener('reservation-updated', handleResEvent);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('order-updated', handleOrderEvent);
      window.removeEventListener('reservation-updated', handleResEvent);
    };
  }, []);

  useEffect(() => {
     if (isAlarmRinging && audioRef.current) {
         audioRef.current.play().catch(e => console.log('Audio autoplay blocked:', e));
     } else if (!isAlarmRinging && audioRef.current) {
         audioRef.current.pause();
         audioRef.current.currentTime = 0;
     }
  }, [isAlarmRinging]);

  // --- OVERVIEW DATA ---
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total ?? order.totalAmount ?? 0) || 0), 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  // Chart data
  const chartDataMap = {};
  for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      chartDataMap[dateString] = 0;
  }
  orders.forEach(order => {
      const dateString = new Date(order.date || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (chartDataMap[dateString] !== undefined) {
          chartDataMap[dateString] += Number(order.total ?? order.totalAmount ?? 0) || 0;
      }
  });
  const chartData = Object.keys(chartDataMap).map(key => ({ name: key, revenue: chartDataMap[key] }));

  // Filtered Reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      const matchesSearch = 
        (res.name && res.name.toLowerCase().includes(resSearchQuery.toLowerCase())) ||
        (res.code && res.code.toLowerCase().includes(resSearchQuery.toLowerCase())) ||
        (res.phone && res.phone.includes(resSearchQuery));
      const matchesStatus = resStatusFilter === 'all' || (res.status || 'confirmed') === resStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reservations, resSearchQuery, resStatusFilter]);

  // Order status updater
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  // Reservation status updater
  const handleResStatusChange = async (resId, newStatus) => {
    try {
      await updateReservationStatus(resId, newStatus);
      setReservations(prev => prev.map(r => r.id === resId ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error(err);
      alert('Failed to update reservation status');
    }
  };

  const handleDeleteReservation = async (id) => {
    if (window.confirm('Delete this table reservation?')) {
      try {
        await deleteReservation(id);
        setReservations(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // --- BATCH CRUD & BULK OPERATIONS HANDLERS ---
  const handleBatchSaveMenu = async ({ creates, updates, deletes }) => {
    const result = await batchSaveMenuItems({ creates, updates, deletes });
    if (result && result.items) {
      setMenuItems(result.items);
    } else {
      const refreshed = await getMenuItems();
      setMenuItems(refreshed);
    }
  };

  // Orders Batch Operations
  const handleToggleSelectOrder = (id) => {
    setSelectedOrderIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllOrders = (selectAll) => {
    if (selectAll) {
      setSelectedOrderIds(new Set(orders.map(o => o.id)));
    } else {
      setSelectedOrderIds(new Set());
    }
  };

  const handleBatchOrderChangeStatus = async (status) => {
    if (selectedOrderIds.size === 0) return;
    const ids = Array.from(selectedOrderIds);
    try {
      await batchUpdateOrderStatus(ids, status);
      setOrders(prev => prev.map(o => selectedOrderIds.has(o.id) ? { ...o, status } : o));
      setSelectedOrderIds(new Set());
    } catch (err) {
      console.error(err);
      alert('Failed to update orders in batch');
    }
  };

  const handleBatchDeleteOrders = async () => {
    if (selectedOrderIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedOrderIds.size} selected orders?`)) return;
    const ids = Array.from(selectedOrderIds);
    try {
      await batchDeleteOrders(ids);
      setOrders(prev => prev.filter(o => !selectedOrderIds.has(o.id)));
      setSelectedOrderIds(new Set());
    } catch (err) {
      console.error(err);
      alert('Failed to delete orders in batch');
    }
  };

  // Reservations Batch Operations
  const handleToggleSelectRes = (id) => {
    setSelectedResIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllRes = (selectAll) => {
    if (selectAll) {
      setSelectedResIds(new Set(filteredReservations.map(r => r.id)));
    } else {
      setSelectedResIds(new Set());
    }
  };

  const handleBatchResChangeStatus = async (status) => {
    if (selectedResIds.size === 0) return;
    const ids = Array.from(selectedResIds);
    try {
      await batchUpdateReservationStatus(ids, status);
      setReservations(prev => prev.map(r => selectedResIds.has(r.id) ? { ...r, status } : r));
      setSelectedResIds(new Set());
    } catch (err) {
      console.error(err);
      alert('Failed to update reservations in batch');
    }
  };

  const handleBatchDeleteRes = async () => {
    if (selectedResIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedResIds.size} selected table reservations?`)) return;
    const ids = Array.from(selectedResIds);
    try {
      await batchDeleteReservations(ids);
      setReservations(prev => prev.filter(r => !selectedResIds.has(r.id)));
      setSelectedResIds(new Set());
    } catch (err) {
      console.error(err);
      alert('Failed to delete reservations in batch');
    }
  };

  // --- MENU MANAGEMENT HANDLERS ---
  const handleEditClick = (item) => {
    setEditingItem(item.id);
    setFormData({ name: item.name, desc: item.desc, price: item.price, category: item.category || '' });
    setIsAdding(false);
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setEditingItem(null);
    setFormData({ name: '', desc: '', price: '', category: '' });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setIsAdding(false);
    setFormData({ name: '', desc: '', price: '', category: '' });
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    try {
      if (isAdding) {
        await addMenuItem(formData.name, formData.desc, formData.price, formData.category);
      } else {
        await updateMenuItem(editingItem, formData.name, formData.desc, formData.price, formData.category);
      }
      const updated = await getMenuItems();
      setMenuItems(updated);
      handleCancelEdit();
    } catch (err) {
      console.error(err);
      alert("Failed to save menu item.");
    }
  };

  const handleDeleteMenu = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await deleteMenuItem(id);
        const updated = await getMenuItems();
        setMenuItems(updated);
      } catch (err) {
        console.error(err);
        alert("Failed to delete menu item.");
      }
    }
  };

  const filteredMenuItems = menuItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.category || 'Uncategorized').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="cart-container animate-on-load" style={{maxWidth: '1280px', margin: '0 auto', padding: '1rem'}}>
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" loop style={{display: 'none'}} />
      
      {/* FLOATING REAL-TIME NOTIFICATION POPUP */}
      {isAlarmRinging && (
          <div style={{
              position: 'fixed', top: '90px', left: '50%', transform: 'translateX(-50%)',
              background: '#D97706', color: 'white', padding: '1rem 2rem', borderRadius: '12px',
              zIndex: 9999, display: 'flex', alignItems: 'center', gap: '1.5rem',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(217, 119, 6, 0.6)',
              border: '2px solid #FCD34D'
          }}>
              <strong style={{fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.6rem'}}>
                  {alarmMessage || '🚨 NEW ACTIVITY RECEIVED!'}
              </strong>
              <div style={{display: 'flex', gap: '0.6rem'}}>
                <button 
                  onClick={() => {
                    setActiveTab(alarmTargetTab);
                    setIsAlarmRinging(false);
                  }}
                  style={{
                    background: '#1F2937', color: '#FCD34D', border: '1px solid #FCD34D',
                    padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  View Now
                </button>
                <button 
                  onClick={() => setIsAlarmRinging(false)} 
                  style={{
                    background: 'white', color: '#1F2937', border: 'none', padding: '0.5rem 1rem',
                    borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  Dismiss Alarm
                </button>
              </div>
          </div>
      )}
      
      {/* TOP CONTROL CENTER HEADER & TAB NAVIGATION */}
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
         <div style={{display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'}}>
             <div style={{display: 'flex', alignItems: 'baseline', gap: '0.8rem'}}>
                 <h2 style={{margin: 0, fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#F7F5F0'}}>Admin Control Center</h2>
                 <span style={{color: 'var(--color-accent)', fontSize: '0.8rem', background: 'rgba(201, 168, 107, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(201,168,107,0.3)'}}>
                     Live Sync Active
                 </span>
             </div>
             {onNavigateHome && (
                 <button
                   onClick={onNavigateHome}
                   style={{
                     display: 'inline-flex',
                     alignItems: 'center',
                     gap: '6px',
                     padding: '0.45rem 0.9rem',
                     borderRadius: '8px',
                     cursor: 'pointer',
                     background: 'rgba(255,255,255,0.05)',
                     border: '1px solid rgba(201, 168, 107, 0.3)',
                     color: '#DEC085',
                     fontSize: '0.85rem',
                     fontWeight: 600,
                     transition: 'all 0.2s'
                   }}
                   onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201, 168, 107, 0.15)'}
                   onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                   title="Browse customer homepage while remaining logged in as Admin"
                 >
                   <Globe size={15} /> View Customer Website
                 </button>
             )}
         </div>
         
         <div style={{display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.4)', padding: '0.4rem', borderRadius: '10px', border: '1px solid rgba(201, 168, 107, 0.2)'}}>
            <button 
                onClick={() => setActiveTab('overview')}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer',
                    color: activeTab === 'overview' ? '#0A0D0B' : '#F7F5F0',
                    background: activeTab === 'overview' ? 'linear-gradient(135deg, #C9A86B, #DEC085)' : 'transparent',
                    fontWeight: activeTab === 'overview' ? 700 : 500,
                    transition: 'all 0.2s', border: 'none'
                }}>
                <LayoutDashboard size={18} /> Dashboard & Orders ({orders.length})
            </button>
            <button 
                onClick={() => setActiveTab('reservations')}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer',
                    color: activeTab === 'reservations' ? '#0A0D0B' : '#F7F5F0',
                    background: activeTab === 'reservations' ? 'linear-gradient(135deg, #C9A86B, #DEC085)' : 'transparent',
                    fontWeight: activeTab === 'reservations' ? 700 : 500,
                    transition: 'all 0.2s', border: 'none'
                }}>
                <Calendar size={18} /> Table Bookings ({reservations.length})
            </button>
            <button 
                onClick={() => setActiveTab('menu')}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer',
                    color: activeTab === 'menu' ? '#0A0D0B' : '#F7F5F0',
                    background: activeTab === 'menu' ? 'linear-gradient(135deg, #C9A86B, #DEC085)' : 'transparent',
                    fontWeight: activeTab === 'menu' ? 700 : 500,
                    transition: 'all 0.2s', border: 'none'
                }}>
                <Utensils size={18} /> Menu Items ({menuItems.length})
            </button>
         </div>
      </div>
      
      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW & FOOD ORDERS (WITH ITEMS DISPLAYED)      */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
          <>
          {/* Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '2.5rem' }}>
              <div style={{ background: 'var(--color-surface-light)', padding: '1.5rem', borderRadius: '12px', border: 'var(--glass-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                  <div>
                      <p style={{margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.85rem'}}>Total Revenue</p>
                      <h3 style={{margin: 0, color: 'var(--color-accent)', fontSize: '1.8rem'}}>₹{totalRevenue.toFixed(2)}</h3>
                  </div>
                  <div style={{background: 'rgba(201, 168, 107, 0.15)', padding: '0.8rem', borderRadius: '50%', color: 'var(--color-accent)'}}>
                      <TrendingUp size={22} />
                  </div>
              </div>

              <div style={{ background: 'var(--color-surface-light)', padding: '1.5rem', borderRadius: '12px', border: 'var(--glass-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                  <div>
                      <p style={{margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.85rem'}}>Total Orders</p>
                      <h3 style={{margin: 0, fontSize: '1.8rem'}}>{totalOrders}</h3>
                  </div>
                  <div style={{background: 'rgba(255, 255, 255, 0.05)', padding: '0.8rem', borderRadius: '50%', color: 'var(--color-text-muted)'}}>
                      <ShoppingBag size={22} />
                  </div>
              </div>

              <div style={{ background: 'var(--color-surface-light)', padding: '1.5rem', borderRadius: '12px', border: 'var(--glass-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                  <div>
                      <p style={{margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.85rem'}}>Avg. Order Value</p>
                      <h3 style={{margin: 0, fontSize: '1.8rem'}}>₹{averageOrderValue.toFixed(2)}</h3>
                  </div>
                  <div style={{background: 'rgba(255, 255, 255, 0.05)', padding: '0.8rem', borderRadius: '50%', color: 'var(--color-text-muted)'}}>
                      <DollarSign size={22} />
                  </div>
              </div>

              <div style={{ background: 'var(--color-surface-light)', padding: '1.5rem', borderRadius: '12px', border: 'var(--glass-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                  <div>
                      <p style={{margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.85rem'}}>Table Reservations</p>
                      <h3 style={{margin: 0, fontSize: '1.8rem', color: '#DEC085'}}>{reservations.length}</h3>
                  </div>
                  <div style={{background: 'rgba(201, 168, 107, 0.15)', padding: '0.8rem', borderRadius: '50%', color: '#DEC085'}}>
                      <Calendar size={22} />
                  </div>
              </div>
          </div>

          {/* Revenue Chart */}
          <div style={{ background: 'var(--color-surface-light)', padding: '1.5rem', borderRadius: '12px', border: 'var(--glass-border)', marginBottom: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <h3 style={{marginBottom: '1.5rem', fontSize: '1.1rem', color: '#F7F5F0'}}>Revenue Overview (Last 7 Days)</h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip 
                      contentStyle={{ background: '#121814', border: '1px solid #C9A86B', borderRadius: '8px' }} 
                      formatter={(val) => [`₹${Number(val).toFixed(2)}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>
          
          {/* Recent Orders Table with Food Items! */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem'}}>
            <h3 style={{margin: 0, fontSize: '1.3rem', color: '#F7F5F0'}}>
              Food Orders & Kitchen Operations
            </h3>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <span style={{fontSize: '0.85rem', color: 'var(--color-text-muted)'}}>
                Showing {orders.length} total orders
              </span>
            </div>
          </div>

          {/* BATCH ORDERS FLOATING ACTION TOOLBAR */}
          {selectedOrderIds.size > 0 && (
            <div style={{
              position: 'sticky',
              top: '80px',
              zIndex: 100,
              marginBottom: '1rem',
              padding: '0.8rem 1.2rem',
              background: 'rgba(18, 24, 20, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid #C9A86B',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.8rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#C9A86B', color: '#0A0D0B', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                  {selectedOrderIds.size} Orders Selected
                </span>
                <span style={{ color: '#F7F5F0', fontSize: '0.85rem' }}>Batch Actions:</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Set Status:</span>
                <button onClick={() => handleBatchOrderChangeStatus('accepted')} style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3B82F6', color: '#60A5FA', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Accepted / Cooking</button>
                <button onClick={() => handleBatchOrderChangeStatus('out_for_delivery')} style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid #A855F7', color: '#C084FC', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Out For Delivery</button>
                <button onClick={() => handleBatchOrderChangeStatus('delivered')} style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22C55E', color: '#4ADE80', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Delivered</button>
                <button onClick={() => handleBatchOrderChangeStatus('cancelled')} style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', color: '#F87171', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Cancelled</button>
                <button onClick={handleBatchDeleteOrders} style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#F87171', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Trash2 size={13} /> Delete Selected</button>
                <button onClick={() => handleSelectAllOrders(false)} style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: '#9CA3AF', fontSize: '0.78rem', cursor: 'pointer' }}>Deselect</button>
              </div>
            </div>
          )}

          {orders.length === 0 ? (
              <div style={{padding: '3rem', textAlign: 'center', background: 'var(--color-surface-light)', borderRadius: '12px', color: 'var(--color-text-muted)'}}>
                No food orders placed yet. When a customer orders, details will appear here in real time.
              </div>
          ) : (
              <div style={{ background: 'var(--color-surface-light)', borderRadius: '12px', border: 'var(--glass-border)', overflow: 'hidden' }}>
                <div style={{overflowX: 'auto'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px'}}>
                      <thead>
                        <tr style={{background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                          <th style={{width: '40px', padding: '1.2rem', textAlign: 'center'}}>
                            <input
                              type="checkbox"
                              checked={orders.length > 0 && selectedOrderIds.size === orders.length}
                              onChange={(e) => handleSelectAllOrders(e.target.checked)}
                              style={{ cursor: 'pointer', transform: 'scale(1.15)', accentColor: '#C9A86B' }}
                              title="Select All Orders"
                            />
                          </th>
                          <th style={{padding: '1.2rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem'}}>Order ID</th>
                          <th style={{padding: '1.2rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem'}}>Customer & Contact</th>
                          <th style={{padding: '1.2rem', color: 'var(--color-accent)', fontWeight: 700, fontSize: '0.85rem'}}>Food Items Ordered</th>
                          <th style={{padding: '1.2rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem'}}>Delivery Destination</th>
                          <th style={{padding: '1.2rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem'}}>Status & Workflow</th>
                          <th style={{padding: '1.2rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right'}}>Total</th>
                          <th style={{padding: '1.2rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center'}}>Slip / KOT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, index) => {
                          const phone = extractPhone(order.deliveryAddress);
                          const itemsList = Array.isArray(order.items) ? order.items : [];
                          const totalItemQty = itemsList.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
                          const isSelected = selectedOrderIds.has(order.id);

                          return (
                            <tr 
                                key={order.id || `order-${index}`} 
                                style={{
                                    borderTop: '1px solid rgba(255,255,255,0.06)',
                                    background: isSelected ? 'rgba(201, 168, 107, 0.1)' : (index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'),
                                    verticalAlign: 'top'
                                }}
                            >
                              {/* Checkbox Column */}
                              <td style={{padding: '1.2rem', textAlign: 'center'}}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectOrder(order.id)}
                                  style={{ cursor: 'pointer', transform: 'scale(1.15)', accentColor: '#C9A86B' }}
                                />
                              </td>

                              {/* Order ID & Date */}
                              <td style={{padding: '1.2rem'}}>
                                <div style={{color: 'var(--color-accent)', fontWeight: 'bold', fontSize: '1rem'}}>
                                  #{formatOrderId(order.id)}
                                </div>
                                <div style={{fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px'}}>
                                  {new Date(order.date || Date.now()).toLocaleDateString()}
                                  <br/>
                                  {new Date(order.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>

                              {/* Customer Details */}
                              <td style={{padding: '1.2rem'}}>
                                <div style={{fontWeight: 600, color: '#F7F5F0', fontSize: '0.9rem'}}>
                                  {order.userEmail || 'Customer'}
                                </div>
                                {phone && (
                                  <div style={{marginTop: '6px', display: 'flex', gap: '6px', alignItems: 'center'}}>
                                    <a 
                                      href={`tel:${phone}`} 
                                      style={{fontSize: '0.78rem', color: '#93C5FD', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none'}}
                                    >
                                      <Phone size={12} /> {phone}
                                    </a>
                                    <a 
                                      href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello from Shree Restaurant regarding your order #${formatOrderId(order.id)}!`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{color: '#25D366', display: 'flex', alignItems: 'center'}}
                                      title="Message on WhatsApp"
                                    >
                                      <MessageCircle size={14} />
                                    </a>
                                  </div>
                                )}
                              </td>

                              {/* FOOD ITEMS ORDERED (EXPLICIT DISPLAY) */}
                              <td style={{padding: '1.2rem', minWidth: '240px'}}>
                                {itemsList.length === 0 ? (
                                  <span style={{color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.85rem'}}>No items listed</span>
                                ) : (
                                  <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                    <div style={{fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                                      {totalItemQty} {totalItemQty === 1 ? 'Item' : 'Items'} Total
                                    </div>
                                    {itemsList.map((item, idx) => (
                                      <div 
                                        key={idx} 
                                        style={{
                                          display: 'flex', 
                                          justifyContent: 'space-between', 
                                          alignItems: 'center',
                                          background: 'rgba(255,255,255,0.04)',
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          border: '1px solid rgba(255,255,255,0.05)',
                                          fontSize: '0.85rem'
                                        }}
                                      >
                                        <span style={{fontWeight: 600, color: '#F7F5F0'}}>
                                          <span style={{color: '#DEC085', marginRight: '6px', fontWeight: 'bold'}}>
                                            {item.quantity || 1}x
                                          </span>
                                          {item.name}
                                        </span>
                                        <span style={{color: 'var(--color-text-muted)', fontSize: '0.8rem'}}>
                                          ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(0)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>

                              {/* Delivery Destination */}
                              <td style={{padding: '1.2rem', maxWidth: '240px', fontSize: '0.85rem'}}>
                                <div style={{color: '#E5E7EB', lineHeight: '1.4'}}>
                                  {order.deliveryAddress ? order.deliveryAddress.replace(/\|\s*Mobile:.*$/i, '').trim() : 'Address not specified'}
                                </div>
                                {order.verificationKey && (
                                  <div style={{marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(217,119,6,0.2)', border: '1px solid rgba(217,119,6,0.4)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', color: '#FCD34D'}}>
                                    Delivery PIN: <strong style={{letterSpacing: '0.1em'}}>{order.verificationKey}</strong>
                                  </div>
                                )}
                              </td>

                              {/* Status & Workflow Changer */}
                              <td style={{padding: '1.2rem', minWidth: '170px'}}>
                                <select
                                  value={order.status || 'pending'}
                                  onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    background: 
                                      order.status === 'delivered' ? 'rgba(34, 197, 94, 0.2)' :
                                      order.status === 'out_for_delivery' ? 'rgba(168, 85, 247, 0.2)' :
                                      order.status === 'accepted' ? 'rgba(59, 130, 246, 0.2)' :
                                      order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.2)' :
                                      'rgba(245, 158, 11, 0.2)',
                                    color: 
                                      order.status === 'delivered' ? '#4ADE80' :
                                      order.status === 'out_for_delivery' ? '#C084FC' :
                                      order.status === 'accepted' ? '#60A5FA' :
                                      order.status === 'cancelled' ? '#F87171' :
                                      '#FBBF24'
                                  }}
                                >
                                  <option value="pending" style={{background: '#1F2937', color: '#FBBF24'}}>Pending Verification</option>
                                  <option value="accepted" style={{background: '#1F2937', color: '#60A5FA'}}>Accepted / Cooking</option>
                                  <option value="out_for_delivery" style={{background: '#1F2937', color: '#C084FC'}}>Out For Delivery</option>
                                  <option value="delivered" style={{background: '#1F2937', color: '#4ADE80'}}>Delivered</option>
                                  <option value="cancelled" style={{background: '#1F2937', color: '#F87171'}}>Cancelled</option>
                                </select>
                                <div style={{fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px'}}>
                                  Change to update customer
                                </div>
                              </td>

                              {/* Total Price */}
                              <td style={{padding: '1.2rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', color: '#F7F5F0'}}>
                                ₹{Number(order.total ?? order.totalAmount ?? 0).toFixed(2)}
                              </td>

                              {/* View KOT / Slip */}
                              <td style={{padding: '1.2rem', textAlign: 'center'}}>
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  title="View Kitchen Slip & Delivery Details"
                                  style={{
                                    background: 'rgba(201, 168, 107, 0.15)',
                                    border: '1px solid rgba(201, 168, 107, 0.3)',
                                    color: '#DEC085',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201, 168, 107, 0.3)'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(201, 168, 107, 0.15)'}
                                >
                                  <FileText size={15} /> KOT Slip
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                </div>
              </div>
          )}
          </>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TABLE RESERVATIONS (WHERE CUSTOMER BOOKINGS GO)  */}
      {/* ======================================================== */}
      {activeTab === 'reservations' && (
        <div className="animate-on-load">
          {/* Top reservation metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--color-surface-light)', padding: '1.2rem', borderRadius: '10px', border: 'var(--glass-border)' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Total Bookings</span>
              <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.8rem', color: '#DEC085' }}>{reservations.length}</h3>
            </div>
            <div style={{ background: 'var(--color-surface-light)', padding: '1.2rem', borderRadius: '10px', border: 'var(--glass-border)' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Total Guests Expected</span>
              <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.8rem', color: '#F7F5F0' }}>
                {reservations.reduce((sum, r) => sum + (Number(r.guests) || 1), 0)}
              </h3>
            </div>
            <div style={{ background: 'var(--color-surface-light)', padding: '1.2rem', borderRadius: '10px', border: 'var(--glass-border)' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Confirmed Tables</span>
              <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.8rem', color: '#4ADE80' }}>
                {reservations.filter(r => (r.status || 'confirmed') === 'confirmed').length}
              </h3>
            </div>
            <div style={{ background: 'var(--color-surface-light)', padding: '1.2rem', borderRadius: '10px', border: 'var(--glass-border)' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Completed / Seated</span>
              <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.8rem', color: '#93C5FD' }}>
                {reservations.filter(r => r.status === 'seated' || r.status === 'completed').length}
              </h3>
            </div>
          </div>

          {/* Search & Filter Header */}
          <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem'}}>
            <div style={{position: 'relative', width: '300px'}}>
              <Search size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)'}} />
              <input 
                type="text" 
                placeholder="Search guest, code, or phone..." 
                value={resSearchQuery}
                onChange={(e) => setResSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem 0.6rem 2.4rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(201,168,107,0.25)',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#F7F5F0',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{display: 'flex', gap: '0.4rem'}}>
              {['all', 'confirmed', 'seated', 'completed', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setResStatusFilter(status)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    border: resStatusFilter === status ? '1px solid #C9A86B' : '1px solid rgba(255,255,255,0.1)',
                    background: resStatusFilter === status ? 'rgba(201, 168, 107, 0.2)' : 'transparent',
                    color: resStatusFilter === status ? '#DEC085' : '#B2ADA3'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* BATCH RESERVATIONS FLOATING ACTION TOOLBAR */}
          {selectedResIds.size > 0 && (
            <div style={{
              position: 'sticky',
              top: '80px',
              zIndex: 100,
              marginBottom: '1rem',
              padding: '0.8rem 1.2rem',
              background: 'rgba(18, 24, 20, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid #C9A86B',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.8rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#C9A86B', color: '#0A0D0B', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                  {selectedResIds.size} Bookings Selected
                </span>
                <span style={{ color: '#F7F5F0', fontSize: '0.85rem' }}>Batch Actions:</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Set Status:</span>
                <button onClick={() => handleBatchResChangeStatus('confirmed')} style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(201, 168, 107, 0.2)', border: '1px solid #C9A86B', color: '#DEC085', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Confirmed</button>
                <button onClick={() => handleBatchResChangeStatus('seated')} style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3B82F6', color: '#60A5FA', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Seated at Table</button>
                <button onClick={() => handleBatchResChangeStatus('completed')} style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22C55E', color: '#4ADE80', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Dining Completed</button>
                <button onClick={() => handleBatchResChangeStatus('cancelled')} style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', color: '#F87171', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Cancelled</button>
                <button onClick={handleBatchDeleteRes} style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#F87171', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Trash2 size={13} /> Delete Selected</button>
                <button onClick={() => handleSelectAllRes(false)} style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: '#9CA3AF', fontSize: '0.78rem', cursor: 'pointer' }}>Deselect</button>
              </div>
            </div>
          )}

          {/* Reservations List */}
          {filteredReservations.length === 0 ? (
            <div style={{padding: '3rem', textAlign: 'center', background: 'var(--color-surface-light)', borderRadius: '12px', color: 'var(--color-text-muted)'}}>
              {resSearchQuery ? 'No reservations match your search.' : 'No table reservations received yet. Bookings made on the website will be displayed here.'}
            </div>
          ) : (
            <div style={{ background: 'var(--color-surface-light)', borderRadius: '12px', border: 'var(--glass-border)', overflow: 'hidden' }}>
              <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px'}}>
                  <thead>
                    <tr style={{background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                      <th style={{width: '40px', padding: '1.2rem', textAlign: 'center'}}>
                        <input
                          type="checkbox"
                          checked={filteredReservations.length > 0 && selectedResIds.size === filteredReservations.length}
                          onChange={(e) => handleSelectAllRes(e.target.checked)}
                          style={{ cursor: 'pointer', transform: 'scale(1.15)', accentColor: '#C9A86B' }}
                          title="Select All Bookings"
                        />
                      </th>
                      <th style={{padding: '1.2rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem'}}>Code</th>
                      <th style={{padding: '1.2rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem'}}>Guest Name & Contact</th>
                      <th style={{padding: '1.2rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem'}}>Date & Time</th>
                      <th style={{padding: '1.2rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem'}}>Guests & Experience</th>
                      <th style={{padding: '1.2rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem'}}>Special Requests</th>
                      <th style={{padding: '1.2rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem'}}>Status</th>
                      <th style={{padding: '1.2rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.map((res, index) => {
                      const isSelected = selectedResIds.has(res.id);
                      return (
                      <tr 
                        key={res.id}
                        style={{
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          background: isSelected ? 'rgba(201, 168, 107, 0.1)' : (index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'),
                          verticalAlign: 'top'
                        }}
                      >
                        <td style={{padding: '1.2rem', textAlign: 'center'}}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectRes(res.id)}
                            style={{ cursor: 'pointer', transform: 'scale(1.15)', accentColor: '#C9A86B' }}
                          />
                        </td>
                        <td style={{padding: '1.2rem'}}>
                          <span style={{color: '#DEC085', fontWeight: 'bold', letterSpacing: '0.05em', background: 'rgba(201, 168, 107, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(201, 168, 107, 0.2)'}}>
                            {res.code}
                          </span>
                        </td>
                        <td style={{padding: '1.2rem'}}>
                          <div style={{fontWeight: 'bold', color: '#F7F5F0', fontSize: '0.95rem'}}>{res.name}</div>
                          <div style={{marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <a href={`tel:${res.phone}`} style={{color: '#93C5FD', fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px'}}>
                              <Phone size={12} /> {res.phone}
                            </a>
                            <a 
                              href={`https://wa.me/${res.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${res.name}! This is Shree Restaurant regarding your table reservation ${res.code} for ${res.guests} guests on ${res.date} at ${res.time}. We look forward to hosting you!`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{color: '#25D366'}}
                              title="Message Guest on WhatsApp"
                            >
                              <MessageCircle size={15} />
                            </a>
                          </div>
                          {res.email && <div style={{color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: '2px'}}>{res.email}</div>}
                        </td>
                        <td style={{padding: '1.2rem'}}>
                          <div style={{fontWeight: 600, color: '#F7F5F0'}}>{res.date}</div>
                          <div style={{color: '#DEC085', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px'}}>
                            <Clock size={12} /> {res.time}
                          </div>
                        </td>
                        <td style={{padding: '1.2rem'}}>
                          <div style={{fontWeight: 600, color: '#F7F5F0', display: 'flex', alignItems: 'center', gap: '4px'}}>
                            <Users size={14} color="#C9A86B" /> {res.guests} Guests
                          </div>
                          <div style={{fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'capitalize', marginTop: '3px'}}>
                            {res.experience}
                          </div>
                        </td>
                        <td style={{padding: '1.2rem', maxWidth: '220px', fontSize: '0.85rem', color: '#D1D5DB'}}>
                          {res.specialRequests || <span style={{color: 'var(--color-text-muted)', fontStyle: 'italic'}}>None</span>}
                        </td>
                        <td style={{padding: '1.2rem', minWidth: '150px'}}>
                          <select
                            value={res.status || 'confirmed'}
                            onChange={(e) => handleResStatusChange(res.id, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: '1px solid rgba(255,255,255,0.15)',
                              background: 
                                res.status === 'seated' ? 'rgba(59, 130, 246, 0.2)' :
                                res.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' :
                                res.status === 'cancelled' ? 'rgba(239, 68, 68, 0.2)' :
                                'rgba(201, 168, 107, 0.2)',
                              color: 
                                res.status === 'seated' ? '#60A5FA' :
                                res.status === 'completed' ? '#4ADE80' :
                                res.status === 'cancelled' ? '#F87171' :
                                '#DEC085'
                            }}
                          >
                            <option value="confirmed" style={{background: '#1F2937', color: '#DEC085'}}>Confirmed</option>
                            <option value="seated" style={{background: '#1F2937', color: '#60A5FA'}}>Seated at Table</option>
                            <option value="completed" style={{background: '#1F2937', color: '#4ADE80'}}>Dining Completed</option>
                            <option value="cancelled" style={{background: '#1F2937', color: '#F87171'}}>Cancelled</option>
                          </select>
                        </td>
                        <td style={{padding: '1.2rem', textAlign: 'right'}}>
                          <button
                            onClick={() => handleDeleteReservation(res.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#F87171',
                              opacity: 0.7,
                              cursor: 'pointer'
                            }}
                            title="Delete Reservation"
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MENU ITEMS MANAGER                                */}
      {/* ======================================================== */}
      {activeTab === 'menu' && (
          <div className="menu-management animate-on-load">
              {/* Header Mode Switcher: Batch Studio vs Standard List */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, color: '#F7F5F0', fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>
                    Menu Management
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                    {menuItems.length} Dishes Active
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(201, 168, 107, 0.25)' }}>
                  <button
                    onClick={() => setMenuMode('batch')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      background: menuMode === 'batch' ? 'linear-gradient(135deg, #C9A86B, #DEC085)' : 'transparent',
                      color: menuMode === 'batch' ? '#0A0D0B' : '#D1D5DB',
                      boxShadow: menuMode === 'batch' ? '0 2px 10px rgba(201, 168, 107, 0.3)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Sparkles size={15} /> ⚡ Batch CRUD Studio
                  </button>
                  <button
                    onClick={() => setMenuMode('standard')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      background: menuMode === 'standard' ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: menuMode === 'standard' ? '#F7F5F0' : 'var(--color-text-muted)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Utensils size={15} /> Single Item Form View
                  </button>
                </div>
              </div>

              {menuMode === 'batch' ? (
                <BatchMenuEditor
                  menuItems={menuItems}
                  onSaveBatch={handleBatchSaveMenu}
                  onClose={() => setMenuMode('standard')}
                  onRefresh={async () => {
                    const updated = await getMenuItems();
                    setMenuItems(updated);
                  }}
                />
              ) : (
                /* Standard single-item form & list */
                <>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
                      <p style={{margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>
                        Edit dishes one-by-one or switch to <strong style={{color: 'var(--color-accent)', cursor: 'pointer', textDecoration: 'underline'}} onClick={() => setMenuMode('batch')}>Batch CRUD Studio</strong> to edit everything at once.
                      </p>
                      {!isAdding && !editingItem && (
                          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                              <div style={{position: 'relative'}}>
                                  <Search size={18} style={{position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)'}} />
                                  <input 
                                      type="text" 
                                      placeholder="Search dish or category..." 
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                      style={{padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: 'var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--color-text)', outline: 'none', width: '250px'}}
                                  />
                              </div>
                              <button className="btn btn-primary" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem'}} onClick={handleAddClick}>
                                  <Plus size={18} /> Add New Dish
                              </button>
                          </div>
                      )}
                  </div>

                  {(isAdding || editingItem) && (
                      <form onSubmit={handleSaveMenu} style={{ background: 'var(--color-surface-light)', padding: '2rem', borderRadius: '12px', border: 'var(--glass-border)', marginBottom: '2rem' }}>
                          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                              <h4>{isAdding ? 'Add New Dish' : 'Edit Dish'}</h4>
                              <button type="button" onClick={handleCancelEdit} style={{color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer'}}><X size={20}/></button>
                          </div>
                          
                          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
                              <div>
                                  <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)'}}>Dish Name</label>
                                  <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Shahi Paneer" />
                              </div>
                              <div>
                                  <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)'}}>Category</label>
                                  <input type="text" className="form-input" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Indian Rasoi" />
                              </div>
                              <div>
                                  <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)'}}>Price (₹)</label>
                                  <input type="number" step="1" min="0" className="form-input" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="e.g. 240" />
                              </div>
                          </div>
                          <div style={{marginBottom: '2rem'}}>
                              <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)'}}>Description</label>
                              <textarea className="form-input" required value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} placeholder="Detailed description of spices, ingredients..." rows={3}></textarea>
                          </div>
                          
                          <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                              <button type="button" className="btn" onClick={handleCancelEdit} style={{borderColor: 'transparent', color: 'var(--color-text-muted)'}}>Cancel</button>
                              <button type="submit" className="btn btn-primary">Save Item</button>
                          </div>
                      </form>
                  )}

                  {filteredMenuItems.length === 0 && (
                      <div style={{background: 'var(--color-surface-light)', padding: '3rem', borderRadius: '12px', textAlign: 'center', color: 'var(--color-text-muted)'}}>
                          No menu items found. {searchQuery ? 'Try a different search query.' : 'Add some dishes to start!'}
                      </div>
                  )}
                  
                  {filteredMenuItems.length > 0 && (
                      <div style={{ background: 'var(--color-surface-light)', borderRadius: '12px', border: 'var(--glass-border)', overflow: 'hidden' }}>
                        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                          <thead>
                            <tr style={{background: 'rgba(0,0,0,0.2)'}}>
                              <th style={{padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 'normal', fontSize: '0.9rem'}}>Dish</th>
                              <th style={{padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 'normal', fontSize: '0.9rem'}}>Category</th>
                              <th style={{padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 'normal', fontSize: '0.9rem'}}>Description</th>
                              <th style={{padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 'normal', fontSize: '0.9rem'}}>Price</th>
                              <th style={{padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: 'normal', fontSize: '0.9rem', textAlign: 'right'}}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredMenuItems.map((item, index) => (
                              <tr 
                                  key={item.id} 
                                  style={{
                                      borderTop: '1px solid rgba(255,255,255,0.05)',
                                      background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'
                                  }}
                              >
                                <td style={{padding: '1rem 1.5rem', fontWeight: 'bold'}}>{item.name}</td>
                                <td style={{padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--color-accent)'}}>{item.category || 'Uncategorized'}</td>
                                <td style={{padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '300px'}}>{item.desc}</td>
                                <td style={{padding: '1rem 1.5rem', color: 'var(--color-accent)'}}>₹{Number(item.price).toFixed(2)}</td>
                                <td style={{padding: '1rem 1.5rem', textAlign: 'right'}}>
                                    <div style={{display: 'flex', gap: '0.8rem', justifyContent: 'flex-end'}}>
                                        <button onClick={() => handleEditClick(item)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)'}}>
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDeleteMenu(item.id)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444'}}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                  )}
                </>
              )}
          </div>
      )}

      {/* ======================================================== */}
      {/* KITCHEN ORDER TICKET (KOT) & DELIVERY SLIP MODAL         */}
      {/* ======================================================== */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#121814',
            border: '2px solid #C9A86B',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 25px 80px rgba(0,0,0,0.9), 0 0 40px rgba(201, 168, 107, 0.2)',
            color: '#F7F5F0'
          }}>
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#B2ADA3',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            {/* Slip Header */}
            <div style={{textAlign: 'center', borderBottom: '1px dashed rgba(201, 168, 107, 0.4)', paddingBottom: '1.2rem', marginBottom: '1.5rem'}}>
              <span style={{color: '#C9A86B', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase'}}>
                Shree Restaurant • Kitchen & Delivery Slip
              </span>
              <h2 style={{fontFamily: 'var(--font-serif)', fontSize: '1.8rem', margin: '4px 0 0 0'}}>
                Order #{formatOrderId(selectedOrder.id)}
              </h2>
              <div style={{fontSize: '0.85rem', color: '#B2ADA3', marginTop: '4px'}}>
                {new Date(selectedOrder.date || Date.now()).toLocaleDateString()} at {new Date(selectedOrder.date || Date.now()).toLocaleTimeString()}
              </div>
            </div>

            {/* Customer & Delivery Contact Info */}
            <div style={{background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <span style={{color: 'var(--color-text-muted)', fontSize: '0.85rem'}}>Customer Account:</span>
                <span style={{fontWeight: 600}}>{selectedOrder.userEmail}</span>
              </div>
              <div style={{marginBottom: '8px'}}>
                <span style={{color: 'var(--color-text-muted)', fontSize: '0.85rem'}}>Delivery Address:</span>
                <div style={{fontWeight: 600, color: '#F7F5F0', marginTop: '4px', lineHeight: '1.4'}}>
                  {selectedOrder.deliveryAddress || 'No address specified'}
                </div>
              </div>
              {extractPhone(selectedOrder.deliveryAddress) && (
                <div style={{display: 'flex', gap: '10px', marginTop: '12px'}}>
                  <a
                    href={`tel:${extractPhone(selectedOrder.deliveryAddress)}`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      color: '#93C5FD',
                      padding: '8px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <Phone size={14} /> Call Customer
                  </a>
                  <a
                    href={`https://wa.me/${extractPhone(selectedOrder.deliveryAddress).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello! This is Shree Restaurant regarding your food order #${formatOrderId(selectedOrder.id)}. Your food is being prepared!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: 'rgba(37, 211, 102, 0.2)',
                      border: '1px solid rgba(37, 211, 102, 0.4)',
                      color: '#4ADE80',
                      padding: '8px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <MessageCircle size={14} /> WhatsApp Customer
                  </a>
                </div>
              )}
            </div>

            {/* Itemized Kitchen Order Items */}
            <div style={{marginBottom: '1.5rem'}}>
              <h4 style={{margin: '0 0 10px 0', color: '#DEC085', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                Dishes to Prepare & Deliver
              </h4>
              <div style={{border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem'}}>
                  <thead>
                    <tr style={{background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                      <th style={{padding: '10px', color: '#B2ADA3'}}>Dish Name</th>
                      <th style={{padding: '10px', textAlign: 'center', color: '#B2ADA3'}}>Qty</th>
                      <th style={{padding: '10px', textAlign: 'right', color: '#B2ADA3'}}>Price</th>
                      <th style={{padding: '10px', textAlign: 'right', color: '#B2ADA3'}}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, i) => (
                      <tr key={i} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                        <td style={{padding: '10px', fontWeight: 600, color: '#F7F5F0'}}>
                          {item.name}
                        </td>
                        <td style={{padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#C9A86B'}}>
                          {item.quantity || 1}
                        </td>
                        <td style={{padding: '10px', textAlign: 'right', color: '#B2ADA3'}}>
                          ₹{Number(item.price || 0).toFixed(0)}
                        </td>
                        <td style={{padding: '10px', textAlign: 'right', fontWeight: 600, color: '#F7F5F0'}}>
                          ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bill Summary & Verification PIN */}
            <div style={{background: 'rgba(23, 56, 41, 0.25)', border: '1px solid rgba(201, 168, 107, 0.3)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <span style={{fontSize: '0.8rem', color: '#B2ADA3'}}>Grand Total to Collect / Paid:</span>
                <div style={{fontSize: '1.6rem', fontWeight: 'bold', color: '#DEC085'}}>
                  ₹{Number(selectedOrder.total ?? selectedOrder.totalAmount ?? 0).toFixed(2)}
                </div>
              </div>
              {selectedOrder.verificationKey && (
                <div style={{textAlign: 'right'}}>
                  <span style={{fontSize: '0.75rem', color: '#B2ADA3'}}>Customer Delivery PIN:</span>
                  <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#FCD34D', letterSpacing: '0.15em'}}>
                    {selectedOrder.verificationKey}
                  </div>
                </div>
              )}
            </div>

            {/* Status Workflow Selector inside modal */}
            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', fontSize: '0.85rem', color: '#B2ADA3', marginBottom: '6px'}}>
                Update Order Status:
              </label>
              <select
                value={selectedOrder.status || 'pending'}
                onChange={(e) => handleOrderStatusChange(selectedOrder.id, e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid #C9A86B',
                  background: '#1F2937',
                  color: '#F7F5F0'
                }}
              >
                <option value="pending">🟡 Pending Verification</option>
                <option value="accepted">🔵 Accepted / In Kitchen (Cooking)</option>
                <option value="out_for_delivery">🟣 Out For Delivery</option>
                <option value="delivered">🟢 Delivered to Customer</option>
                <option value="cancelled">🔴 Cancelled</option>
              </select>
            </div>

            {/* Modal Actions */}
            <div style={{display: 'flex', gap: '1rem'}}>
              <button
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#F7F5F0',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Printer size={16} /> Print KOT Slip
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #C9A86B, #DEC085)',
                  border: 'none',
                  color: '#0A0D0B',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
