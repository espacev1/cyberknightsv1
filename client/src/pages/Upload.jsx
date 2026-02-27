import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { uploadAPKToStorage, analyzeAPKStorage } from '../services/api';
import { Shield, Loader, CheckCircle, FileSearch } from 'lucide-react';
import './Upload.css';

const Upload = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState('idle'); // idle, uploading, analyzing, complete
    const [error, setError] = useState('');

    const handleFileSelect = (selectedFile) => {
        setFile(selectedFile);
        setError('');
    };

    const handleScan = async () => {
        if (!file) return;

        setUploading(true);
        setPhase('uploading');
        setError('');
        setProgress(0);

        try {
            // Step 1: Upload to Supabase Storage
            console.log('[DEBUG] Starting Supabase Storage upload for:', file.name);
            const uploadResult = await uploadAPKToStorage(file, (percent) => {
                console.log(`[DEBUG] Upload progress: ${percent}%`);
                setProgress(percent);
            });
            console.log('[DEBUG] Storage upload successful:', uploadResult);
            setProgress(100);

            // Step 2: Trigger backend analysis
            setPhase('analyzing');
            console.log('[DEBUG] Triggering backend analysis...');
            const result = await analyzeAPKStorage(uploadResult);
            console.log('[DEBUG] Analysis result:', result);

            setPhase('complete');

            setTimeout(() => {
                if (result.report?.report_id) {
                    navigate(`/report/${result.report.report_id}`);
                }
            }, 1500);
        } catch (err) {
            console.error('[SCAN] Detailed Error:', err);
            const msg = err.message || 'Analysis failed. Please check your Supabase Storage permissions.';
            setError(`Error: ${msg}`);
            setPhase('idle');
            setUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Scan APK</h1>
                <p>Upload an Android APK file for security analysis</p>
            </div>

            <div className="upload-section glass-card">
                {phase === 'idle' && (
                    <>
                        <FileUploader onFileSelect={handleFileSelect} disabled={uploading} error={error} />

                        {file && (
                            <div className="selected-file animate-fade-in">
                                <div className="file-info">
                                    <FileSearch size={20} style={{ color: 'var(--accent-cyan)' }} />
                                    <div>
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">{formatFileSize(file.size)}</span>
                                    </div>
                                </div>
                                <button className="btn btn-primary" onClick={handleScan}>
                                    <Shield size={18} />
                                    Start Analysis
                                </button>
                            </div>
                        )}
                    </>
                )}

                {(phase === 'uploading' || phase === 'analyzing' || phase === 'complete') && (
                    <div className="scan-progress">
                        <div className="progress-visual">
                            {phase === 'complete' ? (
                                <CheckCircle size={64} className="progress-icon complete" />
                            ) : (
                                <Loader size={64} className="progress-icon spinning" />
                            )}
                        </div>

                        <h3 className="progress-title">
                            {phase === 'uploading' && 'Uploading APK...'}
                            {phase === 'analyzing' && 'Analyzing Threats...'}
                            {phase === 'complete' && 'Analysis Complete!'}
                        </h3>

                        <p className="progress-subtitle">
                            {phase === 'uploading' && `${progress}% uploaded — ${file?.name}`}
                            {phase === 'analyzing' && 'Running permission analysis, malware scan, URL extraction...'}
                            {phase === 'complete' && 'Redirecting to report...'}
                        </p>

                        {phase !== 'complete' && (
                            <div className="progress-bar-wrapper">
                                <div
                                    className="progress-bar"
                                    style={{ width: phase === 'analyzing' ? '90%' : `${progress}%` }}
                                ></div>
                            </div>
                        )}

                        {phase === 'analyzing' && (
                            <div className="analysis-steps">
                                <div className="step active">
                                    <div className="step-dot"></div>
                                    <span>Extracting Manifest</span>
                                </div>
                                <div className="step active">
                                    <div className="step-dot"></div>
                                    <span>Analyzing Permissions</span>
                                </div>
                                <div className="step active">
                                    <div className="step-dot"></div>
                                    <span>Scanning Malware Signatures</span>
                                </div>
                                <div className="step">
                                    <div className="step-dot"></div>
                                    <span>Extracting URLs</span>
                                </div>
                                <div className="step">
                                    <div className="step-dot"></div>
                                    <span>Computing Risk Score</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Upload;
