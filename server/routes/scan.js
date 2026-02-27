const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authMiddleware } = require('../middleware/auth');
const { generateReport } = require('../services/reportGenerator');
const supabase = require('../utils/supabase');

// POST /api/scan/save-report — Store a report analyzed on the client
router.post('/save-report', authMiddleware, async (req, res) => {
    try {
        const reportData = req.body;

        console.log(`[SCAN] Storing pre-analyzed report for: ${reportData.fileName}`);

        if (!reportData.fileName || !reportData.riskResult) {
            console.error('[SCAN] Missing required report data');
            return res.status(400).json({ error: 'Incomplete analysis data received.' });
        }

        // Construct the report object from client data
        const report = await generateReport(req.user.id, reportData.fileName, reportData.fileSize, {
            manifest: reportData.manifest,
            permissions: reportData.permissions,
            hashResult: reportData.hashResult,
            urlResult: reportData.urlResult,
            apiResult: reportData.apiResult,
            riskResult: reportData.riskResult
        });

        if (!report || report.error) {
            console.error('[SCAN] Database storage failed:', report?.error);
            return res.status(500).json({ error: 'Database storage failed: ' + (report?.error || 'Unknown error') });
        }

        console.log(`[SCAN] Report saved successfully. ID: ${report.report_id}`);
        res.json({ success: true, report });
    } catch (err) {
        console.error('[SCAN] Critical Save Error:', err);
        res.status(500).json({
            error: 'Server failed to save report: ' + err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// GET /api/scan/report/:id — get report by ID
router.get('/report/:id', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('scan_reports')
            .select('*')
            .eq('report_id', req.params.id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Verify ownership (unless admin)
        if (data.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({ success: true, report: data });
    } catch (err) {
        console.error('Report fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// GET /api/scan/history — get user's scan history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('scan_reports')
            .select('report_id, file_name, file_size, risk_score, classification, file_hash, created_at')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch history' });
        }

        res.json({ success: true, history: data || [] });
    } catch (err) {
        console.error('History fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

module.exports = router;
