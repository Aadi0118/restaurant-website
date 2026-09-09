import React from 'react';
import '../Order.css';

export default function OrderSuccess({ orderDetails, onContinue }) {
  if (!orderDetails) return null;

  const { items, total, transactionId, deliveryAddress } = orderDetails;
  
  // Generate a random token ID for the kitchen/pickup
  const tokenId = `TKN-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="cart-container animate-on-load" style={{ maxWidth: '600px', textAlign: 'center', marginTop: '4rem' }}>
      <div style={{
        width: '80px', height: '80px', background: '#10b981', color: 'white',
        borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
        fontSize: '2.5rem', margin: '0 auto 2rem', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)'
      }}>
        ✓
      </div>
      
      <h2 style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>Order Placed Successfully!</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        Your payment was confirmed. The kitchen is preparing your food.
      </p>

      <div style={{ background: 'var(--color-surface-light)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', border: '1px dashed var(--color-accent)' }}>
        <h3 style={{ color: 'var(--color-accent)', fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Your Token</h3>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--color-text)', marginBottom: '1.5rem' }}>
          {tokenId}
        </div>
        
        <div style={{ textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
          <p style={{ margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Transaction ID:</span>
            <strong>{transactionId}</strong>
          </p>
          <p style={{ margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Total Amount:</span>
            <strong>₹{total.toFixed(2)}</strong>
          </p>
          <div style={{ margin: '1rem 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            <strong>Delivery To:</strong><br/>
            {deliveryAddress}
          </div>
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={onContinue}>
        View Order History
      </button>
    </div>
  );
}
