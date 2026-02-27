/**
 * Risk Score Computation Engine
 * Formula: R = (P × 5) + (M × 40) + (U × 10) + (A × 8)
 * 
 * P = Number of dangerous permissions
 * M = Malware signature match (0 or 1)
 * U = Number of suspicious URLs
 * A = Number of suspicious API calls
 * 
 * Classification:
 *   0-30  → Safe
 *   31-60 → Medium Risk
 *   61+   → High Risk
 */
function computeRiskScore(P, M, U, A) {
    // Calculate raw score
    let rawScore = (P * 5) + (M * 40) + (U * 10) + (A * 8);

    // Cap at 100
    const score = Math.min(rawScore, 100);

    // Classify
    let classification;
    let color;
    if (score <= 30) {
        classification = 'Safe';
        color = '#00ff88';
    } else if (score <= 60) {
        classification = 'Medium Risk';
        color = '#ffaa00';
    } else {
        classification = 'High Risk';
        color = '#ff4444';
    }

    // Generate breakdown
    const breakdown = {
        permissions: { value: P, weight: 5, contribution: P * 5 },
        malware: { value: M, weight: 40, contribution: M * 40 },
        urls: { value: U, weight: 10, contribution: U * 10 },
        apis: { value: A, weight: 8, contribution: A * 8 }
    };

    return {
        score,
        rawScore,
        classification,
        color,
        breakdown,
        formula: `R = (${P} × 5) + (${M} × 40) + (${U} × 10) + (${A} × 8) = ${rawScore}`
    };
}

module.exports = { computeRiskScore };
