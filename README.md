<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=timeGradient&height=250&section=header&text=🍽️%20Shree%20Family%20Restaurant&fontSize=50&fontAlignY=35&desc=The%20Future%20of%20Digital%20Dining&descAlignY=55&descAlign=50" alt="Header" />
</p>

<div align="center">
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React_19-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite_⚡-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js_Backend-%23339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" /></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express.js_API-%23000000.svg?style=for-the-badge&logo=express&logoColor=white" alt="Express" /></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB_Atlas-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
  <a href="https://www.phonepe.com/"><img src="https://img.shields.io/badge/PhonePe_PG-%235F259F.svg?style=for-the-badge&logo=phonepe&logoColor=white" alt="PhonePe" /></a>
</div>

<br/>

<div align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=24&pause=1000&color=F71181&center=true&vCenter=true&width=600&lines=Seamless+Food+Ordering;Robust+Admin+Dashboard;Real-Time+Order+Tracking;Secure+Digital+Payments" alt="Typing SVG" />
</div>

<p align="center">
  <strong>A premium, lightning-fast restaurant management system built to elevate customer experiences and streamline operations.</strong>
</p>

<p align="center">
  <a href="#-highlights--capabilities">✨ Features</a> •
  <a href="#-system-architecture">🏗 Architecture</a> •
  <a href="#-quick-start-guide">🚀 Quick Start</a> •
  <a href="#-sneak-peek-screenshots">📸 Screenshots</a>
</p>

<hr/>

## 🎯 Highlights & Capabilities

<table align="center">
  <tr>
    <td align="center" width="50%">
      <img src="https://img.icons8.com/color/96/000000/restaurant-menu.png" alt="Menu" />
      <h3>Beautiful Interactive Menu</h3>
      <p>Browse dishes with high-quality descriptions, categories, and dynamic pricing.</p>
    </td>
    <td align="center" width="50%">
      <img src="https://img.icons8.com/color/96/000000/google-logo.png" alt="Google" />
      <h3>One-Click Google Auth</h3>
      <p>Zero-friction onboarding. Customers log in securely using their Google accounts.</p>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="https://img.icons8.com/color/96/000000/bank-cards.png" alt="Payments" />
      <h3>PhonePe Integration</h3>
      <p>Secure, fast, and reliable digital transactions right at checkout.</p>
    </td>
    <td align="center" width="50%">
      <img src="https://img.icons8.com/color/96/000000/combo-chart--v1.png" alt="Analytics" />
      <h3>Admin Command Center</h3>
      <p>Full control over inventory, orders, and stunning business analytics charts.</p>
    </td>
  </tr>
</table>

---

## 📸 Sneak Peek (Screenshots)

> *Placeholders for your amazing app screenshots!*

| Storefront & Cart 🛍️ | Admin Analytics 📈 |
| :---: | :---: |
| <img src="https://via.placeholder.com/600x400/20232a/61DAFB?text=Storefront+UI" width="100%" style="border-radius: 10px;" /> | <img src="https://via.placeholder.com/600x400/20232a/61DAFB?text=Admin+Dashboard" width="100%" style="border-radius: 10px;" /> |

---

## 🛠 Tech Stack Deep Dive

<details>
<summary><b style="font-size:16px;">🔍 Expand to view the complete MERN + Maps + Payments Stack</b></summary>
<br>

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite | Blazing fast client-side rendering & UI |
| **Icons & Charts** | `lucide-react`, `recharts` | Beautiful SVG icons and dynamic data visualization |
| **Maps** | `@vis.gl/react-google-maps` | Interactive location maps for the restaurant |
| **Backend API**| Node.js, Express.js | Robust RESTful API architecture |
| **Database** | MongoDB Atlas, Mongoose | Scalable NoSQL cloud database |
| **Auth** | `@react-oauth/google` | OAuth 2.0 Identity verification |
| **Payments** | `@phonepe-pg/pg-sdk-node` | Server-side payment intent & verification |

</details>

---

## 🏗 System Architecture

The architecture ensures a seamless flow of data between the client, authentication providers, backend logic, and payment gateways.

```mermaid
graph TD
    %% Styling
    classDef client fill:#20232a,stroke:#61DAFB,stroke-width:2px,color:#fff;
    classDef server fill:#339933,stroke:#fff,stroke-width:2px,color:#fff;
    classDef db fill:#4EA94B,stroke:#fff,stroke-width:2px,color:#fff;
    classDef external fill:#f9f9f9,stroke:#333,stroke-width:1px,color:#333;

    A[React Client]:::client <-->|REST API| B(Express Server):::server
    A <-->|OAuth Flow| C[Google Auth]:::external
    A <-->|Checkout Intent| D[PhonePe Gateway]:::external
    
    B <-->|Verify Payment| D
    B <-->|Mongoose ODM| E[(MongoDB Atlas)]:::db
```

---

## 🚀 Quick Start Guide

Ready to run this locally? Follow these steps:

### 1️⃣ Clone & Install
```bash
# Clone the repo
git clone <repository-url>
cd restaurant-website

# Install Frontend dependencies
npm install

# Install Backend dependencies
cd server
npm install
```

### 2️⃣ Environment Variables
Create a `.env` file in the root for Vite, and one in `server/` for Express.

<details>
<summary><b>View `.env` configurations</b></summary>

**`server/.env`**
```ini
PORT=3001
MONGODB_URI=your_mongodb_connection_string
```

**`/.env`** (Project Root)
```ini
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```
</details>

### 3️⃣ Fire It Up! 🔥
Run these commands in two separate terminal windows:

```bash
# Terminal 1: Backend
cd server
node index.js

# Terminal 2: Frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) and enjoy your new app!

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=timeGradient&height=120&section=footer" width="100%" alt="Footer" />
  <h3>Developed with ❤️ for the ultimate dining experience.</h3>
</div>
