const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const droneRoutes = require('./routes/drones');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/drones', droneRoutes);
app.use('/orders', orderRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
