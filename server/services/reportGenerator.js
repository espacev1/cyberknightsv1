const supabase = require('../utils/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate structured report and store in Supabase
 */
async function generateReport(userId, fileName, fileSize, analysisResults) {
    const { manifest, permissions, hashResult, urlResult, apiResult, riskResult } = analysisResults;

    const report = {
        user_id: userId,
        file_name: fileName,
        file_size: fileSize,
        file_hash: hashResult?.sha256 || null,
        package_name: manifest?.packageName || 'Unknown',
        permission_count: permissions?.dangerousCount || 0,
        dangerous_permissions: permissions?.dangerous || [],
        all_permissions: manifest?.permissions || [],
        malware_match: hashResult?.matched || false,
        matched_threat: hashResult?.threatName || null,
        url_count: urlResult?.suspiciousCount || 0,
        extracted_urls: urlResult?.suspicious || [],
        all_urls: urlResult?.allUrls || [],
        api_count: apiResult?.totalCount || 0,
        suspicious_apis: apiResult?.detected || [],
        risk_score: riskResult?.score || 0,
        risk_raw_score: riskResult?.rawScore || 0,
        classification: riskResult?.classification || 'Safe',
        risk_breakdown: riskResult?.breakdown || {},
        risk_formula: riskResult?.formula || '',
        activities: manifest?.activities || [],
        services: manifest?.services || [],
        receivers: manifest?.receivers || [],
        files_in_apk: manifest?.allFilesCount || manifest?.allFiles?.length || 0
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
            return { error: error.message || 'Database insert failed', details: error };
        }

        return { ...data, stored: true };
    } catch (err) {
        console.error('Report generation error:', err);
        return { error: err.message, details: err };
    }
}

module.exports = { generateReport };
