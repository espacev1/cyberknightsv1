import { useState, useEffect } from 'react';
import { getAdminStats, getSignatures, addSignature, deleteSignature } from '../services/api';
import { ShieldAlert, BarChart3, Users, Database, Plus, Trash2, AlertCircle, CheckCircle, Loader, Shield } from 'lucide-react';
import './Admin.css';

const Admin = () => {
    const [stats, setStats] = useState(null);
    const [signatures, setSignatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newHash, setNewHash] = useState('');
    const [newThreat, setNewThreat] = useState('');
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, sigData] = await Promise.all([
                getAdminStats(),
                getSignatures()
            ]);
            setStats(statsData.stats);
            setSignatures(sigData.signatures || []);
        } catch (err) {
            console.error('Failed to load admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSignature = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!/^[a-f0-9]{64}$/i.test(newHash)) {
            setFormError('Invalid SHA-256 hash format (must be 64 hex characters)');
            return;
        }

        setSubmitting(true);
        try {
            await addSignature(newHash, newThreat);
            setFormSuccess('Signature added successfully');
            setNewHash('');
            setNewThreat('');
            loadData();
            setTimeout(() => setShowAddForm(false), 1500);
        } catch (err) {
            setFormError(err.response?.data?.error || 'Failed to add signature');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this malware signature?')) return;
        try {
            await deleteSignature(id);
            loadData();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading admin panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Admin Panel</h1>
                <p>System monitoring and malware signature management</p>
            </div>

            {/* Stats */}
            <div className="grid grid-4 admin-stats">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(6, 214, 160, 0.1)', color: 'var(--accent-cyan)' }}>
                        <BarChart3 size={24} />
                    </div>
                    <div className="stat-value">{stats?.totalScans || 0}</div>
                    <div className="stat-label">Total Scans</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                        <Shield size={24} />
                    </div>
                    <div className="stat-value" style={{ color: '#22c55e' }}>{stats?.classificationCounts?.Safe || 0}</div>
                    <div className="stat-label">Safe Scans</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <ShieldAlert size={24} />
                    </div>
                    <div className="stat-value" style={{ color: '#ef4444' }}>{stats?.classificationCounts?.['High Risk'] || 0}</div>
                    <div className="stat-label">High Risk</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                        <Database size={24} />
                    </div>
                    <div className="stat-value" style={{ color: '#8b5cf6' }}>{stats?.totalSignatures || 0}</div>
                    <div className="stat-label">Signatures</div>
                </div>
            </div>

            <div className="grid grid-2 admin-content">
                {/* Recent Scans */}
                <div className="glass-card">
                    <h3 className="card-title">Recent Scans</h3>
                    {stats?.recentScans?.length > 0 ? (
                        <div className="admin-recent-list">
                            {stats.recentScans.map((scan, i) => (
                                <div key={i} className="admin-recent-item">
                                    <div>
                                        <span className="admin-scan-name">{scan.file_name}</span>
                                        <span className="admin-scan-date">
                                            {new Date(scan.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className={`badge ${scan.classification === 'Safe' ? 'badge-safe' : scan.classification === 'Medium Risk' ? 'badge-medium' : 'badge-high'}`}>
                                        {scan.risk_score}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No scans yet</p>
                    )}
                </div>

                {/* Malware Signatures */}
                <div className="glass-card">
                    <div className="signatures-header">
                        <h3 className="card-title" style={{ margin: 0 }}>Malware Signatures</h3>
                        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)} style={{ padding: '8px 16px', fontSize: 13 }}>
                            <Plus size={14} /> Add
                        </button>
                    </div>

                    {showAddForm && (
                        <form onSubmit={handleAddSignature} className="add-signature-form animate-fade-in">
                            {formError && (
                                <div className="alert alert-error" style={{ fontSize: 13 }}>
                                    <AlertCircle size={14} /> {formError}
                                </div>
                            )}
                            {formSuccess && (
                                <div className="alert alert-success" style={{ fontSize: 13 }}>
                                    <CheckCircle size={14} /> {formSuccess}
                                </div>
                            )}
                            <input
                                type="text"
                                className="input-field"
                                placeholder="SHA-256 Hash (64 hex characters)"
                                value={newHash}
                                onChange={(e) => setNewHash(e.target.value)}
                                required
                                style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
                            />
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Threat Name (e.g., Trojan.AndroidOS.Example)"
                                value={newThreat}
                                onChange={(e) => setNewThreat(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                                {submitting ? <Loader size={14} className="spin" /> : <Plus size={14} />}
                                {submitting ? 'Adding...' : 'Add Signature'}
                            </button>
                        </form>
                    )}

                    <div className="signatures-list">
                        {signatures.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No signatures in database</p>
                        ) : (
                            signatures.map((sig) => (
                                <div key={sig.signature_id} className="signature-item">
                                    <div className="sig-info">
                                        <span className="sig-threat">{sig.threat_name}</span>
                                        <span className="sig-hash mono">{sig.sha256_hash.substring(0, 24)}...</span>
                                    </div>
                                    <button className="btn btn-ghost sig-delete" onClick={() => handleDelete(sig.signature_id)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
