import { useState, useEffect } from 'react';
import dishImg from '../assets/signature_dish.jpg'
import { getMenuItems } from '../services/db';

export default function OrderMenu({ onAddToCart }) {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    setMenuItems(getMenuItems());
  }, []);

  return (
    <section className="order-section">
      <div className="section-header">
        <h2>Order Menu</h2>
        <div className="separator"></div>
      </div>
      
      <div className="menu-grid">
        <div className="menu-items-col">
          {menuItems.map(item => (
            <div key={item.id} className="menu-item animate-on-load">
              <div className="menu-item-text">
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                   <h3 style={{margin: 0}}>{item.name}</h3>
                   {item.category && (
                     <span style={{background: 'rgba(212,175,55,0.1)', color: 'var(--color-accent)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>{item.category}</span>
                   )}
                </div>
                <p>{item.desc}</p>
              </div>
              <div className="menu-item-action">
                <span className="price">₹{item.price}</span>
                <button className="btn btn-primary btn-sm" onClick={() => onAddToCart(item)}>Add to Cart</button>
              </div>
            </div>
          ))}
        </div>

        <div className="menu-image animate-on-load">
           <img src={dishImg} alt="Signature Duck Dish" />
        </div>
      </div>
    </section>
  );
}
