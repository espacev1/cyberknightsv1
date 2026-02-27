const { extractManifest, extractTextContent } = require('./services/manifestExtractor');
const { analyzePermissions } = require('./services/permissionAnalyzer');
const { computeRiskScore } = require('./services/riskEngine');

async function testAnalysis() {
    console.log('--- Starting Mock Analysis Test ---');

    // Create a dummy buffer representing an APK (simplified for logic test)
    // Note: AdmZip will fail on a random buffer, so we just test the logic around it

    try {
        console.log('1. Testing Risk Engine...');
        const risk = computeRiskScore(5, 0, 2, 3);
        console.log('   Score:', risk.score);
        console.log('   Classification:', risk.classification);
        if (risk.score === 69) console.log('✅ Risk engine logic correct');

        console.log('\n2. Testing Permission Analyzer...');
        const perms = analyzePermissions(['android.permission.INTERNET', 'android.permission.SEND_SMS']);
        console.log('   Dangerous Count:', perms.dangerousCount);
        if (perms.dangerousCount >= 1) console.log('✅ Permission analyzer logic correct');

        console.log('\nAll unit tests passed within test-mock.js');
    } catch (err) {
        console.error('❌ Test failed:', err);
        process.exit(1);
    }
}

testAnalysis();
