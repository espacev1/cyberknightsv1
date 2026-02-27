const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Initialization (Safe)
const getSupabase = () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) return null;
    try {
        return createClient(url, key);
    } catch (e) {
        return null;
    }
};

// Auth Middleware
const authMiddleware = async (req, res, next) => {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            return res.status(500).json({
                error: 'Production Config Missing',
                details: 'Please run: npx vercel env push .env'
            });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' });

        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ error: 'Authentication failed', details: err.message });
    }
};

// Routes
app.get('/api/health', (req, res) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        config_status: {
            supabase_url: url ? 'present' : 'MISSING',
            supabase_key: key ? 'present' : 'MISSING'
        }
    });
});

app.post('/api/scan/save-report', authMiddleware, async (req, res) => {
    try {
        const reportData = req.body;
        const supabase = getSupabase();

        const report = {
            user_id: req.user.id,
            file_name: reportData.fileName,
            file_size: reportData.fileSize,
            file_hash: reportData.hashResult?.sha256,
            package_name: reportData.manifest?.packageName,
            risk_score: reportData.riskResult?.score,
            classification: reportData.riskResult?.classification,
            risk_breakdown: reportData.riskResult?.breakdown,
            all_urls: reportData.urlResult?.allUrls,
            extracted_urls: reportData.urlResult?.suspicious,
            suspicious_apis: reportData.apiResult?.detected,
            files_in_apk: reportData.manifest?.allFilesCount || 0,
            report_id: uuidv4()
        };

        const { data, error } = await supabase.from('scan_reports').insert([report]).select().single();
        if (error) throw error;
        res.json({ success: true, report: data });
    } catch (err) {
        res.status(500).json({ error: 'Store failed', details: err.message });
    }
});

module.exports = app;
