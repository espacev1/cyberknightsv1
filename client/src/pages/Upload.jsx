import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { saveAnalyzedReport } from '../services/api';
import { analyzeAPKLocally } from '../services/analysisEngine';
import { Shield, Loader, CheckCircle, FileSearch } from 'lucide-react';
import './Upload.css';

const Upload = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState('idle'); // idle, analyzing, complete
    const [error, setError] = useState('');

    const handleFileSelect = (selectedFile) => {
        setFile(selectedFile);
        setError('');
    };

    const handleScan = async () => {
        if (!file) return;

        setUploading(true);
        setPhase('analyzing');
        setError('');
        setProgress(0);

        try {
            // Step 1: Analyze locally
            console.log('[DEBUG] Starting local analysis for:', file.name);
            const reportData = await analyzeAPKLocally(file, (percent, msg) => {
                setProgress(percent);
                console.log(`[DEBUG] ${msg} (${percent}%)`);
            });
            console.log('[DEBUG] Local analysis complete:', reportData);

            // Step 2: Save report to server
            setPhase('complete');
            console.log('[DEBUG] Saving report to server...');
            const result = await saveAnalyzedReport(reportData);
            console.log('[DEBUG] Report saved:', result);

            setTimeout(() => {
                if (result.report?.report_id) {
                    navigate(`/report/${result.report.report_id}`);
                }
            }, 1000);
        } catch (err) {
            console.error('[SCAN] Analysis failure:', err);
            setError(`Analysis failure: ${err.message}`);
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

                {(phase === 'analyzing' || phase === 'complete') && (
                    <div className="scan-progress">
                        <div className="progress-visual">
                            {phase === 'complete' ? (
                                <CheckCircle size={64} className="progress-icon complete" />
                            ) : (
                                <Loader size={64} className="progress-icon spinning" />
                            )}
                        </div>

                        <h3 className="progress-title">
                            {phase === 'analyzing' && 'Analyzing Threats Locally...'}
                            {phase === 'complete' && 'Analysis Complete!'}
                        </h3>

                        <p className="progress-subtitle">
                            {phase === 'analyzing' && `${progress}% — This happens directly on your computer.`}
                            {phase === 'complete' && 'Finalizing report and redirecting...'}
                        </p>

                        <div className="progress-bar-wrapper">
                            <div
                                className="progress-bar"
                                style={{ width: phase === 'complete' ? '100%' : `${progress}%` }}
                            ></div>
                        </div>

                        {phase === 'analyzing' && (
                            <div className="analysis-steps">
                                <div className="step active">
                                    <div className="step-dot"></div>
                                    <span>Hashing and Verifying</span>
                                </div>
                                <div className="step active">
                                    <div className="step-dot"></div>
                                    <span>Extracting Manifest</span>
                                </div>
                                <div className="step active">
                                    <div className="step-dot"></div>
                                    <span>Scanning Code & Permissions</span>
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
