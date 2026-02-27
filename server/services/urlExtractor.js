/**
 * Extract URLs from APK content and classify them
 * Returns count of suspicious URLs (U) and detailed list
 */
function extractUrls(textContent) {
    const urlPattern = /https?:\/\/[^\s"'<>\]\)\\]+/gi;
    const matches = textContent.match(urlPattern) || [];

    // Deduplicate
    const uniqueUrls = [...new Set(matches)];

    const suspicious = [];
    const safe = [];

    for (const url of uniqueUrls) {
        const analysis = analyzeUrl(url);
        if (analysis.isSuspicious) {
            suspicious.push({ url, reasons: analysis.reasons });
        } else {
            safe.push({ url });
        }
    }

    return {
        totalCount: uniqueUrls.length,
        suspiciousCount: suspicious.length,
        safeCount: safe.length,
        suspicious,
        safe,
        allUrls: uniqueUrls,
        U: suspicious.length // Score component
    };
}

function analyzeUrl(url) {
    const reasons = [];
    const lowerUrl = url.toLowerCase();

    // Check for IP-based URLs (often malicious)
    const ipPattern = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    if (ipPattern.test(url)) {
        reasons.push('IP-based URL (no domain name)');
    }

    // Check for suspicious TLDs
    const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work', '.click', '.link', '.info', '.buzz'];
    if (suspiciousTlds.some(tld => lowerUrl.includes(tld + '/') || lowerUrl.endsWith(tld))) {
        reasons.push('Suspicious top-level domain');
    }

    // Check for URL shorteners
    const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'rebrand.ly'];
    if (shorteners.some(s => lowerUrl.includes(s))) {
        reasons.push('URL shortener detected');
    }

    // Check for suspicious keywords
    const suspiciousKeywords = ['phishing', 'malware', 'hack', 'crack', 'exploit', 'payload', 'backdoor', 'c2', 'command-and-control'];
    if (suspiciousKeywords.some(kw => lowerUrl.includes(kw))) {
        reasons.push('Suspicious keyword in URL');
    }

    // Check for non-standard ports
    const portPattern = /:\d{4,5}\//;
    if (portPattern.test(url)) {
        reasons.push('Non-standard port detected');
    }

    // Check for HTTP (non-HTTPS)
    if (lowerUrl.startsWith('http://')) {
        reasons.push('Unencrypted HTTP connection');
    }

    // Check for excessive subdomains
    try {
        const hostname = new URL(url).hostname;
        const parts = hostname.split('.');
        if (parts.length > 4) {
            reasons.push('Excessive subdomains');
        }
    } catch { }

    // Known safe domains to whitelist
    const safeDomains = [
        'google.com', 'googleapis.com', 'android.com', 'gstatic.com',
        'facebook.com', 'github.com', 'microsoft.com', 'apple.com',
        'amazonaws.com', 'cloudflare.com', 'schemas.android.com',
        'www.w3.org', 'xmlpull.org', 'apache.org'
    ];

    const isSafe = safeDomains.some(d => lowerUrl.includes(d));

    return {
        isSuspicious: !isSafe && reasons.length > 0,
        reasons
    };
}

module.exports = { extractUrls };
