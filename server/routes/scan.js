const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authMiddleware } = require('../middleware/auth');
const { extractManifest, extractTextContent } = require('../services/manifestExtractor');
const { analyzePermissions } = require('../services/permissionAnalyzer');
const { scanHash } = require('../services/hashScanner');
const { extractUrls } = require('../services/urlExtractor');
const { detectApis } = require('../services/apiDetector');
const { computeRiskScore } = require('../services/riskEngine');
const { generateReport } = require('../services/reportGenerator');
const supabase = require('../utils/supabase');

// POST /api/scan/upload — upload APK and run full analysis
router.post('/upload', authMiddleware, upload.single('apk'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No APK file uploaded' });
        }

        const apkBuffer = req.file.buffer;
        const fileName = req.file.originalname;
        const fileSize = req.file.size;

        console.log(`[SCAN] Starting analysis of ${fileName} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

        // Step 1: Extract manifest
        const manifest = await extractManifest(apkBuffer);
        console.log(`[SCAN] Manifest extracted. Permissions: ${manifest.permissions.length}`);

        // Step 2: Analyze permissions
        const permissions = analyzePermissions(manifest.permissions);
        console.log(`[SCAN] Dangerous permissions: ${permissions.dangerousCount}`);

        // Step 3: Compute hash and check malware signatures
        const hashResult = await scanHash(apkBuffer);
        console.log(`[SCAN] Hash: ${hashResult.sha256.substring(0, 16)}... Match: ${hashResult.matched}`);

        // Step 4: Extract text content for URL/API scanning
        const textContent = extractTextContent(apkBuffer);

        // Step 5: Extract and analyze URLs
        const urlResult = extractUrls(textContent);
        console.log(`[SCAN] URLs found: ${urlResult.totalCount}, Suspicious: ${urlResult.suspiciousCount}`);

        // Step 6: Detect suspicious APIs
        const apiResult = detectApis(textContent);
        console.log(`[SCAN] Suspicious APIs: ${apiResult.totalCount}`);

        // Step 7: Compute risk score
        const riskResult = computeRiskScore(
            permissions.P,
            hashResult.M,
            urlResult.U,
            apiResult.A
        );
        console.log(`[SCAN] Risk Score: ${riskResult.score} (${riskResult.classification})`);

        // Step 8: Generate and store report
        const report = await generateReport(req.user.id, fileName, fileSize, {
            manifest,
            permissions,
            hashResult,
            urlResult,
            apiResult,
            riskResult
        });

        console.log(`[SCAN] Analysis complete. Report ID: ${report.report_id}`);

        res.json({
            success: true,
            report
        });
    } catch (err) {
        console.error('[SCAN] Error:', err);

        if (err.message === 'Only .apk files are allowed' || err.message === 'Invalid file type') {
            return res.status(400).json({ error: err.message });
        }

        res.status(500).json({ error: 'Analysis failed: ' + err.message });
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
