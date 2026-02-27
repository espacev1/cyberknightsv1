const express = require('express');
const app = express();

app.get('/api/health', (req, res) => {
    res.json({
        status: 'minimal-ok',
        timestamp: new Date().toISOString(),
        env: {
            supabase_url: !!process.env.SUPABASE_URL,
            supabase_key: !!process.env.SUPABASE_SERVICE_KEY
        }
    });
});

module.exports = app;
