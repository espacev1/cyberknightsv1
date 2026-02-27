const crypto = require('crypto');
const supabase = require('../utils/supabase');
const seedSignatures = require('../data/malwareSignatures.json');

/**
 * Compute SHA-256 hash of APK and compare against malware signature database
 * Returns malware match status (M) — 0 or 1
 */
async function scanHash(apkBuffer) {
    const hash = crypto.createHash('sha256').update(apkBuffer).digest('hex');

    let matched = false;
    let threatName = null;

    // Check Supabase database first
    try {
        const { data, error } = await supabase
            .from('malware_signatures')
            .select('threat_name')
            .eq('sha256_hash', hash)
            .single();

        if (!error && data) {
            matched = true;
            threatName = data.threat_name;
        }
    } catch (err) {
        console.warn('Supabase signature check failed, falling back to local:', err.message);
    }

    // Fallback to local seed signatures
    if (!matched) {
        const localMatch = seedSignatures.find(s => s.sha256_hash === hash);
        if (localMatch) {
            matched = true;
            threatName = localMatch.threat_name;
        }
    }

    return {
        sha256: hash,
        matched,
        threatName,
        M: matched ? 1 : 0 // Score component
    };
}

module.exports = { scanHash };
