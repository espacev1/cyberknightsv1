import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Upload, FileSearch, BarChart3, Lock, Zap, Globe, ChevronRight } from 'lucide-react';
import './Landing.css';

const Landing = () => {
    const { isAuthenticated } = useAuth();

    const features = [
        {
            icon: <Upload size={24} />,
            title: 'APK Upload',
            desc: 'Securely upload Android APK files for pre-installation threat analysis'
        },
        {
            icon: <FileSearch size={24} />,
            title: 'Static Analysis',
            desc: 'Deep scan of permissions, manifest, APIs, and embedded URLs'
        },
        {
            icon: <Shield size={24} />,
            title: 'Malware Detection',
            desc: 'SHA-256 hash matching against known malware signature database'
        },
        {
            icon: <BarChart3 size={24} />,
            title: 'Risk Scoring',
            desc: 'Transparent weighted risk formula with explainable classification'
        },
        {
            icon: <Lock size={24} />,
            title: 'Secure Platform',
            desc: 'HTTPS encryption, JWT auth, and input sanitization throughout'
        },
        {
            icon: <Zap size={24} />,
            title: 'Fast Results',
            desc: 'Complete analysis in under 15 seconds with downloadable reports'
        }
    ];

    return (
        <div className="landing">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg-grid"></div>
                <div className="hero-content container">
                    <div className="hero-badge animate-fade-in">
                        <Shield size={16} />
                        <span>Next-Gen Android Security Platform</span>
                    </div>
                    <h1 className="hero-title animate-slide-up">
                        Pre-Installation<br />
                        <span className="gradient-text">APK Threat Analysis</span>
                    </h1>
                    <p className="hero-subtitle animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        Scan Android APK files before installation. Detect malware, analyze permissions,
                        identify suspicious URLs, and get transparent risk assessments — all from your browser.
                    </p>
                    <div className="hero-actions animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        {isAuthenticated ? (
                            <Link to="/upload" className="btn btn-primary btn-lg">
                                <Upload size={18} />
                                Start Scanning
                                <ChevronRight size={18} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/signup" className="btn btn-primary btn-lg">
                                    Get Started Free
                                    <ChevronRight size={18} />
                                </Link>
                                <Link to="/login" className="btn btn-secondary btn-lg">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="hero-stats animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <div className="hero-stat">
                            <span className="hero-stat-value">15s</span>
                            <span className="hero-stat-label">Avg Scan Time</span>
                        </div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat">
                            <span className="hero-stat-value">SHA-256</span>
                            <span className="hero-stat-label">Hash Matching</span>
                        </div>
                        <div className="hero-stat-divider"></div>
                        <div className="hero-stat">
                            <span className="hero-stat-value">100%</span>
                            <span className="hero-stat-label">Transparent</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Risk Formula Section */}
            <section className="formula-section container">
                <div className="formula-card glass-card animate-fade-in">
                    <h3>Risk Calculation Model</h3>
                    <div className="formula">
                        <code>R = (P × 5) + (M × 40) + (U × 10) + (A × 8)</code>
                    </div>
                    <div className="formula-legend">
                        <div className="legend-item">
                            <span className="legend-key">P</span>
                            <span>Dangerous Permissions</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-key">M</span>
                            <span>Malware Signature</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-key">U</span>
                            <span>Suspicious URLs</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-key">A</span>
                            <span>Suspicious APIs</span>
                        </div>
                    </div>
                    <div className="risk-classes">
                        <span className="badge badge-safe">0-30 Safe</span>
                        <span className="badge badge-medium">31-60 Medium</span>
                        <span className="badge badge-high">61-100 High</span>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="features container">
                <h2 className="section-title">
                    <Globe size={24} />
                    <span>Comprehensive <span className="gradient-text">Security Analysis</span></span>
                </h2>
                <div className="features-grid">
                    {features.map((feature, i) => (
                        <div key={i} className="feature-card glass-card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="cta container">
                <div className="cta-card glass-card">
                    <h2>Ready to Secure Your Apps?</h2>
                    <p>Start analyzing APK files for threats in seconds.</p>
                    <Link to={isAuthenticated ? '/upload' : '/signup'} className="btn btn-primary btn-lg">
                        {isAuthenticated ? 'Upload APK' : 'Create Account'}
                        <ChevronRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-logo">
                            <Shield size={20} />
                            <span>CyberKnights</span>
                        </div>
                        <p>© 2026 Cyber Knights. Next-Gen APK Threat Analysis Platform.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
