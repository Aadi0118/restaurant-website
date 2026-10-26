// db.js - Resilient database with LocalStorage cache and Render API synchronization

const API_BASE = 'https://restaurant-website-8vnp.onrender.com/api';

const initializeDB = () => {
  let users = JSON.parse(localStorage.getItem('users') || 'null');
  if (!users) {
    users = [];
  }

  // Ensure proper admin account always exists
  const adminIndex = users.findIndex(u => u.role === 'admin');
  const properAdmin = { id: 'admin-master', email: 'admin@shreefamilyrestaurant.com', password: 'AdminPassword2026!', role: 'admin', name: 'Master Admin' };

  if (adminIndex === -1) {
    users.push(properAdmin);
    localStorage.setItem('users', JSON.stringify(users));
  } else if (users[adminIndex].password !== properAdmin.password || users[adminIndex].email !== properAdmin.email) {
    users[adminIndex] = properAdmin;
    localStorage.setItem('users', JSON.stringify(users));
  }

  if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify([]));
  }
  if (!localStorage.getItem('reservations')) {
    localStorage.setItem('reservations', JSON.stringify([]));
  }
  if (!localStorage.getItem('menuItems')) {
    localStorage.setItem('menuItems', JSON.stringify([
      { id: 'menu-1', name: 'Paneer Lababdar', desc: 'Rich tomato, butter, and cashew gravy with soft cottage cheese & kasuri methi.', price: 260, category: 'Main Course' },
      { id: 'menu-2', name: 'Veg Biriyani', desc: 'Slow-steamed aged Basmati rice with fresh garden vegetables & Awadhi spices.', price: 200, category: 'Biryani & Rice' },
      { id: 'menu-3', name: 'Chole Bhature', desc: 'Amritsari spiced chickpeas with 2 golden crisp, fluffy bhature & pickled onions.', price: 90, category: 'Main Course' },
      { id: 'menu-4', name: 'Butter Naan', desc: 'Soft and fluffy Indian bread cooked in a tandoor with rich butter.', price: 40, category: 'Roti & Tandoor' },
      { id: 'menu-5', name: 'Garlic Naan', desc: 'Tandoor-baked flatbread topped with roasted garlic and coriander.', price: 55, category: 'Roti & Tandoor' },
      { id: 'menu-6', name: 'Dal Makhani', desc: 'Slow-cooked black lentils simmered overnight with butter and fresh cream.', price: 220, category: 'Main Course' }
    ]));
  }
};

export const registerUser = (email, password, name = 'Customer') => {
  initializeDB();
  const users = JSON.parse(localStorage.getItem('users'));

  if (users.find(u => u.email === email)) {
    throw new Error('User already exists');
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email,
    password,
    name,
    role: 'customer'
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  return newUser;
};

export const loginUser = (email, password) => {
  initializeDB();
  const users = JSON.parse(localStorage.getItem('users'));

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  return user;
};

export const googleLoginSimulate = (email, name) => {
  initializeDB();
  const users = JSON.parse(localStorage.getItem('users'));
  let user = users.find(u => u.email === email);

  if (!user) {
    user = {
      id: `google-${Date.now()}`,
      email,
      password: 'google-oauth-placeholder',
      name,
      role: 'customer'
    };
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  }

  return user;
};

// --- ORDERS API ---

export const saveOrder = async (userId, userEmail, items, total, deliveryAddress = null, utr = null, status = 'pending', verificationKey = null) => {
  initializeDB();
  const newOrder = {
    id: `ord-${Date.now()}`,
    userId,
    userEmail,
    items: Array.isArray(items) ? items : [],
    total: Number(total),
    deliveryAddress,
    utr,
    status: status || 'pending',
    verificationKey,
    date: new Date().toISOString()
  };

  // Always save locally first so orders are never lost
  const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  localOrders.unshift(newOrder);
  localStorage.setItem('orders', JSON.stringify(localOrders));

  // Trigger cross-tab event for immediate admin notification on same machine
  window.dispatchEvent(new Event('order-updated'));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const serverOrder = await response.json();
      return serverOrder;
    }
  } catch (err) {
    console.warn('API saveOrder fallback to local storage:', err.message);
  }

  return newOrder;
};

export const updateOrderStatus = async (orderId, status) => {
  initializeDB();
  const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  const updatedOrders = localOrders.map(o => o.id === orderId ? { ...o, status } : o);
  localStorage.setItem('orders', JSON.stringify(updatedOrders));
  window.dispatchEvent(new Event('order-updated'));

  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (response.ok) return await response.json();
  } catch (err) {
    console.warn('API updateOrderStatus fallback to local storage:', err.message);
  }

  return updatedOrders.find(o => o.id === orderId);
};

export const getUserOrders = async (userId) => {
  initializeDB();
  const localOrders = JSON.parse(localStorage.getItem('orders') || '[]').filter(o => o.userId === userId);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${API_BASE}/orders/user/${userId}?t=${Date.now()}`, { 
      cache: 'no-store',
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const remoteOrders = await response.json();
      const map = new Map();
      localOrders.forEach(o => map.set(o.id, o));
      remoteOrders.forEach(o => map.set(o.id, o));
      return Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  } catch (err) {
    console.warn('API getUserOrders fallback to local storage:', err.message);
  }

  return localOrders;
};

export const getAllOrders = async () => {
  initializeDB();
  const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${API_BASE}/orders?t=${Date.now()}`, { 
      cache: 'no-store',
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const remoteOrders = await response.json();
      const map = new Map();
      localOrders.forEach(o => map.set(o.id, o));
      remoteOrders.forEach(o => map.set(o.id, o));
      const merged = Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
      localStorage.setItem('orders', JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('API getAllOrders fallback to local storage:', err.message);
  }

  return localOrders;
};

// --- RESERVATIONS API ---

export const saveReservation = async (reservationData) => {
  initializeDB();
  const localReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
  const newReservation = {
    id: `res-${Date.now()}`,
    code: reservationData.code || ('AMB-' + Math.floor(1000 + Math.random() * 9000)),
    name: reservationData.name,
    phone: reservationData.phone,
    email: reservationData.email || '',
    date: reservationData.date,
    time: reservationData.time,
    guests: Number(reservationData.guests) || 2,
    experience: reservationData.experience || 'casual',
    specialRequests: reservationData.specialRequests || '',
    status: reservationData.status || 'confirmed',
    createdAt: new Date().toISOString()
  };

  // Always save locally first so reservations are never lost
  localReservations.unshift(newReservation);
  localStorage.setItem('reservations', JSON.stringify(localReservations));

  // Trigger custom event for real-time notification
  window.dispatchEvent(new Event('reservation-updated'));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReservation),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const serverRes = await response.json();
      return serverRes;
    }
  } catch (err) {
    console.warn('API saveReservation fallback to local storage:', err.message);
  }

  return newReservation;
};

export const getAllReservations = async () => {
  initializeDB();
  const localReservations = JSON.parse(localStorage.getItem('reservations') || '[]');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${API_BASE}/reservations?t=${Date.now()}`, { 
      cache: 'no-store',
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const remoteReservations = await response.json();
      const map = new Map();
      localReservations.forEach(r => map.set(r.code || r.id, r));
      remoteReservations.forEach(r => map.set(r.code || r.id, r));
      const merged = Array.from(map.values()).sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      localStorage.setItem('reservations', JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('API getAllReservations fallback to local storage:', err.message);
  }

  return localReservations;
};

export const updateReservationStatus = async (id, status) => {
  initializeDB();
  const localReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
  const updated = localReservations.map(r => r.id === id ? { ...r, status } : r);
  localStorage.setItem('reservations', JSON.stringify(updated));
  window.dispatchEvent(new Event('reservation-updated'));

  try {
    const response = await fetch(`${API_BASE}/reservations/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (response.ok) return await response.json();
  } catch (err) {
    console.warn('API updateReservationStatus fallback to local storage:', err.message);
  }

  return updated.find(r => r.id === id);
};

export const deleteReservation = async (id) => {
  initializeDB();
  const localReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
  const filtered = localReservations.filter(r => r.id !== id);
  localStorage.setItem('reservations', JSON.stringify(filtered));
  window.dispatchEvent(new Event('reservation-updated'));

  try {
    await fetch(`${API_BASE}/reservations/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('API deleteReservation fallback to local storage:', err.message);
  }
};

// --- MENU ITEMS CRUD ---

export const getMenuItems = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${API_BASE}/menuItems`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error('Failed to fetch menu items');
    const items = await response.json();
    if (items && items.length > 0) {
      localStorage.setItem('menuItems', JSON.stringify(items));
      return items;
    }
  } catch (err) {
    console.warn('API getMenuItems fallback to local storage:', err.message);
  }
  initializeDB();
  return JSON.parse(localStorage.getItem('menuItems') || '[]');
};

export const addMenuItem = async (name, desc, price, category = 'Uncategorized') => {
  initializeDB();
  const newItem = {
    id: `menu-${Date.now()}`,
    name,
    desc,
    price: Number(price),
    category
  };

  const localItems = JSON.parse(localStorage.getItem('menuItems') || '[]');
  localItems.push(newItem);
  localStorage.setItem('menuItems', JSON.stringify(localItems));

  try {
    const response = await fetch(`${API_BASE}/menuItems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, desc, price, category })
    });
    if (response.ok) return await response.json();
  } catch (err) {
    console.warn('API addMenuItem fallback to local storage:', err.message);
  }

  return newItem;
};

export const updateMenuItem = async (id, name, desc, price, category = 'Uncategorized') => {
  initializeDB();
  const localItems = JSON.parse(localStorage.getItem('menuItems') || '[]');
  const updatedItems = localItems.map(item => item.id === id ? { ...item, name, desc, price: Number(price), category } : item);
  localStorage.setItem('menuItems', JSON.stringify(updatedItems));

  try {
    const response = await fetch(`${API_BASE}/menuItems/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, desc, price, category })
    });
    if (response.ok) return await response.json();
  } catch (err) {
    console.warn('API updateMenuItem fallback to local storage:', err.message);
  }

  return updatedItems.find(item => item.id === id);
};

export const deleteMenuItem = async (id) => {
  initializeDB();
  const localItems = JSON.parse(localStorage.getItem('menuItems') || '[]');
  const filtered = localItems.filter(item => item.id !== id);
  localStorage.setItem('menuItems', JSON.stringify(filtered));

  try {
    await fetch(`${API_BASE}/menuItems/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('API deleteMenuItem fallback to local storage:', err.message);
  }
};
