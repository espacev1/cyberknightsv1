const API_URL = 'https://cyberknightsv1.vercel.app/api/scan/save-report';
const TOKEN = 'eyJhbGciOiJFUzI1NiIsImtpZCI6Ijg0OTA1MjM4LWI4ODYtNGMwMS1hN2Q1LTg5ZWU1ZDViOGExNCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2JrdmlzZ29xcnNlZGNiYW10dWVqLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJkMDAxMWMyZS02ZTQ1LTQ4Y2EtODUwNS04MDQwZTRmMDQ3ZmYiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcyMjE5NjM2LCJpYXQiOjE3NzIyMTYwMzYsImVtYWlsIjoidGVzdF91c2VyX3VuaXF1ZV85OTlAZXhhbXBsZS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoidGVzdF91c2VyX3VuaXF1ZV85OTlAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiVGVzdCBVc2VyIiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiJkMDAxMWMyZS02ZTQ1LTQ4Y2EtODUwNS04MDQwZTRmMDQ3ZmYifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc3MjIxNjAzNn1dLCJzZXNzaW9uX2lkIjoiZWI2MGJjMjYtMDg2ZC00NjliLTkzODktNGU0OTY2N2Q0MmY5IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.6WoPwlAr8svk4zcYNtQUOJKXLu9O4Ym81VDACoD8BRHTSvQmOg9MqAMjNAmij2frM_hm1XWcY8jMj78_pirGyg';

const mockReport = {
    fileName: "production_test_spotify.apk",
    fileSize: 125195000,
    manifest: {
        permissions: ["android.permission.INTERNET"],
        allFilesCount: 12000,
        packageName: "com.spotify.music",
        activities: [],
        services: [],
        receivers: []
    },
    permissions: {
        totalCount: 1,
        dangerousCount: 0,
        safeCount: 1,
        dangerous: [],
        safe: [{ name: "android.permission.INTERNET", shortName: "INTERNET" }],
        P: 0
    },
    hashResult: { sha256: "ea33c11...prod...test", matched: false, threatName: null, M: 0 },
    urlResult: {
        totalCount: 10,
        suspiciousCount: 0,
        safeCount: 10,
        suspicious: [],
        allUrls: ["https://spotify.com"],
        U: 0
    },
    apiResult: {
        detected: [],
        totalCount: 0,
        A: 0
    },
    riskResult: {
        score: 0,
        rawScore: 0,
        classification: "Safe",
        color: "#00ff88",
        formula: "R = 0",
        breakdown: {
            permissions: { value: 0, contribution: 0 },
            malware: { value: 0, contribution: 0 },
            urls: { value: 0, contribution: 0 },
            apis: { value: 0, contribution: 0 }
        }
    }
};

async function test() {
    console.log("Testing PRODUCTION save-report with mock payload...");
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
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
            console.log("Raw Response (Non-JSON):", text);
        }
    } catch (err) {
        console.error("Network/Critical Error:", err.message);
    }
}

test();
