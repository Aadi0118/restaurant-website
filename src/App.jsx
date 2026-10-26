import { useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
import './App.css'
import './Order.css'
import Login from './components/Login'
import OrderMenu from './components/OrderMenu'
import Cart from './components/Cart'
import OrderHistory from './components/OrderHistory'
import OrderSuccess from './components/OrderSuccess'
import AdminDashboard from './components/AdminDashboard'
import PaymentCallback from './components/PaymentCallback'
import { getMenuItems, saveOrder } from './services/db'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Menu, X, ArrowLeft, LayoutDashboard, Globe } from 'lucide-react';
import { CinematicHomepage } from './components/CinematicHomepage';


function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'login', 'order', 'cart', 'history', 'admin'
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [homeMenuItems, setHomeMenuItems] = useState([]);
  const [lastOrderDetails, setLastOrderDetails] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [homeSelectedCategory, setHomeSelectedCategory] = useState(null);

  
  const taglines = [
    { title: "Experience Culinary Excellence", subtitle: "Where tradition meets modern gastronomy." },
    { title: "A Symphony of Flavors", subtitle: "Crafted with passion, served with love." },
    { title: "Savor the Moment", subtitle: "Unforgettable dining experiences await." },
    { title: "Authentic & Elegant", subtitle: "Redefining fine dining in Rishikesh." }
  ];
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [fade, setFade] = useState('fade-in');

  useEffect(() => {
    const interval = setInterval(() => {
      setFade('fade-out');
      setTimeout(() => {
        setTaglineIndex((prev) => (prev + 1) % taglines.length);
        setFade('fade-in');
      }, 500); // 500ms fade out before changing text
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getMenuItems().then(setHomeMenuItems).catch(console.error);
  }, [currentView]);

  // Restore session
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('view') === 'payment-callback') {
        setCurrentView('payment-callback');
      } else if (parsedUser.role === 'admin') {
        setCurrentView('admin');
      }
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('view') === 'payment-callback') {
        setCurrentView('payment-callback');
      }
    }
  }, []);

  // Fallback for browsers that do not support scroll-driven animations
  useEffect(() => {
    if (typeof CSS !== 'undefined' && !CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('fallback-visible');
              observer.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.1 }
      );

      const timeoutId = setTimeout(() => {
        document.querySelectorAll('.animate-on-scroll').forEach((el) => {
          observer.observe(el);
        });
      }, 50);

      return () => {
        clearTimeout(timeoutId);
        observer.disconnect();
      };
    }
  }, [currentView, homeMenuItems]);

  const navigateWithTransition = (updateFunc) => {
    if (!document.startViewTransition) {
      updateFunc();
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => {
        updateFunc();
        setIsMobileMenuOpen(false);
      });
    });
  };

  const handleStartOrder = () => {
    navigateWithTransition(() => {
      if (user) {
        if (user.role === 'admin') setCurrentView('admin');
        else setCurrentView('order');
      } else {
        setCurrentView('login');
      }
    });
  };

  const handleLogin = (userData) => {
    navigateWithTransition(() => {
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      if (userData.role === 'admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('order');
      }
    });
  };

  const handleLogout = () => {
    navigateWithTransition(() => {
      setUser(null);
      setCartItems([]);
      localStorage.removeItem('currentUser');
      setCurrentView('home');
    });
  };

  const handleAddToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const groupedHomeMenu = homeMenuItems.reduce((acc, item) => {
    const cat = item.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
  const homeCategories = Object.keys(groupedHomeMenu);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo" onClick={() => navigateWithTransition(() => setCurrentView('home'))} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', letterSpacing: '0.08em' }}>SHREE</span>
          <span style={{ fontSize: '0.78rem', color: '#b8a8a1', fontWeight: 300, letterSpacing: '0.12em' }}>• RESTAURANT</span>
        </div>
        
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <ul className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {currentView === 'home' && (
            <>
              <li><a href="#alchemy" onClick={() => setIsMobileMenuOpen(false)}>About Us</a></li>
              <li><a href="#menu" onClick={() => setIsMobileMenuOpen(false)}>Our Menu</a></li>
              <li><a href="#location" onClick={() => setIsMobileMenuOpen(false)}>Destination</a></li>
            </>
          )}
          {currentView !== 'home' && user?.role !== 'admin' && (
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigateWithTransition(() => setCurrentView('order')); }}>Menu</a></li>
          )}
          {user && user.role !== 'admin' && (
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigateWithTransition(() => setCurrentView('history')); }}>Past Orders</a></li>
          )}
          {user?.role === 'admin' && (
            <li>
              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  navigateWithTransition(() => setCurrentView('admin')); 
                }}
                style={{
                  color: currentView === 'admin' ? 'var(--color-accent)' : '#DEC085',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <LayoutDashboard size={15} /> Dashboard
              </a>
            </li>
          )}
        </ul>
        <div className="nav-actions">
          {user ? (
            <>
              {user.role === 'admin' && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigateWithTransition(() => setCurrentView('admin'))} 
                  style={{ 
                    marginRight: '0.8rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.6rem 1.2rem',
                    fontWeight: 700,
                    background: currentView === 'admin' ? 'linear-gradient(135deg, #C9A86B, #DEC085)' : 'rgba(201, 168, 107, 0.2)',
                    border: '1px solid #C9A86B',
                    color: currentView === 'admin' ? '#0A0D0B' : '#DEC085',
                    cursor: 'pointer'
                  }}
                >
                  <LayoutDashboard size={16} /> Admin Dashboard
                </button>
              )}
              {user.role !== 'admin' && (
                <button className="btn btn-secondary" onClick={() => navigateWithTransition(() => setCurrentView('cart'))} style={{ marginRight: '1rem' }}>
                  Cart ({cartItemCount})
                </button>
              )}
              <span style={{ marginRight: '1rem', color: 'var(--color-text-muted)' }}>Hello, {user.name}</span>
              <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={handleStartOrder}>Order Online</button>
          )}
        </div>
      </nav>

      {/* FLOATING QUICK RETURN FOR ADMIN WHEN BROWSING THE CUSTOMER SITE */}
      {user?.role === 'admin' && currentView !== 'admin' && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 16px',
          background: '#121814',
          border: '2px solid #C9A86B',
          borderRadius: '50px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 25px rgba(201, 168, 107, 0.4)'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#B2ADA3', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
            Admin Active
          </span>
          <button
            onClick={() => navigateWithTransition(() => setCurrentView('admin'))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #C9A86B, #DEC085)',
              color: '#0A0D0B',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '30px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <LayoutDashboard size={15} /> Return to Dashboard
          </button>
        </div>
      )}

      <main className="main-content" style={currentView !== 'home' ? { paddingTop: '120px', minHeight: '100vh' } : {}}>
        {currentView === 'home' && (
          <CinematicHomepage
            onAddToCart={handleAddToCart}
            onNavigateOrder={handleStartOrder}
            homeMenuItems={homeMenuItems}
          />
        )}


        {currentView === 'login' && <Login onLogin={handleLogin} />}
        {currentView === 'order' && <OrderMenu onAddToCart={handleAddToCart} />}
        {currentView === 'cart' && <Cart cartItems={cartItems} user={user} onCheckout={() => { setCartItems([]); setCurrentView('history'); }} />}
        {currentView === 'history' && <OrderHistory user={user} />}
        {currentView === 'success' && (
          <OrderSuccess 
            orderDetails={lastOrderDetails} 
            onContinue={() => navigateWithTransition(() => setCurrentView('history'))} 
          />
        )}
        {currentView === 'admin' && <AdminDashboard onNavigateHome={() => navigateWithTransition(() => setCurrentView('home'))} />}

        {currentView === 'payment-callback' && (
          <PaymentCallback 
            user={user} 
            onComplete={(orderDetails) => {
              navigateWithTransition(() => {
                if (orderDetails) {
                  setLastOrderDetails(orderDetails);
                  setCartItems([]);
                  setCurrentView('success');
                } else {
                  setCurrentView('cart');
                }
              });
            }} 
          />
        )}
      </main>
    </div>
  )
}

export default App
