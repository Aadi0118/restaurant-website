import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import dishImg from '../assets/signature_dish.jpg'
import { getMenuItems } from '../services/db';

export default function OrderMenu({ onAddToCart }) {
  const [menuItems, setMenuItems] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    getMenuItems().then(items => {
      setMenuItems(items);
      // Auto-expand first category if exists
      const categories = [...new Set(items.map(item => item.category || 'Uncategorized'))];
      if (categories.length > 0) setExpandedCategory(categories[0]);
    }).catch(console.error);
  }, []);

  const toggleCategory = (category) => {
    setExpandedCategory(prev => prev === category ? null : category);
  };

  // Group items by category
  const groupedMenu = menuItems.reduce((acc, item) => {
    const cat = item.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <section className="order-section">
      <div className="section-header">
        <h2>Order Menu</h2>
        <div className="separator"></div>
      </div>
      
      <div className="menu-grid">
        <div className="menu-items-col">
          {Object.keys(groupedMenu).length === 0 && <p style={{textAlign: 'center', color: 'var(--color-text-muted)'}}>No menu items available.</p>}
          {Object.entries(groupedMenu).map(([category, items]) => {
            const isExpanded = expandedCategory === category;
            return (
              <div key={category} className="category-container animate-on-load">
                <div 
                  className={`category-header ${isExpanded ? 'active' : ''}`}
                  onClick={() => toggleCategory(category)}
                >
                  <h3>{category}</h3>
                  <ChevronDown className={`category-chevron ${isExpanded ? 'expanded' : ''}`} size={24} />
                </div>
                <div className={`category-content ${isExpanded ? 'expanded' : ''}`}>
                  <div className="category-content-inner">
                    {items.map(item => (
                      <div key={item.id} className="menu-item">
                        <div className="menu-item-text">
                          <h3 style={{margin: 0, fontSize: '1.2rem'}}>{item.name}</h3>
                          <p style={{fontSize: '0.85rem', marginTop: '0.2rem'}}>{item.desc}</p>
                        </div>
                        <div className="menu-item-action">
                          <span className="price">₹{item.price}</span>
                          <button className="btn btn-primary btn-sm" onClick={() => onAddToCart(item)}>Add</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="menu-image animate-on-load">
           <img src={dishImg} alt="Signature Duck Dish" />
        </div>
      </div>
    </section>
  );
}
