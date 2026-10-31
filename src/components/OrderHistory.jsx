import { useState, useEffect } from 'react';
import { getUserOrders } from '../services/db';

export default function OrderHistory({ user }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      getUserOrders(user.id)
        .then(setOrders)
        .catch(console.error);
    }
  }, [user]);

  const formatOrderId = (id) => {
    if (!id) return 'ORD';
    const str = String(id);
    const parts = str.split('-');
    if (parts.length > 1 && parts[1]) {
      return parts[1].slice(-6);
    }
    return str.slice(-6);
  };

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
        {orders.map((order, idx) => (
          <div key={order.id || `order-${idx}`} className="order-card" style={{padding: '1.5rem', background: 'var(--color-surface-light)', borderRadius: '8px', marginBottom: '1.5rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem'}}>
              <div>
                <strong>Order #{formatOrderId(order.id)}</strong>
                <p style={{fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0}}>
                  {new Date(order.date || Date.now()).toLocaleDateString()} at {new Date(order.date || Date.now()).toLocaleTimeString()}
                </p>
              </div>
              <div style={{textAlign: 'right'}}>
                <strong style={{color: 'var(--color-accent)', fontSize: '1.2rem'}}>
                  ₹{Number(order.total ?? order.totalAmount ?? 0).toFixed(2)}
                </strong>
                <div style={{marginTop: '4px'}}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    background: 
                      order.status === 'delivered' ? 'rgba(34, 197, 94, 0.2)' :
                      order.status === 'out_for_delivery' ? 'rgba(168, 85, 247, 0.2)' :
                      order.status === 'accepted' ? 'rgba(59, 130, 246, 0.2)' :
                      order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.2)' :
                      'rgba(245, 158, 11, 0.2)',
                    color: 
                      order.status === 'delivered' ? '#4ADE80' :
                      order.status === 'out_for_delivery' ? '#C084FC' :
                      order.status === 'accepted' ? '#60A5FA' :
                      order.status === 'cancelled' ? '#F87171' :
                      '#FBBF24'
                  }}>
                    {order.status === 'accepted' ? 'Cooking in Kitchen' : 
                     order.status === 'out_for_delivery' ? 'Out For Delivery' :
                     order.status === 'delivered' ? 'Delivered' :
                     order.status === 'cancelled' ? 'Cancelled' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
            
            <div style={{marginBottom: '1rem', padding: '0.8rem', background: 'var(--color-surface)', borderRadius: '4px', fontSize: '0.9rem'}}>
               <strong>Deliver To:</strong> <br/>
               <span style={{color: 'var(--color-text-muted)'}}>{order.deliveryAddress || 'Not specified'}</span>
            </div>

            <ul style={{margin: 0, padding: 0, listStyle: 'none'}}>
              {(Array.isArray(order.items) ? order.items : []).map((item, itemIdx) => (
                <li key={item.id || itemIdx} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem'}}>
                  <span>{item.quantity || 1}x {item.name || 'Dish'}</span>
                  <span>₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
