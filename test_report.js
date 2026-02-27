const API_URL = 'http://localhost:5000/api/scan/save-report';

const mockReport = {
    fileName: "test_spotify.apk",
    fileSize: 125195000,
    manifest: {
        permissions: ["android.permission.INTERNET", "android.permission.READ_EXTERNAL_STORAGE"],
        allFilesCount: 12000,
        packageName: "com.spotify.music",
        activities: [],
        services: [],
        receivers: []
    },
    permissions: {
        totalCount: 2,
        dangerousCount: 1,
        safeCount: 1,
        dangerous: [{ name: "android.permission.READ_EXTERNAL_STORAGE", shortName: "READ_EXTERNAL_STORAGE", severity: "high" }],
        safe: [{ name: "android.permission.INTERNET", shortName: "INTERNET" }],
        P: 1
    },
    hashResult: { sha256: "ea33c11...mock", matched: false, threatName: null, M: 0 },
    urlResult: {
        totalCount: 50,
        suspiciousCount: 1,
        safeCount: 49,
        suspicious: [{ url: "http://malicious.tk", reasons: ["Suspicious pattern"] }],
        allUrls: ["https://spotify.com"],
        U: 1
    },
    apiResult: {
        detected: [{ api: "Ljava/lang/Runtime;->exec", risk: "critical" }],
        totalCount: 1,
        A: 1
    },
    riskResult: {
        score: 45,
        rawScore: 45,
        classification: "Medium Risk",
        color: "#ffaa00",
        formula: "R = (1 × 5) + (0 × 40) + (1 × 10) + (1 × 8) = 23",
        breakdown: {
            permissions: { value: 1, contribution: 5 },
            malware: { value: 0, contribution: 0 },
            urls: { value: 1, contribution: 10 },
            apis: { value: 1, contribution: 8 }
        }
    }
};

async function test() {
    console.log("Testing save-report LOCAL with mock payload...");
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mockReport)
        });
        const text = await response.text();
        console.log("Status:", response.status);
        try {
            const data = JSON.parse(text);
            console.log("JSON Success:", JSON.stringify(data, null, 2));
        } catch (e) {
            console.log("Raw Response:", text);
        }
    } catch (err) {
        console.error("Critical Error:", err.message);
    }
}

test();
