import { useEffect, useState } from 'react';
import { saveOrder } from '../services/db';

export default function PaymentCallback({ user, onComplete }) {
  const [status, setStatus] = useState('Verifying payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const transactionId = urlParams.get('transactionId');

      if (!transactionId) {
        setStatus('Invalid request. No transaction ID found.');
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transactionId }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('Payment verified successfully! Creating your order...');
          
          // Get checkout data from localStorage
          const checkoutDataRaw = localStorage.getItem('checkoutData');
          if (checkoutDataRaw) {
            const checkoutData = JSON.parse(checkoutDataRaw);
            
            if (user) {
              saveOrder(
                user.id, 
                user.email, 
                checkoutData.cartItems, 
                checkoutData.total, 
                checkoutData.deliveryAddress, 
                transactionId
              );
            }
            
            const finalOrderDetails = {
              items: checkoutData.cartItems,
              total: checkoutData.total,
              deliveryAddress: checkoutData.deliveryAddress,
              transactionId: transactionId
            };
            
            // Clean up
            localStorage.removeItem('checkoutData');
            
            // Notify App.jsx to show success screen
            setTimeout(() => {
              onComplete(finalOrderDetails);
              // Clean up URL parameters
              window.history.replaceState({}, document.title, window.location.pathname);
            }, 1500);
          } else {
            setStatus('Payment successful, but order details were lost. Please contact support.');
          }
        } else {
          setStatus('Payment failed or pending. ' + (data.message || ''));
          setTimeout(() => {
            onComplete(null);
            window.history.replaceState({}, document.title, window.location.pathname);
          }, 3000);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('Error verifying payment.');
        setTimeout(() => {
          onComplete(null);
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 3000);
      }
    };

    verifyPayment();
  }, [user, onComplete]);

  return (
    <div className="cart-container animate-on-load" style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h2>Payment Verification</h2>
      <p style={{ marginTop: '2rem', fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>{status}</p>
    </div>
  );
}
