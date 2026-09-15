import { useState, useEffect, useRef } from 'react';
import { getAllOrders, getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '../services/db';
import { TrendingUp, ShoppingBag, DollarSign, Clock, LayoutDashboard, Utensils, Edit2, Trash2, Plus, X, ChevronDown, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'menu'
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  
  // Menu Management State
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', desc: '', price: '', category: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Alarm State
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    setOrders(getAllOrders());
    getMenuItems().then(setMenuItems).catch(console.error);

    const handleNewOrder = () => {
        setIsAlarmRinging(true);
        setOrders(getAllOrders()); // refresh orders
    };

    const handleStorage = (e) => {
        if (e.key === 'orders') {
            const oldOrders = JSON.parse(e.oldValue || '[]');
            const newOrders = JSON.parse(e.newValue || '[]');
            if (newOrders.length > oldOrders.length) {
                handleNewOrder();
            }
        }
    };

    window.addEventListener('newOrderPlaced', handleNewOrder);
    window.addEventListener('storage', handleStorage);

    return () => {
        window.removeEventListener('newOrderPlaced', handleNewOrder);
        window.removeEventListener('storage', handleStorage);
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
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  const chartDataMap = {};
  for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      chartDataMap[dateString] = 0;
  }
  orders.forEach(order => {
      const dateString = new Date(order.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (chartDataMap[dateString] !== undefined) {
          chartDataMap[dateString] += order.total;
      }
  });
  const chartData = Object.keys(chartDataMap).map(key => ({ name: key, revenue: chartDataMap[key] }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
            background: 'rgba(10, 10, 10, 0.8)',
            backdropFilter: 'blur(10px)',
            border: 'var(--glass-border)',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{label}</p>
          <p style={{ margin: 0, color: 'var(--color-accent)', fontWeight: 'bold', fontSize: '1.2rem' }}>
            ₹{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
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
      alert("Failed to save menu item. Did you restart the backend server (node server/index.js)?");
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
        alert("Failed to delete menu item. Is the backend server running?");
      }
    }
  };

  const filteredMenuItems = menuItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.category || 'Uncategorized').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="cart-container animate-on-load" style={{maxWidth: '1200px'}}>
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" loop style={{display: 'none'}} />
      
      {isAlarmRinging && (
          <div style={{
              position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
              background: '#ff4444', color: 'white', padding: '1rem 2rem', borderRadius: '8px',
              zIndex: 9999, display: 'flex', alignItems: 'center', gap: '1.5rem',
              boxShadow: '0 10px 30px rgba(255, 68, 68, 0.5)'
          }}>
              <strong style={{fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  🚨 NEW ORDER RECEIVED!
              </strong>
              <button className="btn" onClick={() => setIsAlarmRinging(false)} style={{
                  background: 'white', color: '#ff4444', border: 'none', padding: '0.5rem 1rem',
                  borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
              }}>
                  STOP ALARM
              </button>
          </div>
      )}
      
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
         <div style={{display: 'flex', alignItems: 'baseline', gap: '1rem'}}>
             <h2>Control Center</h2>
             <span style={{color: 'var(--color-accent)', fontSize: '0.8rem', background: 'rgba(212,175,55,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px'}}>
                 v2 (Render Connected)
             </span>
         </div>
         
         <div style={{display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem', borderRadius: '8px', border: 'var(--glass-border)'}}>
            <button 
                onClick={() => setActiveTab('overview')}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    padding: '0.6rem 1.2rem', borderRadius: '4px',
                    color: activeTab === 'overview' ? 'var(--color-bg)' : 'var(--color-text)',
                    background: activeTab === 'overview' ? 'var(--color-accent)' : 'transparent',
                    transition: 'all 0.3s'
                }}>
                <LayoutDashboard size={18} /> Overview
            </button>
            <button 
                onClick={() => setActiveTab('menu')}
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    padding: '0.6rem 1.2rem', borderRadius: '4px',
                    color: activeTab === 'menu' ? 'var(--color-bg)' : 'var(--color-text)',
                    background: activeTab === 'menu' ? 'var(--color-accent)' : 'transparent',
                    transition: 'all 0.3s'
                }}>
                <Utensils size={18} /> Menu Manager
            </button>
         </div>
      </div>
      
      {activeTab === 'overview' ? (
          <>
          {/* Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div style={{ background: 'var(--color-surface-light)', padding: '1.5rem', borderRadius: '12px', border: 'var(--glass-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                  <div>
                      <p style={{margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>Total Revenue</p>
                      <h3 style={{margin: 0, color: 'var(--color-accent)', fontSize: '2rem'}}>₹{totalRevenue.toFixed(2)}</h3>
                  </div>
                  <div style={{background: 'rgba(212, 175, 55, 0.1)', padding: '0.8rem', borderRadius: '50%', color: 'var(--color-accent)'}}>
                      <TrendingUp size={24} />
                  </div>
              </div>

              <div style={{ background: 'var(--color-surface-light)', padding: '1.5rem', borderRadius: '12px', border: 'var(--glass-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                  <div>
                      <p style={{margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>Total Orders</p>
                      <h3 style={{margin: 0, fontSize: '2rem'}}>{totalOrders}</h3>
                  </div>
                  <div style={{background: 'rgba(255, 255, 255, 0.05)', padding: '0.8rem', borderRadius: '50%', color: 'var(--color-text-muted)'}}>
                      <ShoppingBag size={24} />
                  </div>
              </div>

              <div style={{ background: 'var(--color-surface-light)', padding: '1.5rem', borderRadius: '12px', border: 'var(--glass-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                  <div>
                      <p style={{margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>Avg. Order Value</p>
                      <h3 style={{margin: 0, fontSize: '2rem'}}>₹{averageOrderValue.toFixed(2)}</h3>
                  </div>
                  <div style={{background: 'rgba(255, 255, 255, 0.05)', padding: '0.8rem', borderRadius: '50%', color: 'var(--color-text-muted)'}}>
                      <DollarSign size={24} />
                  </div>
              </div>
          </div>

          {/* Revenue Chart */}
          <div style={{ background: 'var(--color-surface-light)', padding: '2rem', borderRadius: '12px', border: 'var(--glass-border)', marginBottom: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <h3 style={{marginBottom: '2rem', fontSize: '1.2rem'}}>Revenue Overview (Last 7 Days)</h3>
              <div style={{ width: '100%', height: 300 }}>
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
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>
          
          {/* Recent Orders Table */}
          <h3 style={{marginBottom: '1rem', fontSize: '1.2rem'}}>Recent Orders</h3>
          {orders.length === 0 ? (
              <p>No orders have been placed yet.</p>
          ) : (
              <div style={{ background: 'var(--color-surface-light)', borderRadius: '12px', border: 'var(--glass-border)', overflow: 'hidden' }}>
                <div style={{overflowX: 'auto'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                      <thead>
                        <tr style={{background: 'rgba(0,0,0,0.2)'}}>
                          <th style={{padding: '1.5rem', color: 'var(--color-text-muted)', fontWeight: 'normal', fontSize: '0.9rem'}}>Order ID</th>
                          <th style={{padding: '1.5rem', color: 'var(--color-text-muted)', fontWeight: 'normal', fontSize: '0.9rem'}}>Date</th>
                          <th style={{padding: '1.5rem', color: 'var(--color-text-muted)', fontWeight: 'normal', fontSize: '0.9rem'}}>Customer</th>
                          <th style={{padding: '1.5rem', color: 'var(--color-text-muted)', fontWeight: 'normal', fontSize: '0.9rem'}}>Delivery & Payment</th>
                          <th style={{padding: '1.5rem', color: 'var(--color-text-muted)', fontWeight: 'normal', fontSize: '0.9rem', textAlign: 'right'}}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, index) => (
                          <tr 
                              key={order.id} 
                              style={{
                                  borderTop: '1px solid rgba(255,255,255,0.05)',
                                  transition: 'background 0.2s',
                                  background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.05)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'}
                          >
                            <td style={{padding: '1.5rem', color: 'var(--color-accent)', fontWeight: 'bold'}}>#{order.id.split('-')[1].slice(-6)}</td>
                            <td style={{padding: '1.5rem', fontSize: '0.9rem'}}>{new Date(order.date).toLocaleDateString()} <br/><span style={{color: 'var(--color-text-muted)', fontSize: '0.8rem'}}>{new Date(order.date).toLocaleTimeString()}</span></td>
                            <td style={{padding: '1.5rem'}}>{order.userEmail}</td>
                            <td style={{padding: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '250px'}}>
                                <div>{order.deliveryAddress || 'N/A'}</div>
                                {order.utr && (
                                    <div style={{marginTop: '0.5rem', color: 'var(--color-accent)', fontWeight: 'bold'}}>
                                        UTR: {order.utr}
                                    </div>
                                )}
                            </td>
                            <td style={{padding: '1.5rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem'}}>₹{order.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </div>
          )}
          </>
      ) : (
          /* MENU MANAGEMENT TAB */
          <div className="menu-management animate-on-load">
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                  <h3 style={{margin: 0}}>Manage Menu Items</h3>
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
                          <button type="button" onClick={handleCancelEdit} style={{color: 'var(--color-text-muted)'}}><X size={20}/></button>
                      </div>
                      
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
                          <div>
                              <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)'}}>Dish Name</label>
                              <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Lobster Thermidor" />
                          </div>
                          <div>
                              <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)'}}>Category</label>
                              <input type="text" className="form-input" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Roti & Tandoor" />
                          </div>
                          <div>
                              <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)'}}>Price (₹)</label>
                              <input type="number" step="0.01" min="0" className="form-input" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="e.g. 45.00" />
                          </div>
                      </div>
                      <div style={{marginBottom: '2rem'}}>
                          <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)'}}>Description</label>
                          <textarea className="form-input" required value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} placeholder="Detailed description of the dish..." rows={3}></textarea>
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
                                  transition: 'background 0.2s',
                                  background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.05)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'}
                          >
                            <td style={{padding: '1rem 1.5rem', fontWeight: 'bold'}}>{item.name}</td>
                            <td style={{padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--color-accent)'}}>{item.category || 'Uncategorized'}</td>
                            <td style={{padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '300px'}}>{item.desc}</td>
                            <td style={{padding: '1rem 1.5rem', color: 'var(--color-accent)'}}>₹{Number(item.price).toFixed(2)}</td>
                            <td style={{padding: '1rem 1.5rem', textAlign: 'right'}}>
                                <div style={{display: 'flex', gap: '0.8rem', justifyContent: 'flex-end'}}>
                                    <button onClick={() => handleEditClick(item)} style={{color: 'var(--color-text-muted)', transition: 'color 0.2s'}} onMouseEnter={(e)=>e.currentTarget.style.color='var(--color-text)'} onMouseLeave={(e)=>e.currentTarget.style.color='var(--color-text-muted)'}>
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDeleteMenu(item.id)} style={{color: '#ff4444', opacity: 0.7, transition: 'opacity 0.2s'}} onMouseEnter={(e)=>e.currentTarget.style.opacity=1} onMouseLeave={(e)=>e.currentTarget.style.opacity=0.7}>
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
          </div>
      )}
    </div>
  );
}
