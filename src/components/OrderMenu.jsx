import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import dishImg from '../assets/signature_dish.jpg'
import { getMenuItems } from '../services/db';

export default function OrderMenu({ onAddToCart }) {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    getMenuItems().then(items => {
      setMenuItems(items);
    }).catch(console.error);
  }, []);

  // Group items by category
  const groupedMenu = menuItems.reduce((acc, item) => {
    const cat = item.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categories = Object.keys(groupedMenu);

  return (
    <section className="order-section">
      <div className="section-header">
        <h2>Order Menu</h2>
        <div className="separator"></div>
      </div>
      
      <div className="menu-grid">
        <div className="menu-items-col">
          {categories.length === 0 && <p style={{textAlign: 'center', color: 'var(--color-text-muted)'}}>No menu items available.</p>}
          
          {!selectedCategory ? (
            // Render Categories List
            <div className="categories-list animate-on-load" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {categories.map(category => (
                <div 
                  key={category} 
                  className="category-card"
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '1.5rem',
                    background: 'var(--color-surface-light)',
                    border: 'var(--glass-border)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--color-surface-light)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <h3 style={{margin: 0, fontSize: '1.3rem'}}>{category}</h3>
                  <span style={{color: 'var(--color-text-muted)', fontSize: '0.9rem'}}>{groupedMenu[category].length} items</span>
                </div>
              ))}
            </div>
          ) : (
            // Render Items for Selected Category
            <div className="category-items animate-on-load">
              <button 
                onClick={() => setSelectedCategory(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-accent)',
                  cursor: 'pointer',
                  padding: '0 0 1.5rem 0',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
              >
                <ArrowLeft size={20} /> Back to Categories
              </button>
              
              <h3 style={{marginBottom: '1.5rem', fontSize: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem'}}>{selectedCategory}</h3>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {groupedMenu[selectedCategory].map(item => (
                  <div key={item.id} className="menu-item" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div className="menu-item-text">
                      <h3 style={{margin: 0, fontSize: '1.2rem'}}>{item.name}</h3>
                      <p style={{fontSize: '0.85rem', marginTop: '0.4rem', color: 'var(--color-text-muted)'}}>{item.desc}</p>
                    </div>
                    <div className="menu-item-action" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                      <span className="price" style={{color: 'var(--color-accent)', fontWeight: 'bold', fontSize: '1.1rem'}}>₹{Number(item.price).toFixed(2)}</span>
                      <button className="btn btn-primary btn-sm" onClick={() => onAddToCart(item)}>Add</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="menu-image animate-on-load">
           <img src={dishImg} alt="Signature Duck Dish" />
        </div>
      </div>
    </section>
  );
}
