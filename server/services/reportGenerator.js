const supabase = require('../utils/supabase');

/**
 * Generate structured report and store in Supabase
 */
async function generateReport(userId, fileName, fileSize, analysisResults) {
    const { manifest, permissions, hashResult, urlResult, apiResult, riskResult } = analysisResults;

    const report = {
        user_id: userId,
        file_name: fileName,
        file_size: fileSize,
        file_hash: hashResult.sha256,
        package_name: manifest.packageName,
        permission_count: permissions.dangerousCount,
        dangerous_permissions: permissions.dangerous,
        all_permissions: manifest.permissions,
        malware_match: hashResult.matched,
        matched_threat: hashResult.threatName,
        url_count: urlResult.suspiciousCount,
        extracted_urls: urlResult.suspicious,
        all_urls: urlResult.allUrls,
        api_count: apiResult.totalCount,
        suspicious_apis: apiResult.detected,
        risk_score: riskResult.score,
        risk_raw_score: riskResult.rawScore,
        classification: riskResult.classification,
        risk_breakdown: riskResult.breakdown,
        risk_formula: riskResult.formula,
        activities: manifest.activities,
        services: manifest.services,
        receivers: manifest.receivers,
        files_in_apk: manifest.allFiles?.length || 0
    };

    // Store in Supabase
    try {
        const { data, error } = await supabase
            .from('scan_reports')
            .insert([report])
            .select()
            .single();

        if (error) {
            console.error('Failed to store report in Supabase:', error);
            // Return report with a generated ID even if storage fails
            return { ...report, report_id: require('uuid').v4(), stored: false };
        }

        return { ...data, stored: true };
    } catch (err) {
        console.error('Report generation error:', err);
        return { ...report, report_id: require('uuid').v4(), stored: false };
    }
}

module.exports = { generateReport };
