import React, { useState } from 'react';
import './UpiGateway.css';

export default function UpiGateway({ amount, onSuccess, onCancel }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    // Simulate verification delay
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  // Generate UPI URI
  const upiId = 'Q075209051@ybl';
  const payeeName = 'Shree Family Restaurant';
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;

  return (
    <div className="gateway-overlay">
      <div className="gateway-modal animate-on-load">
        <div className="gateway-header">
          <h2>Secure UPI Payment</h2>
          <button className="close-btn" onClick={onCancel} disabled={isProcessing}>&times;</button>
        </div>
        
        <div className="gateway-body">
          <p className="amount-display">Total Amount: <span>₹{amount.toFixed(2)}</span></p>
          
          <div className="qr-container">
            <p>Scan with any UPI App (GPay, PhonePe, Paytm)</p>
            <div className="qr-box">
              <img src={qrCodeUrl} alt="UPI QR Code" />
            </div>
            <p className="upi-id-display">UPI ID: <strong>{upiId}</strong></p>
          </div>

          <div className="gateway-actions">
            <button 
              className="btn btn-primary btn-block" 
              onClick={handleConfirmPayment}
              disabled={isProcessing}
            >
              {isProcessing ? 'Verifying Payment...' : 'I have paid successfully'}
            </button>
            <button 
              className="btn btn-secondary btn-block" 
              onClick={onCancel}
              disabled={isProcessing}
              style={{ marginTop: '1rem' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
