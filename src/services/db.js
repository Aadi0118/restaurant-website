// db.js - Mock database using localStorage

const API_BASE = 'https://restaurant-website-8vnp.onrender.com/api';

const initializeDB = () => {
  let users = JSON.parse(localStorage.getItem('users') || 'null');
  if (!users) {
    users = [];
  }

  // Ensure proper admin account always exists and overrides the old weak one
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
  if (!localStorage.getItem('menuItems')) {
    localStorage.setItem('menuItems', JSON.stringify([
      { id: 'menu-1', name: 'Truffle Risotto', desc: 'Arborio rice, black truffle, aged parmesan, gold leaf.', price: 45, category: 'Main Course' },
      { id: 'menu-2', name: 'Wagyu A5 Striploin', desc: 'Charred asparagus, bone marrow jus, smoked salt.', price: 120, category: 'Main Course' },
      { id: 'menu-3', name: 'Lobster Thermidor', desc: 'Cognac cream, gruyere crust, fine herbs.', price: 85, category: 'Main Course' },
      { id: 'menu-4', name: 'Butter Naan', desc: 'Soft and fluffy Indian bread cooked in a tandoor.', price: 5, category: 'Roti & Tandoor' },
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
}

export const saveOrder = async (userId, userEmail, items, total, deliveryAddress = null, utr = null, status = 'pending', verificationKey = null) => {
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, userEmail, items, total, deliveryAddress, utr, status, verificationKey })
  });
  if (!response.ok) throw new Error('Failed to create order');
  return await response.json();
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update order status');
  return await response.json();
};

export const getUserOrders = async (userId) => {
  const response = await fetch(`${API_BASE}/orders/user/${userId}?t=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch user orders');
  return await response.json();
};

export const getAllOrders = async () => {
  const response = await fetch(`${API_BASE}/orders?t=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch orders');
  return await response.json();
};

// --- Menu Items CRUD ---
const API_BASE = 'https://restaurant-website-8vnp.onrender.com/api';

export const getMenuItems = async () => {
  const response = await fetch(`${API_BASE}/menuItems`);
  if (!response.ok) throw new Error('Failed to fetch menu items');
  return await response.json();
};

export const addMenuItem = async (name, desc, price, category = 'Uncategorized') => {
  const response = await fetch(`${API_BASE}/menuItems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, desc, price, category })
  });
  if (!response.ok) throw new Error('Failed to add menu item');
  return await response.json();
};

export const updateMenuItem = async (id, name, desc, price, category = 'Uncategorized') => {
  const response = await fetch(`${API_BASE}/menuItems/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, desc, price, category })
  });
  if (!response.ok) throw new Error('Failed to update menu item');
  return await response.json();
};

export const deleteMenuItem = async (id) => {
  const response = await fetch(`${API_BASE}/menuItems/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete menu item');
};
