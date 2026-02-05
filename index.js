const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Allow all origins for HTML website
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/business');
const websiteRoutes = require('./routes/website');
const inventoryRoutes = require('./routes/inventory');
const billingRoutes = require('./routes/billing');
const whatsappRoutes = require('./routes/whatsapp');
const subscriptionRoutes = require('./routes/subscription');
const contactRoutes = require('./routes/contact');

// API Routes (must come before static file serving)
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/website', websiteRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Local Business Digital Booster API' });
});

// Serve static files from root directory (for HTML/CSS/JS website)
// This serves CSS, JS, and other static assets
app.use(express.static(path.join(__dirname, '..'), {
  index: false // Don't serve index.html automatically, we'll handle it below
}));

// Serve HTML website at root (must come after static files)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Serve static files in production (React app)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Local Business Digital Booster API ready!`);
});
