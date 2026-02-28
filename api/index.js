const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
                details: 'Please run the Vercel env add commands provided.'
            });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data?.user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.user = data.user;
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

        if (!reportData.fileName || !reportData.riskResult) {
            return res.status(400).json({ error: 'Incomplete analysis data received.' });
        }

        const report = {
            user_id: req.user.id,
            file_name: reportData.fileName,
            file_size: reportData.fileSize,
            file_hash: reportData.hashResult?.sha256,
            package_name: reportData.manifest?.packageName || 'Unknown',
            permission_count: reportData.permissions?.totalCount || 0,
            dangerous_permissions: reportData.permissions?.dangerous || [],
            all_permissions: reportData.manifest?.permissions || [],
            malware_match: reportData.hashResult?.matched || false,
            matched_threat: reportData.hashResult?.threatName || null,
            url_count: reportData.urlResult?.suspiciousCount || 0,
            extracted_urls: reportData.urlResult?.suspicious || [],
            all_urls: reportData.urlResult?.allUrls || [],
            api_count: reportData.apiResult?.totalCount || 0,
            suspicious_apis: reportData.apiResult?.detected || [],
            risk_score: reportData.riskResult?.score || 0,
            risk_raw_score: reportData.riskResult?.rawScore || 0,
            classification: reportData.riskResult?.classification || 'Safe',
            risk_breakdown: reportData.riskResult?.breakdown || {},
            risk_formula: reportData.riskResult?.formula || '',
            activities: reportData.manifest?.activities || [],
            services: reportData.manifest?.services || [],
            receivers: reportData.manifest?.receivers || [],
            files_in_apk: reportData.manifest?.allFilesCount || 0,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase.from('scan_reports').insert([report]).select().single();
        if (error) {
            console.error('Supabase Insert Error:', error);
            throw error;
        }
        res.json({ success: true, report: data });
    } catch (err) {
        console.error('Store failure detail:', err);
        res.status(500).json({
            error: `Store failed: ${err.message || err.details || 'Unknown error'}`,
            details: err.message,
            supabase_error: err.code || err.details
        });
    }
});

app.get('/api/scan/history', authMiddleware, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('scan_reports')
            .select('report_id, file_name, file_size, risk_score, classification, created_at')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ success: true, history: data || [] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

app.get('/api/scan/report/:id', authMiddleware, async (req, res) => {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('scan_reports')
            .select('*')
            .eq('report_id', req.params.id)
            .single();
        if (error || !data) return res.status(404).json({ error: 'Report not found' });
        if (data.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
        res.json({ success: true, report: data });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

module.exports = app;
