// db.js - Mock database using localStorage

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

export const saveOrder = (userId, userEmail, items, total, deliveryAddress = null, utr = null) => {
  initializeDB();
  const orders = JSON.parse(localStorage.getItem('orders'));
  
  const newOrder = {
    id: `ord-${Date.now()}`,
    userId,
    userEmail,
    items,
    total,
    deliveryAddress,
    utr,
    date: new Date().toISOString()
  };

  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
  
  // Dispatch custom event for same-tab notification
  window.dispatchEvent(new CustomEvent('newOrderPlaced', { detail: newOrder }));
  
  return newOrder;
};

export const getUserOrders = (userId) => {
  initializeDB();
  const orders = JSON.parse(localStorage.getItem('orders'));
  return orders.filter(o => o.userId === userId).sort((a,b) => new Date(b.date) - new Date(a.date));
};

export const getAllOrders = () => {
  initializeDB();
  return JSON.parse(localStorage.getItem('orders')).sort((a,b) => new Date(b.date) - new Date(a.date));
};

// --- Menu Items CRUD ---

export const getMenuItems = () => {
  initializeDB();
  return JSON.parse(localStorage.getItem('menuItems'));
};

export const addMenuItem = (name, desc, price, category = 'Uncategorized') => {
  initializeDB();
  const items = JSON.parse(localStorage.getItem('menuItems'));
  const newItem = {
    id: `menu-${Date.now()}`,
    name,
    desc,
    price: Number(price),
    category
  };
  items.push(newItem);
  localStorage.setItem('menuItems', JSON.stringify(items));
  return newItem;
};

export const updateMenuItem = (id, name, desc, price, category = 'Uncategorized') => {
  initializeDB();
  const items = JSON.parse(localStorage.getItem('menuItems'));
  const index = items.findIndex(i => i.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], name, desc, price: Number(price), category };
    localStorage.setItem('menuItems', JSON.stringify(items));
    return items[index];
  }
  throw new Error('Menu item not found');
};

export const deleteMenuItem = (id) => {
  initializeDB();
  let items = JSON.parse(localStorage.getItem('menuItems'));
  items = items.filter(i => i.id !== id);
  localStorage.setItem('menuItems', JSON.stringify(items));
};
