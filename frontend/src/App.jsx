import { useState, useEffect } from 'react'
import axios from 'axios'
import './index.css'

const API_URL = 'http://localhost:3000';

function App() {
  const [token, setToken] = useState(null);
  const [userType, setUserType] = useState(null);
  const [username, setUsername] = useState('');
  const [view, setView] = useState('login'); // 'login' or 'register'

  // Dashboard Data
  const [orders, setOrders] = useState([]);
  const [drones, setDrones] = useState([]);

  // Form States
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formType, setFormType] = useState('enduser');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const register = async () => {
    try {
      await axios.post(`${API_URL}/auth/register`, {
        username: formUsername,
        password: formPassword,
        type: formType
      });
      alert('Registration successful! Please login.');
      setView('login');
      setFormPassword('');
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        username: formUsername,
        password: formPassword
      });
      setToken(res.data.token);
      setUserType(res.data.type);
      setUsername(formUsername);
      fetchData(res.data.type);
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  const fetchData = async (type = userType) => {
    try {
      if (type === 'admin' || type === 'enduser') {
        const ordersRes = await axios.get(`${API_URL}/orders`);
        setOrders(ordersRes.data);
      }
      if (type === 'admin') {
        const dronesRes = await axios.get(`${API_URL}/drones`);
        setDrones(dronesRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  // Auto-refresh for live updates
  useEffect(() => {
    if (!token) return;
    fetchData();
    const interval = setInterval(() => fetchData(), 3000);
    return () => clearInterval(interval);
  }, [token, userType]);

  const submitOrder = async () => {
    if (!origin || !destination) {
      alert('Please fill in both origin and destination');
      return;
    }
    try {
      await axios.post(`${API_URL}/orders`, { origin, destination });
      setOrigin('');
      setDestination('');
      fetchData();
      alert('Order created successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit order');
    }
  };

  const updateDroneStatus = async (status, location = '0,0') => {
    try {
      await axios.put(`${API_URL}/drones/${username}`, { status, location });
      alert(`Status updated to ${status}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API_URL}/orders/${orderId}`, { status });
      alert(`Order #${orderId} marked as ${status}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update order');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {view === 'login' ? 'Login' : 'Register'}
          </h1>

          <input
            className="input-field"
            placeholder="Username"
            value={formUsername}
            onChange={e => setFormUsername(e.target.value)}
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={formPassword}
            onChange={e => setFormPassword(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && (view === 'login' ? login() : register())}
          />

          {view === 'register' && (
            <select
              className="input-field"
              value={formType}
              onChange={e => setFormType(e.target.value)}
            >
              <option value="enduser">End User</option>
              <option value="drone">Drone</option>
              <option value="admin">Admin</option>
            </select>
          )}

          <button
            className="btn-primary w-full"
            onClick={view === 'login' ? login : register}
          >
            {view === 'login' ? 'Login' : 'Register'}
          </button>

          <button
            className="btn-secondary w-full mt-2"
            onClick={() => setView(view === 'login' ? 'register' : 'login')}
          >
            {view === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          Drone Delivery System
        </h1>
        <div className="flex items-center gap-4">
          <span className="px-4 py-2 bg-slate-800 rounded-full border border-slate-700">
            {username} <span className="text-indigo-400">({userType})</span>
          </span>
          <button className="btn-danger" onClick={() => { setToken(null); setUsername(''); setUserType(null); }}>
            Logout
          </button>
        </div>
      </header>

      {userType === 'enduser' && (
        <div className="grid-layout">
          <div className="glass-panel">
            <h2 className="text-xl font-semibold mb-4">New Order</h2>
            <input
              className="input-field"
              placeholder="Origin (e.g., Downtown)"
              value={origin}
              onChange={e => setOrigin(e.target.value)}
            />
            <input
              className="input-field"
              placeholder="Destination (e.g., Airport)"
              value={destination}
              onChange={e => setDestination(e.target.value)}
            />
            <button className="btn-primary w-full" onClick={submitOrder}>
              Submit Order
            </button>
          </div>
          <div className="glass-panel col-span-2">
            <h2 className="text-xl font-semibold mb-4">My Orders</h2>
            <div className="space-y-2">
              {orders.length === 0 ? (
                <p className="text-muted">No orders yet</p>
              ) : (
                orders.map(o => (
                  <div key={o.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded">
                    <div>
                      <span className="block">#{o.id}: {o.origin} ➔ {o.destination}</span>
                      <span className="text-xs text-muted">
                        Drone: {o.assigned_drone || 'Waiting for assignment'}
                      </span>
                    </div>
                    <span className={`status-badge status-${o.status}`}>{o.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {userType === 'drone' && (
        <div className="max-w-2xl mx-auto glass-panel">
          <h2 className="text-xl font-semibold mb-6">Drone Control Panel</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              className="btn-primary"
              onClick={() => updateDroneStatus('IDLE')}
            >
              Mark IDLE
            </button>
            <button
              className="btn-primary bg-green-600 hover:bg-green-700"
              onClick={() => updateDroneStatus('BUSY')}
            >
              Mark BUSY
            </button>
            <button
              className="btn-danger"
              onClick={() => updateDroneStatus('BROKEN')}
            >
              Report BROKEN
            </button>
            <button
              className="btn-primary bg-blue-500 hover:bg-blue-600"
              onClick={() => {
                const lat = (Math.random() * 180 - 90).toFixed(2);
                const lon = (Math.random() * 360 - 180).toFixed(2);
                updateDroneStatus('IDLE', `${lat},${lon}`);
              }}
            >
              Update Location
            </button>
          </div>

          <div className="p-4 bg-slate-800 rounded">
            <h3 className="font-semibold mb-2">Current Status</h3>
            <p className="text-muted">Drone ID: {username}</p>
            <p className="text-sm text-indigo-400 mt-2">
              Use the buttons above to update your status
            </p>
          </div>
        </div>
      )}

      {userType === 'admin' && (
        <div className="grid-layout">
          <div className="glass-panel">
            <h2 className="text-xl font-semibold mb-4">Fleet Status</h2>
            <div className="space-y-2">
              {drones.length === 0 ? (
                <p className="text-muted">No drones registered</p>
              ) : (
                drones.map(d => (
                  <div key={d.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded">
                    <div>
                      <span className="block">{d.id}</span>
                      <span className="text-xs text-muted">Location: {d.location}</span>
                      {d.current_order_id && (
                        <span className="text-xs text-indigo-400 block">Order: #{d.current_order_id}</span>
                      )}
                    </div>
                    <span className={`status-badge status-${d.status}`}>{d.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="glass-panel col-span-2">
            <h2 className="text-xl font-semibold mb-4">All Orders</h2>
            <div className="space-y-2 h-96 overflow-y-auto">
              {orders.length === 0 ? (
                <p className="text-muted">No orders in system</p>
              ) : (
                orders.map(o => (
                  <div key={o.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded">
                    <div className="flex-1">
                      <span className="block">#{o.id}: {o.origin} ➔ {o.destination}</span>
                      <span className="text-xs text-muted">
                        {o.assigned_drone ? `Drone: ${o.assigned_drone}` : 'Unassigned'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`status-badge status-${o.status}`}>{o.status}</span>
                      {o.status === 'ASSIGNED' && (
                        <button
                          className="btn-primary text-xs px-2 py-1"
                          onClick={() => updateOrderStatus(o.id, 'DELIVERED')}
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
