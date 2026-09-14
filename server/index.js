const express = require('express');
const cors = require('cors');
const { StandardCheckoutClient, StandardCheckoutPayRequest, Env } = require('@phonepe-pg/pg-sdk-node');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3001;

// --- PHONEPE V2 CONFIGURATION ---
// Replace with your real V2 Production credentials when deploying
const CLIENT_ID = 'YOUR_CLIENT_ID'; 
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const CLIENT_VERSION = 1;

// Initialize the PhonePe client in SANDBOX environment for testing
const client = new StandardCheckoutClient(
    CLIENT_ID,
    CLIENT_SECRET,
    CLIENT_VERSION,
    Env.SANDBOX // Change to Env.PRODUCTION for live
);
// -----------------------------

app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, transactionId, userId } = req.body;

    const request = StandardCheckoutPayRequest.build_request({
        merchantOrderId: transactionId,
        amount: Math.round(amount * 100), // Amount in paise
        redirectUrl: `https://shree-restaurant-seven.vercel.app/?view=payment-callback&transactionId=${transactionId}`,
        callbackUrl: `https://shree-restaurant-seven.vercel.app/api/webhook`, 
        mobileNumber: "9999999999" // Optional
    });

    const response = await client.pay(request);
    
    res.json({
        success: true,
        response: response,
        transactionId: transactionId
    });

  } catch (error) {
    console.error('Error generating V2 payment request:', error.message);
    res.status(500).json({ success: false, error: 'Payment initialization failed' });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    const response = await client.checkStatus(transactionId);
    
    // Check if the payment status is successful
    if (response && response.code === 'PAYMENT_SUCCESS') {
      res.json({ success: true, status: 'SUCCESS', details: response });
    } else {
      res.json({ success: false, status: response?.code || 'PENDING' });
    }

  } catch (error) {
    console.error('Error verifying V2 payment:', error.message);
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
