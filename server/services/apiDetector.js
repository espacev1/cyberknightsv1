const suspiciousApiPatterns = require('../data/suspiciousApis.json');

/**
 * Detect suspicious Android API calls in APK content
 * Returns count of suspicious APIs (A) and detailed list
 */
function detectApis(textContent) {
    const detected = [];

    for (const pattern of suspiciousApiPatterns) {
        if (textContent.includes(pattern)) {
            detected.push({
                api: pattern,
                category: categorizeApi(pattern),
                risk: getRiskLevel(pattern)
            });
        }
    }

    return {
        totalCount: detected.length,
        detected,
        A: detected.length // Score component
    };
}

function categorizeApi(api) {
    if (api.includes('reflect') || api.includes('DexClassLoader') || api.includes('PathClassLoader')) {
        return 'Dynamic Code Loading';
    }
    if (api.includes('Runtime') || api.includes('ProcessBuilder')) {
        return 'System Command Execution';
    }
    if (api.includes('SmsManager')) {
        return 'SMS Operations';
    }
    if (api.includes('Cipher') || api.includes('crypto')) {
        return 'Cryptographic Operations';
    }
    if (api.includes('HttpURLConnection') || api.includes('HttpClient') || api.includes('URL')) {
        return 'Network Operations';
    }
    if (api.includes('PackageManager')) {
        return 'App Enumeration';
    }
    if (api.includes('DevicePolicyManager') || api.includes('DeviceAdmin')) {
        return 'Device Administration';
    }
    if (api.includes('TelephonyManager') || api.includes('Build;->SERIAL')) {
        return 'Device Identification';
    }
    if (api.includes('Camera') || api.includes('MediaRecorder')) {
        return 'Media Capture';
    }
    if (api.includes('LocationManager')) {
        return 'Location Tracking';
    }
    if (api.includes('ContentResolver') || api.includes('ClipboardManager')) {
        return 'Data Access';
    }
    if (api.includes('WebView')) {
        return 'WebView Operations';
    }
    if (api.includes('File;->delete')) {
        return 'File Manipulation';
    }
    if (api.includes('ActivityManager')) {
        return 'Process Monitoring';
    }
    return 'Other';
}

function getRiskLevel(api) {
    const critical = ['Runtime;->exec', 'ProcessBuilder', 'DexClassLoader', 'SmsManager', 'DevicePolicyManager'];
    const high = ['reflect', 'TelephonyManager', 'Camera;->open', 'MediaRecorder', 'LocationManager'];

    if (critical.some(c => api.includes(c))) return 'critical';
    if (high.some(h => api.includes(h))) return 'high';
    return 'medium';
}

module.exports = { detectApis };
