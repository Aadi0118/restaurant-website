# 🍽️ Shree Family Restaurant - Full-Stack Web Application

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

Welcome to the **Shree Family Restaurant** web application! This is a modern, full-stack restaurant management and ordering system built with the MERN stack (MongoDB, Express, React, Node.js). 

## ✨ Features

### 🍔 For Customers
- **Interactive Menu:** Browse our delicious offerings with detailed descriptions and prices.
- **Cart & Checkout:** Seamlessly add items to cart and place orders.
- **Google Authentication:** Quick and secure login using Google OAuth.
- **Order Tracking:** View order history and real-time status.
- **Integrated Payments:** Secure digital payments powered by PhonePe integration.
- **Interactive Maps:** Find our restaurant easily with integrated Google Maps.

### 🛡️ For Administrators
- **Admin Dashboard:** A comprehensive view of restaurant operations.
- **Menu Management:** Perform CRUD operations (Create, Read, Update, Delete) on menu items.
- **Order Management:** Track incoming orders and update delivery statuses in real-time.
- **Business Analytics:** Visual insights and charts for sales and orders using Recharts.

---

## 🛠️ Technology Stack

| Area | Technologies |
|------|-------------|
| **Frontend** | React 19, Vite, Lucide-React (Icons), Recharts (Analytics), Google Maps React |
| **Backend** | Node.js, Express.js, CORS |
| **Database** | MongoDB Atlas, Mongoose |
| **Authentication**| Google OAuth 2.0 (`@react-oauth/google`) |
| **Payments** | PhonePe Payment Gateway (`@phonepe-pg/pg-sdk-node`) |

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB Atlas account (or local MongoDB server)
- Google Cloud Console account (for OAuth and Maps API)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd restaurant-website
   ```

2. **Install Dependencies:**
   ```bash
   # Install root/frontend dependencies
   npm install

   # Install backend dependencies (if separate package.json exists in server/)
   cd server
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root and `server` directory (as required) and add the following keys:
   ```env
   # Backend
   PORT=3001
   MONGODB_URI=your_mongodb_connection_string

   # Frontend (Vite)
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Run the Application:**
   
   *Start the Backend Server:*
   ```bash
   cd server
   node index.js
   ```

   *Start the Frontend Development Server:*
   ```bash
   # In the project root
   npm run dev
   ```

5. **Visit the App:**
   Open your browser and navigate to `http://localhost:5173`.

---

## 📁 Project Structure

```text
restaurant-website/
├── server/             # Express.js Backend Server
│   └── index.js        # Main server entry, API routes, DB Models
├── src/                # React Frontend
│   ├── components/     # Reusable UI components (Cart, AdminDashboard, etc.)
│   ├── services/       # API & Database interaction logic (db.js)
│   └── ...
├── public/             # Static assets
├── package.json        # Project metadata and dependencies
└── vite.config.js      # Vite configuration
```

---

## 📜 Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs Oxlint to analyze the code.

---

*Made with ❤️ for great food and excellent user experiences.*
