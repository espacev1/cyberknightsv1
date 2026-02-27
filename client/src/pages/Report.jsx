import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getReport } from '../services/api';
import RiskGauge from '../components/RiskGauge';
import { Shield, Lock, Globe, Cpu, FileText, Download, ChevronLeft, AlertTriangle, CheckCircle, Hash } from 'lucide-react';
import { jsPDF } from 'jspdf';
import './Report.css';

const Report = () => {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadReport();
    }, [id]);

    const loadReport = async () => {
        try {
            const data = await getReport(id);
            setReport(data.report);
        } catch (err) {
            setError('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        if (!report) return;

        const doc = new jsPDF();
        const margin = 20;
        let y = margin;

        // Title
        doc.setFontSize(20);
        doc.setTextColor(6, 214, 160);
        doc.text('Cyber Knights - Security Report', margin, y);
        y += 12;

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date(report.created_at).toLocaleString()}`, margin, y);
        y += 15;

        // File Info
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('File Information', margin, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(`File: ${report.file_name}`, margin, y); y += 6;
        doc.text(`SHA-256: ${report.file_hash}`, margin, y); y += 6;
        doc.text(`Size: ${(report.file_size / 1024 / 1024).toFixed(2)} MB`, margin, y); y += 6;
        doc.text(`Package: ${report.package_name || 'Unknown'}`, margin, y); y += 12;

        // Risk Score
        doc.setFontSize(14);
        doc.text('Risk Assessment', margin, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(`Risk Score: ${report.risk_score}/100`, margin, y); y += 6;
        doc.text(`Classification: ${report.classification}`, margin, y); y += 6;
        doc.text(`Formula: ${report.risk_formula}`, margin, y); y += 12;

        // Permissions
        doc.setFontSize(14);
        doc.text('Permissions Analysis', margin, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(`Dangerous Permissions: ${report.permission_count}`, margin, y); y += 6;
        if (report.dangerous_permissions) {
            report.dangerous_permissions.forEach(p => {
                if (y > 270) { doc.addPage(); y = margin; }
                doc.text(`  • ${p.name} (${p.severity})`, margin, y); y += 5;
            });
        }
        y += 6;

        // Malware
        doc.setFontSize(14);
        if (y > 260) { doc.addPage(); y = margin; }
        doc.text('Malware Scan', margin, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(`Match: ${report.malware_match ? 'DETECTED - ' + report.matched_threat : 'No known threats found'}`, margin, y);
        y += 12;

        // URLs
        doc.setFontSize(14);
        if (y > 260) { doc.addPage(); y = margin; }
        doc.text('URL Analysis', margin, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(`Suspicious URLs: ${report.url_count}`, margin, y);
        y += 12;

        // APIs  
        doc.setFontSize(14);
        if (y > 260) { doc.addPage(); y = margin; }
        doc.text('Suspicious APIs', margin, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(`Detected: ${report.api_count}`, margin, y);

        doc.save(`CyberKnights_Report_${report.file_name}.pdf`);
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading report...</p>
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="page-container">
                <div className="alert alert-error">{error || 'Report not found'}</div>
                <Link to="/dashboard" className="btn btn-secondary" style={{ marginTop: 16 }}>
                    <ChevronLeft size={16} /> Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="report-header">
                <Link to="/history" className="btn btn-ghost">
                    <ChevronLeft size={16} /> Back to History
                </Link>
                <button className="btn btn-primary" onClick={downloadPDF}>
                    <Download size={16} /> Download PDF
                </button>
            </div>

            <div className="page-header">
                <h1>Security Report</h1>
                <p>{report.file_name} — {new Date(report.created_at).toLocaleString()}</p>
            </div>

            {/* Risk Score */}
            <div className="report-risk glass-card">
                <RiskGauge score={report.risk_score} classification={report.classification} size={220} />
                <div className="risk-details">
                    <div className="risk-formula-display">
                        <code>{report.risk_formula}</code>
                    </div>
                    <div className="risk-breakdown-grid">
                        {report.risk_breakdown && Object.entries(report.risk_breakdown).map(([key, data]) => (
                            <div key={key} className="breakdown-item">
                                <span className="breakdown-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                <span className="breakdown-value">{data.value} × {data.weight} = {data.contribution}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* File Info */}
            <div className="report-section glass-card">
                <h3><FileText size={18} /> File Information</h3>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">File Name</span>
                        <span className="info-value">{report.file_name}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Package</span>
                        <span className="info-value mono">{report.package_name || 'Unknown'}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Size</span>
                        <span className="info-value">{(report.file_size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Files in APK</span>
                        <span className="info-value">{report.files_in_apk}</span>
                    </div>
                </div>
                <div className="hash-display">
                    <Hash size={14} />
                    <span className="mono">{report.file_hash}</span>
                </div>
            </div>

            {/* Malware */}
            <div className={`report-section glass-card ${report.malware_match ? 'malware-alert' : ''}`}>
                <h3><Shield size={18} /> Malware Signature Scan</h3>
                {report.malware_match ? (
                    <div className="malware-result danger">
                        <AlertTriangle size={24} />
                        <div>
                            <strong>Threat Detected: {report.matched_threat}</strong>
                            <p>This APK matches a known malware signature. Do NOT install.</p>
                        </div>
                    </div>
                ) : (
                    <div className="malware-result safe">
                        <CheckCircle size={24} />
                        <div>
                            <strong>No Known Threats Found</strong>
                            <p>SHA-256 hash does not match any known malware signatures.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Permissions */}
            <div className="report-section glass-card">
                <h3><Lock size={18} /> Permissions Analysis ({report.permission_count} dangerous)</h3>
                {report.dangerous_permissions && report.dangerous_permissions.length > 0 ? (
                    <div className="permissions-list">
                        {report.dangerous_permissions.map((p, i) => (
                            <div key={i} className={`permission-item severity-${p.severity}`}>
                                <span className={`badge badge-${p.severity === 'critical' ? 'high' : p.severity === 'high' ? 'medium' : 'safe'}`}>
                                    {p.severity}
                                </span>
                                <span className="mono">{p.shortName}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-findings">No dangerous permissions detected.</p>
                )}
            </div>

            {/* URLs */}
            <div className="report-section glass-card">
                <h3><Globe size={18} /> URL Analysis ({report.url_count} suspicious)</h3>
                {report.extracted_urls && report.extracted_urls.length > 0 ? (
                    <div className="urls-list">
                        {report.extracted_urls.map((u, i) => (
                            <div key={i} className="url-item">
                                <span className="mono url-text">{u.url}</span>
                                <div className="url-reasons">
                                    {u.reasons?.map((r, j) => (
                                        <span key={j} className="badge badge-medium">{r}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-findings">No suspicious URLs detected.</p>
                )}
            </div>

            {/* APIs */}
            <div className="report-section glass-card">
                <h3><Cpu size={18} /> Suspicious API Calls ({report.api_count})</h3>
                {report.suspicious_apis && report.suspicious_apis.length > 0 ? (
                    <div className="apis-list">
                        {report.suspicious_apis.map((a, i) => (
                            <div key={i} className="api-item">
                                <div className="api-header">
                                    <span className={`badge badge-${a.risk === 'critical' ? 'high' : a.risk === 'high' ? 'medium' : 'safe'}`}>
                                        {a.risk}
                                    </span>
                                    <span className="api-category">{a.category}</span>
                                </div>
                                <span className="mono api-name">{a.api}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-findings">No suspicious API calls detected.</p>
                )}
            </div>
        </div>
    );
};

export default Report;
