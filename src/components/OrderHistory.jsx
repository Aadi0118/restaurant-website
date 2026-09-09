import { useState, useEffect } from 'react';
import { getUserOrders } from '../services/db';

export default function OrderHistory({ user }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      setOrders(getUserOrders(user.id));
    }
  }, [user]);

  if (orders.length === 0) {
    return (
      <div className="cart-container animate-on-load">
        <h2>Order History</h2>
        <p>You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="cart-container animate-on-load" style={{maxWidth: '800px'}}>
      <h2>Your Past Orders</h2>
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card" style={{padding: '1.5rem', background: 'var(--color-surface-light)', borderRadius: '8px', marginBottom: '1.5rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem'}}>
              <div>
                <strong>Order #{order.id.split('-')[1]}</strong>
                <p style={{fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0}}>
                  {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
                </p>
              </div>
              <div style={{textAlign: 'right'}}>
                <strong style={{color: 'var(--color-accent)'}}>₹{order.total.toFixed(2)}</strong>
              </div>
            </div>
            
            <div style={{marginBottom: '1rem', padding: '0.8rem', background: 'var(--color-surface)', borderRadius: '4px', fontSize: '0.9rem'}}>
               <strong>Deliver To:</strong> <br/>
               <span style={{color: 'var(--color-text-muted)'}}>{order.deliveryAddress || 'Not specified'}</span>
            </div>

            <ul style={{margin: 0, padding: 0, listStyle: 'none'}}>
              {order.items.map(item => (
                <li key={item.id} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem'}}>
                  <span>{item.quantity}x {item.name}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
