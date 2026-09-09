const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3001;

// --- PHONEPE CONFIGURATION ---
// To go to Production, replace these 4 values with your real Production Keys from the PhonePe Dashboard:
const MERCHANT_ID = 'PGTESTPAYUAT86'; // Replace with your real Merchant ID
const SALT_KEY = '96434309-7796-489d-8924-ab56988a6076'; // Replace with your real Salt Key
const SALT_INDEX = 1; // Replace with your real Salt Index
// For production, change this URL to: 'https://api.phonepe.com/apis/hermes'
const PHONEPE_HOST = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
// -----------------------------

app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, transactionId, userId } = req.body;

    // Create the payload
    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: userId || 'MUID123',
      amount: Math.round(amount * 100), // PhonePe expects amount in paise as an integer
      redirectUrl: `http://localhost:5173/?view=payment-callback&transactionId=${transactionId}`,
      redirectMode: 'REDIRECT',
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    // Base64 encode the payload
    const base64EncodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');

    // Calculate Checksum: SHA256(base64EncodedPayload + "/pg/v1/pay" + saltKey) + "###" + saltIndex
    const stringToHash = base64EncodedPayload + '/pg/v1/pay' + SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = sha256 + '###' + SALT_INDEX;

    const options = {
      method: 'POST',
      url: `${PHONEPE_HOST}/pg/v1/pay`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      data: {
        request: base64EncodedPayload,
      },
    };

    const response = await axios.request(options);

    if (response.data.success) {
      // Return the URL to the PhonePe checkout page
      res.json({
        success: true,
        redirectUrl: response.data.data.instrumentResponse.redirectInfo.url,
      });
    } else {
      res.status(400).json({ success: false, message: response.data.message });
    }
  } catch (error) {
    console.error('Error creating payment:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const { transactionId } = req.body;

    // Checksum for status check: SHA256("/pg/v1/status/" + merchantId + "/" + transactionId + saltKey) + "###" + saltIndex
    const stringToHash = `/pg/v1/status/${MERCHANT_ID}/${transactionId}` + SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = sha256 + '###' + SALT_INDEX;

    const options = {
      method: 'GET',
      url: `${PHONEPE_HOST}/pg/v1/status/${MERCHANT_ID}/${transactionId}`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': MERCHANT_ID,
      },
    };

    const response = await axios.request(options);

    if (response.data.success && response.data.code === 'PAYMENT_SUCCESS') {
      res.json({ success: true, message: 'Payment successful', data: response.data.data });
    } else {
      res.status(400).json({ success: false, message: 'Payment failed or pending', data: response.data.data });
    }
  } catch (error) {
    console.error('Error verifying payment:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
