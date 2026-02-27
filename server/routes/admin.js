const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const supabase = require('../utils/supabase');

// GET /api/admin/stats — dashboard statistics
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        // Total scans
        const { count: totalScans } = await supabase
            .from('scan_reports')
            .select('*', { count: 'exact', head: true });

        // Scans by classification
        const { data: classificationData } = await supabase
            .from('scan_reports')
            .select('classification');

        const classificationCounts = { Safe: 0, 'Medium Risk': 0, 'High Risk': 0 };
        if (classificationData) {
            classificationData.forEach(r => {
                if (classificationCounts[r.classification] !== undefined) {
                    classificationCounts[r.classification]++;
                }
            });
        }

        // Recent scans
        const { data: recentScans } = await supabase
            .from('scan_reports')
            .select('report_id, file_name, risk_score, classification, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        // Malware matches
        const { data: malwareMatches } = await supabase
            .from('scan_reports')
            .select('*', { count: 'exact', head: true })
            .eq('malware_match', true);

        // Total signatures
        const { count: totalSignatures } = await supabase
            .from('malware_signatures')
            .select('*', { count: 'exact', head: true });

        res.json({
            success: true,
            stats: {
                totalScans: totalScans || 0,
                classificationCounts,
                malwareDetections: malwareMatches?.length || 0,
                totalSignatures: totalSignatures || 0,
                recentScans: recentScans || []
            }
        });
    } catch (err) {
        console.error('Admin stats error:', err);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

// GET /api/admin/signatures — list malware signatures
router.get('/signatures', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('malware_signatures')
            .select('*')
            .order('added_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch signatures' });
        }

        res.json({ success: true, signatures: data || [] });
    } catch (err) {
        console.error('Signatures fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch signatures' });
    }
});

// POST /api/admin/signatures — add new malware signature
router.post('/signatures', authMiddleware, async (req, res) => {
    try {
        const { sha256_hash, threat_name } = req.body;

        if (!sha256_hash || !threat_name) {
            return res.status(400).json({ error: 'sha256_hash and threat_name are required' });
        }

        if (!/^[a-f0-9]{64}$/i.test(sha256_hash)) {
            return res.status(400).json({ error: 'Invalid SHA-256 hash format' });
        }

        const { data, error } = await supabase
            .from('malware_signatures')
            .insert([{ sha256_hash: sha256_hash.toLowerCase(), threat_name }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Signature already exists' });
            }
            return res.status(500).json({ error: 'Failed to add signature' });
        }

        res.json({ success: true, signature: data });
    } catch (err) {
        console.error('Add signature error:', err);
        res.status(500).json({ error: 'Failed to add signature' });
    }
});

// DELETE /api/admin/signatures/:id — delete a malware signature
router.delete('/signatures/:id', authMiddleware, async (req, res) => {
    try {
        const { error } = await supabase
            .from('malware_signatures')
            .delete()
            .eq('signature_id', req.params.id);

        if (error) {
            return res.status(500).json({ error: 'Failed to delete signature' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Delete signature error:', err);
        res.status(500).json({ error: 'Failed to delete signature' });
    }
});

module.exports = router;
