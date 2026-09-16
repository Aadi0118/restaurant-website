import { useState } from 'react';
import { saveOrder, updateOrderStatus } from '../services/db';

export default function Cart({ cartItems, onCheckout, user }) {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [view, setView] = useState('cart'); // 'cart' | 'qr' | 'pin'
  const [orderId, setOrderId] = useState(null);
  const [verificationKey, setVerificationKey] = useState('');
  const [userInputKey, setUserInputKey] = useState('');

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08875; // tax rate example
  const total = subtotal + tax;

  const handlePayNow = () => {
    if (!user) {
      alert("Please log in first.");
      return;
    }
    if (!mobileNumber || mobileNumber.trim().length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!deliveryAddress || deliveryAddress.trim().length < 5) {
      alert("Please enter a valid delivery address.");
      return;
    }
    setView('qr');
  };

  const handleQRCompleted = async () => {
    // Generate a random 4-digit key
    const newKey = Math.floor(1000 + Math.random() * 9000).toString();
    setVerificationKey(newKey);
    
    // Save order as pending
    const fullAddress = `${deliveryAddress} | Mobile: ${mobileNumber}`;
    try {
        const newOrder = await saveOrder(user.id, user.email, cartItems, total, fullAddress, null, 'pending', newKey);
        setOrderId(newOrder.id);
        setView('pin');
    } catch (e) {
        console.error(e);
        alert("Failed to create order. Is the server running?");
    }
  };

  const handleVerify = async () => {
    if (userInputKey === verificationKey) {
      try {
          await updateOrderStatus(orderId, 'accepted');
          if (onCheckout) onCheckout();
      } catch (e) {
          console.error(e);
          alert("Failed to verify order on server.");
      }
    } else {
      alert("Incorrect PIN. Please verify with the Admin.");
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

  if (view === 'qr') {
    return (
      <div className="cart-container animate-on-load" style={{ textAlign: 'center' }}>
        <h2>Complete Your Payment</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Scan the QR code below to pay <strong style={{ color: 'var(--color-accent)' }}>₹{total.toFixed(2)}</strong>.
        </p>
        <div style={{ background: 'white', padding: '1rem', display: 'inline-block', borderRadius: '12px', marginBottom: '2rem' }}>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=Q075209051@ybl&pn=Shree Family Restaurant&am=${total.toFixed(2)}&cu=INR`)}`} alt="Payment QR Code" />
          <div style={{ marginTop: '0.5rem', color: '#333', fontSize: '0.9rem', fontWeight: 'bold' }}>UPI ID: Q075209051@ybl</div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn" onClick={() => setView('cart')} style={{ borderColor: 'var(--color-text-muted)', color: 'var(--color-text-muted)' }}>Back</button>
          <button className="btn btn-primary" onClick={handleQRCompleted}>I Have Paid</button>
        </div>
      </div>
    );
  }

  if (view === 'pin') {
    return (
      <div className="cart-container animate-on-load" style={{ textAlign: 'center' }}>
        <h2>Verify Payment</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Your order has been placed and is waiting for payment confirmation.
          <br /><br />
          Please check your WhatsApp. The Admin will share a unique 4-digit verification code with you to confirm your order.
        </p>

        <div style={{ maxWidth: '300px', margin: '0 auto', marginBottom: '2rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Enter 4-Digit PIN"
            value={userInputKey}
            onChange={(e) => setUserInputKey(e.target.value)}
            style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', background: 'rgba(0,0,0,0.5)' }}
            maxLength={4}
          />
        </div>

        <div>
          <button className="btn btn-primary" onClick={handleVerify}>Verify PIN & Complete Order</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container animate-on-load">
      <h2>Your Cart</h2>

      <div className="delivery-section" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--color-surface-light)', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Delivery Location & Mobile Number</h3>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <input
            type="tel"
            className="form-input"
            placeholder="Enter your 10-digit mobile number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <textarea
            className="form-input"
            placeholder="Enter your full delivery address (e.g. 123 Main St, Apt 4B, New York, NY 10001)"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            rows={3}
            style={{ resize: 'vertical' }}
            required
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
      <button className="btn btn-primary btn-block" onClick={handlePayNow} disabled={!deliveryAddress || deliveryAddress.trim().length < 5 || !mobileNumber || mobileNumber.trim().length < 10} style={{ marginTop: '2rem' }}>
        {deliveryAddress && deliveryAddress.trim().length >= 5 && mobileNumber && mobileNumber.trim().length >= 10 ? `Proceed to Pay ₹${total.toFixed(2)}` : 'Enter Details First'}
      </button>
    </div>
  );
}
