import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Menu, X, Upload, History, LayoutDashboard, LogOut, UserCircle, ShieldAlert } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, signOut, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <Shield size={28} className="logo-icon" />
                    <span className="logo-text">Cyber<span className="logo-accent">Knights</span></span>
                </Link>

                <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </Link>
                            <Link to="/upload" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                                <Upload size={18} />
                                <span>Scan APK</span>
                            </Link>
                            <Link to="/history" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                                <History size={18} />
                                <span>History</span>
                            </Link>
                            <Link to="/admin" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                                <ShieldAlert size={18} />
                                <span>Admin</span>
                            </Link>
                            <div className="nav-user">
                                <UserCircle size={18} />
                                <span className="nav-email">{user?.email}</span>
                                <button className="btn btn-ghost nav-logout" onClick={handleSignOut}>
                                    <LogOut size={16} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                                Sign In
                            </Link>
                            <Link to="/signup" className="btn btn-primary nav-cta" onClick={() => setMobileMenuOpen(false)}>
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
