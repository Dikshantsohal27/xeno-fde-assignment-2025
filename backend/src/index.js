// backend/src/index.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const tenantRoutes = require('./routes/tenantRoutes');
const dataRoutes = require('./routes/dataRoutes');
const authRoutes = require('./routes/authRoutes');
const webhookRoutes = require('./routes/webhookRoutes');


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tenants', tenantRoutes); 
app.use('/api/data', dataRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/webhooks', webhookRoutes);

app.get('/', (req, res) => {
  res.send('🚀 Xeno FDE Internship Backend is Live!');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});