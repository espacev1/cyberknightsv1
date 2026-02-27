import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHistory } from '../services/api';
import { Clock, FileText, ExternalLink, Shield } from 'lucide-react';
import './History.css';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await getHistory();
            setHistory(data.history || []);
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getClassBadge = (classification) => {
        if (classification === 'Safe') return 'badge-safe';
        if (classification === 'Medium Risk') return 'badge-medium';
        return 'badge-high';
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Scan History</h1>
                <p>All your past APK security scans</p>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading scan history...</p>
                </div>
            ) : history.length === 0 ? (
                <div className="glass-card">
                    <div className="empty-state">
                        <Shield size={48} style={{ color: 'var(--text-muted)' }} />
                        <h3>No Scans Yet</h3>
                        <p>Upload your first APK to get started with threat analysis.</p>
                        <Link to="/upload" className="btn btn-primary" style={{ marginTop: 12 }}>
                            Start Scanning
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="glass-card history-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>File Name</th>
                                <th>Size</th>
                                <th>Risk Score</th>
                                <th>Classification</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((scan) => (
                                <tr key={scan.report_id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <FileText size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                                            <span style={{ fontWeight: 500 }}>{scan.file_name}</span>
                                        </div>
                                    </td>
                                    <td className="mono">{(scan.file_size / 1024 / 1024).toFixed(2)} MB</td>
                                    <td>
                                        <span className="score-display mono" style={{
                                            color: scan.risk_score <= 30 ? '#22c55e' : scan.risk_score <= 60 ? '#f59e0b' : '#ef4444'
                                        }}>
                                            {scan.risk_score}/100
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getClassBadge(scan.classification)}`}>
                                            {scan.classification}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 13 }}>
                                            <Clock size={14} />
                                            {formatDate(scan.created_at)}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={`/report/${scan.report_id}`} className="btn btn-ghost" style={{ padding: '6px 12px' }}>
                                            <ExternalLink size={14} />
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default History;
