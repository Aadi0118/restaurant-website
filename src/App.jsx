import { useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
import './App.css'
import './Order.css'
import heroImg from './assets/hero_bg.jpg'
import dishImg from './assets/signature_dish.jpg'
import Login from './components/Login'
import OrderMenu from './components/OrderMenu'
import Cart from './components/Cart'
import OrderHistory from './components/OrderHistory'
import OrderSuccess from './components/OrderSuccess'
import AdminDashboard from './components/AdminDashboard'
import PaymentCallback from './components/PaymentCallback'
import { getMenuItems, saveOrder } from './services/db'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Menu, X } from 'lucide-react';


function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'login', 'order', 'cart', 'history', 'admin'
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [homeMenuItems, setHomeMenuItems] = useState([]);
  const [lastOrderDetails, setLastOrderDetails] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
    setHomeMenuItems(getMenuItems());
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

      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        observer.observe(el);
      });

      return () => observer.disconnect();
    }
  }, [currentView]);

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

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo" onClick={() => navigateWithTransition(() => setCurrentView('home'))} style={{ cursor: 'pointer' }}>Shree Family Restaurant</div>
        
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <ul className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {currentView === 'home' && (
            <>
              <li><a href="#menu" onClick={() => setIsMobileMenuOpen(false)}>Menu</a></li>
              <li><a href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</a></li>
              <li><a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</a></li>
            </>
          )}
          {currentView !== 'home' && user?.role !== 'admin' && (
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigateWithTransition(() => setCurrentView('order')); }}>Menu</a></li>
          )}
          {user && user.role !== 'admin' && (
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigateWithTransition(() => setCurrentView('history')); }}>Past Orders</a></li>
          )}
        </ul>
        <div className="nav-actions">
          {user ? (
            <>
              {user.role !== 'admin' && (
                <button className="btn btn-secondary" onClick={() => navigateWithTransition(() => setCurrentView('cart'))} style={{ marginRight: '1rem' }}>
                  Cart ({cartItemCount})
                </button>
              )}
              <span style={{ marginRight: '1rem', color: 'var(--color-text-muted)' }}>Hello, {user.name}</span>
              <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={handleStartOrder}>Order Now</button>
          )}
        </div>
      </nav>

      <main className="main-content" style={currentView !== 'home' ? { paddingTop: '120px', minHeight: '100vh' } : {}}>
        {currentView === 'home' && (
          <>
            <section className="hero">
              <div className="hero-background parallax-layer" style={{ backgroundImage: `url(${heroImg})` }}></div>
              <div className="hero-overlay"></div>
              <div className="hero-content">
                <div className={`tagline-container ${fade}`} style={{ transition: 'opacity 0.5s ease-in-out', opacity: fade === 'fade-in' ? 1 : 0 }}>
                  <h1>{taglines[taglineIndex].title}</h1>
                  <p>{taglines[taglineIndex].subtitle}</p>
                </div>
                <button className="btn btn-primary" onClick={handleStartOrder} style={{marginTop: '2rem'}}>Order Online</button>
              </div>
            </section>

            <section id="menu" className="menu-section">
              <div className="section-header">
                <h2>Our Menu</h2>
                <div className="separator"></div>
              </div>

              <div className="menu-grid">
                <div className="menu-items-col">
                  {homeMenuItems.map(item => (
                    <div key={item.id} className="menu-item animate-on-scroll">
                      <div className="menu-item-text">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <h3 style={{ margin: 0 }}>{item.name}</h3>
                          {item.category && (
                            <span style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--color-accent)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.category}</span>
                          )}
                        </div>
                        <p>{item.desc}</p>
                      </div>
                      <span className="price">₹{item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="menu-image animate-on-scroll">
                  <img src={dishImg} alt="Signature Duck Dish" />
                </div>
              </div>
            </section>

            <section id="about" className="about-section" style={{ padding: 'var(--spacing-xxl) var(--spacing-lg)', textAlign: 'center', backgroundColor: 'var(--color-surface-light)' }}>
              <div className="section-header animate-on-scroll">
                <h2>Our Story</h2>
                <div className="separator"></div>
              </div>
              <div className="about-content animate-on-scroll" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.15rem', marginBottom: '1.5rem', lineHeight: '1.8' }}>
                  Founded in 2026, Shree Family Restaurant was born from a passion for culinary excellence and a desire to create unforgettable dining experiences. We source only the finest seasonal ingredients, combining time-honored classic techniques with modern gastronomic innovation.
                </p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.15rem', lineHeight: '1.8' }}>
                  Our mission is to transport our guests through taste, offering an ambiance of understated luxury where every detail is meticulously crafted. Welcome to our table.
                </p>
              </div>
            </section>

            <section id="contact" className="contact-section">
              <div className="contact-container animate-on-scroll" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                <div className="contact-info" style={{ width: '100%', textAlign: 'center' }}>
                  <h2>Visit Us</h2>
                  <div className="separator" style={{ marginBottom: '2rem', marginLeft: 'auto', marginRight: 'auto' }}></div>
                  <p>Shree Family Restaurant, Near Royal Garden, Seema Dental AIIMS Road, IDPL Colony, Rishikesh</p>
                  <p>Mon - Sun: 11:00 AM - 11:00 PM</p>
                  <p>shreecaferishikesh@gmail.com</p>
                  <p>(+91) 9334722418</p>
                </div>
                <div style={{ height: '450px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: 'var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3452.8770935013254!2d78.27044287414236!3d30.069057317406685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39093f7fa59e6a8b%3A0x5aca904c9d08ef46!2sShree%20Family%20Restaurant!5e0!3m2!1sen!2sin!4v1788693043456!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade">
                  </iframe>
                </div>
              </div>
            </section>

            <footer className="footer">
              <p>&copy;2026 Shree Family Restaurant. All rights reserved.</p>
              <h6>This site is being maintained by Aditya Kumar Sinha</h6>
            </footer>
          </>
        )}

        {currentView === 'login' && <Login onLogin={handleLogin} />}
        {currentView === 'order' && <OrderMenu onAddToCart={handleAddToCart} />}
        {currentView === 'cart' && <Cart cartItems={cartItems} user={user} />}
        {currentView === 'history' && <OrderHistory user={user} />}
        {currentView === 'success' && (
          <OrderSuccess 
            orderDetails={lastOrderDetails} 
            onContinue={() => navigateWithTransition(() => setCurrentView('history'))} 
          />
        )}
        {currentView === 'admin' && <AdminDashboard />}
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
