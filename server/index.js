require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { StandardCheckoutClient, StandardCheckoutPayRequest, Env } = require('@phonepe-pg/pg-sdk-node');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3001;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => console.error('Error connecting to MongoDB:', error.message));
} else {
  console.warn('WARNING: MONGODB_URI environment variable not set. Database operations will fail.');
}

// Menu Item Schema
const menuItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  desc: { type: String },
  price: { type: Number, required: true },
  category: { type: String, default: 'Uncategorized' }
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

// --- MENU ITEMS API ---
app.get('/api/menuItems', async (req, res) => {
  try {
    const items = await MenuItem.find({}, '-_id -__v');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

app.post('/api/menuItems', async (req, res) => {
  try {
    const { name, desc, price, category } = req.body;
    const newItem = new MenuItem({
      id: `menu-${Date.now()}`,
      name,
      desc,
      price: Number(price),
      category: category || 'Uncategorized'
    });
    await newItem.save();
    
    // Return formatted item without MongoDB specific fields
    const formattedItem = newItem.toObject();
    delete formattedItem._id;
    delete formattedItem.__v;
    
    res.status(201).json(formattedItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

app.put('/api/menuItems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, desc, price, category } = req.body;
    
    const updatedItem = await MenuItem.findOneAndUpdate(
      { id },
      { name, desc, price: Number(price), category: category || 'Uncategorized' },
      { new: true, select: '-_id -__v' }
    );
    
    if (updatedItem) {
      res.json(updatedItem);
    } else {
      res.status(404).json({ error: 'Menu item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

app.delete('/api/menuItems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await MenuItem.findOneAndDelete({ id });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

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
