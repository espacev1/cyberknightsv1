import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHistory } from '../services/api';
import { Upload, Shield, BarChart3, Clock, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
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

    const stats = {
        totalScans: history.length,
        safeCount: history.filter(h => h.classification === 'Safe').length,
        mediumCount: history.filter(h => h.classification === 'Medium Risk').length,
        highCount: history.filter(h => h.classification === 'High Risk').length,
    };

    const recentScans = history.slice(0, 5);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Welcome back, {user?.user_metadata?.full_name || user?.email}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-4 dashboard-stats">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(6, 214, 160, 0.1)', color: 'var(--accent-cyan)' }}>
                        <BarChart3 size={24} />
                    </div>
                    <div className="stat-value">{stats.totalScans}</div>
                    <div className="stat-label">Total Scans</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-value" style={{ color: '#22c55e' }}>{stats.safeCount}</div>
                    <div className="stat-label">Safe</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.mediumCount}</div>
                    <div className="stat-label">Medium Risk</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <Shield size={24} />
                    </div>
                    <div className="stat-value" style={{ color: '#ef4444' }}>{stats.highCount}</div>
                    <div className="stat-label">High Risk</div>
                </div>
            </div>

            {/* Quick Actions + Recent Scans */}
            <div className="grid grid-2 dashboard-content">
                {/* Quick Actions */}
                <div className="glass-card">
                    <h3 className="card-title">Quick Actions</h3>
                    <div className="quick-actions">
                        <Link to="/upload" className="quick-action-card">
                            <div className="qa-icon" style={{ background: 'rgba(6, 214, 160, 0.1)' }}>
                                <Upload size={24} style={{ color: 'var(--accent-cyan)' }} />
                            </div>
                            <div className="qa-text">
                                <h4>Scan New APK</h4>
                                <p>Upload and analyze an Android APK file</p>
                            </div>
                            <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                        </Link>
                        <Link to="/history" className="quick-action-card">
                            <div className="qa-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                                <Clock size={24} style={{ color: 'var(--accent-blue)' }} />
                            </div>
                            <div className="qa-text">
                                <h4>View History</h4>
                                <p>Browse all your past scan reports</p>
                            </div>
                            <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                        </Link>
                    </div>
                </div>

                {/* Recent Scans */}
                <div className="glass-card">
                    <h3 className="card-title">Recent Scans</h3>
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : recentScans.length === 0 ? (
                        <div className="empty-state">
                            <Shield size={32} style={{ color: 'var(--text-muted)' }} />
                            <p>No scans yet. Upload your first APK!</p>
                            <Link to="/upload" className="btn btn-primary" style={{ marginTop: 8 }}>
                                <Upload size={16} /> Scan APK
                            </Link>
                        </div>
                    ) : (
                        <div className="recent-list">
                            {recentScans.map((scan) => (
                                <Link to={`/report/${scan.report_id}`} key={scan.report_id} className="recent-item">
                                    <div className="recent-info">
                                        <span className="recent-name">{scan.file_name}</span>
                                        <span className="recent-date">
                                            {new Date(scan.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className={`badge ${scan.classification === 'Safe' ? 'badge-safe' : scan.classification === 'Medium Risk' ? 'badge-medium' : 'badge-high'}`}>
                                        {scan.risk_score}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
