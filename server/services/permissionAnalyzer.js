const dangerousPermissions = require('../data/dangerousPermissions.json');

/**
 * Analyze permissions from manifest and classify dangerous ones
 * Returns count of dangerous permissions (P) and detailed breakdown
 */
function analyzePermissions(permissions) {
    const dangerous = [];
    const safe = [];

    for (const perm of permissions) {
        const permName = perm.replace('android.permission.', '');
        if (dangerousPermissions.includes(perm)) {
            dangerous.push({
                name: perm,
                shortName: permName,
                severity: getSeverity(perm)
            });
        } else {
            safe.push({
                name: perm,
                shortName: permName
            });
        }
    }

    return {
        totalCount: permissions.length,
        dangerousCount: dangerous.length,
        safeCount: safe.length,
        dangerous,
        safe,
        P: dangerous.length // Score component
    };
}

function getSeverity(permission) {
    const critical = [
        'android.permission.SEND_SMS',
        'android.permission.READ_SMS',
        'android.permission.CALL_PHONE',
        'android.permission.INSTALL_PACKAGES',
        'android.permission.REQUEST_INSTALL_PACKAGES',
        'android.permission.BIND_DEVICE_ADMIN',
        'android.permission.SYSTEM_ALERT_WINDOW',
        'android.permission.MANAGE_EXTERNAL_STORAGE'
    ];

    const high = [
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.READ_CONTACTS',
        'android.permission.READ_CALL_LOG',
        'android.permission.READ_PHONE_STATE',
        'android.permission.READ_PHONE_NUMBERS'
    ];

    if (critical.includes(permission)) return 'critical';
    if (high.includes(permission)) return 'high';
    return 'medium';
}

module.exports = { analyzePermissions };
