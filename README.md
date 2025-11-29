# Drone Delivery System

A full-stack Drone Delivery application built with **Node.js**, **Express**, **SQLite**, and **React**. This system manages drone fleets, processes delivery orders, and provides real-time status updates across different user roles.

## 🚀 Features

### 🔐 Authentication & Roles
- **Secure Auth**: JWT-based authentication with password hashing (bcrypt).
- **Role-Based Access Control**:
  - **Admin**: View fleet status, monitor all orders, and manage operations.
  - **End User**: Create delivery orders and track their status.
  - **Drone**: "IoT-like" interface for drones to update their status (IDLE/BUSY/BROKEN) and location.

### 🚁 Drone Management
- **Automatic Assignment**: Smart logic automatically assigns available (IDLE) drones to new orders.
- **State Management**: Tracks drone states (IDLE, BUSY, BROKEN) and prevents assignment of unavailable drones.
- **Real-time Updates**: Dashboard auto-refreshes to show the latest fleet status.

### 📦 Order Processing
- **Order Lifecycle**: Create -> Assigned -> Delivered.
- **Transaction Safety**: Database transactions ensure data integrity when assigning drones to orders.

### 🎨 UI/UX Polish
- **Modern Design**: Glassmorphism aesthetic with rich gradients and blur effects.
- **Responsive**: Fully responsive layout for all devices.
- **Interactive**: Smooth transitions, hover effects, and live status indicators.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, Better-SQLite3
- **Frontend**: React 19, Vite, Axios, CSS3 (Variables & Animations)
- **Database**: SQLite (File-based, zero configuration)

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm

### 1. Server Setup (Backend)
```bash
cd backend
npm install
node server.js
```
The server will start on `http://localhost:3000`.
*Note: The database `drone_delivery.db` will be automatically created on the first run.*

### 2. Web Dashboard Setup (Frontend)
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 🧪 Running Tests

The project includes an automated test script to verify the backend logic (Auth, Order Creation, Drone Assignment).

To run the tests:
```bash
cd backend
node test_api.js
```

**Test Coverage:**
1.  User Registration (Admin, User, Drone)
2.  Authentication & Token Generation
3.  Order Submission
4.  Automatic Drone Assignment Logic
5.  Order Completion & Drone Release

---

## 📸 Usage Guide

1.  **Register/Login**: Start by registering a user (e.g., type "End User").
2.  **Create Order**: As an End User, enter Origin and Destination to submit an order.
3.  **View Assignment**: The system will instantly assign an IDLE drone (if available).
4.  **Admin View**: Login as Admin to see the "Fleet Status" and global order list.
5.  **Drone Simulation**: Login as a Drone to report status changes (e.g., "BROKEN" or "IDLE").

---

## 📝 License
MIT
