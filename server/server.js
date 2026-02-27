require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const scanRoutes = require('./routes/scan');
const adminRoutes = require('./routes/admin');

app.use('/api/scan', scanRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: {
            supabase_url: !!process.env.SUPABASE_URL,
            supabase_key: !!process.env.SUPABASE_SERVICE_KEY,
            node_env: process.env.NODE_ENV
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 120MB.' });
    }

    if (err.message === 'Only .apk files are allowed') {
        return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`\n🛡️  Cyber Knights Server running on port ${PORT}`);
    console.log(`📡  API endpoint: http://localhost:${PORT}/api`);
    console.log(`🔍  Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
