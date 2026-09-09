import { useState } from 'react';
import { saveOrder } from '../services/db';

export default function Cart({ cartItems, onCheckout, user }) {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08875; // tax rate example
  const total = subtotal + tax;

  const handlePayNow = async () => {
    if (!user) return;
    if (!deliveryAddress || deliveryAddress.trim().length < 5) {
      alert("Please enter a valid delivery address.");
      return;
    }

    setIsProcessing(true);
    try {
      const transactionId = 'T' + Date.now() + Math.floor(Math.random() * 1000);

      // Store checkout data in localStorage so we can retrieve it after redirect
      localStorage.setItem('checkoutData', JSON.stringify({
        total,
        deliveryAddress,
        cartItems,
        transactionId
      }));

      const response = await fetch('https://restaurant-website-8vnp.onrender.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          transactionId: transactionId,
          userId: user.id || 'MUID123'
        }),
      });

      const data = await response.json();
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert("Payment initialization failed. " + (data.message || ''));
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong initializing payment.");
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-container animate-on-load">
        <h2>Your Cart</h2>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="cart-container animate-on-load">
      <h2>Your Cart</h2>

      <div className="delivery-section" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--color-surface-light)', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Delivery Location</h3>
        <div className="form-group">
          <textarea
            className="form-input"
            placeholder="Enter your full delivery address (e.g. 123 Main St, Apt 4B, New York, NY 10001)"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            rows={3}
            style={{ resize: 'vertical' }}
          ></textarea>
        </div>
      </div>

      <div className="cart-items">
        {cartItems.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-details">
              <h4>{item.name}</h4>
              <p>Qty: {item.quantity}</p>
            </div>
            <span className="cart-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Tax</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="summary-row total-row">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>
      <button className="btn btn-primary btn-block" onClick={handlePayNow} disabled={!deliveryAddress || deliveryAddress.trim().length < 5 || isProcessing} style={{ marginTop: '2rem' }}>
        {isProcessing ? 'Processing...' : (deliveryAddress && deliveryAddress.trim().length >= 5 ? `Proceed to Pay ₹${total.toFixed(2)}` : 'Enter Delivery Address First')}
      </button>
    </div>
  );
}
