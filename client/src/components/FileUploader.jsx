import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSearch, AlertCircle } from 'lucide-react';
import './FileUploader.css';

const FileUploader = ({ onFileSelect, disabled, error }) => {
    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
            return;
        }
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.android.package-archive': ['.apk'],
            'application/octet-stream': ['.apk'],
            'application/zip': ['.apk']
        },
        maxFiles: 1,
        maxSize: 50 * 1024 * 1024,
        disabled
    });

    return (
        <div className="file-uploader-wrapper">
            <div
                {...getRootProps()}
                className={`file-uploader ${isDragActive ? 'drag-active' : ''} ${isDragReject ? 'drag-reject' : ''} ${disabled ? 'disabled' : ''}`}
            >
                <input {...getInputProps()} />
                <div className="upload-icon-container">
                    {isDragReject ? (
                        <AlertCircle size={48} className="upload-icon reject" />
                    ) : isDragActive ? (
                        <FileSearch size={48} className="upload-icon active" />
                    ) : (
                        <Upload size={48} className="upload-icon" />
                    )}
                </div>
                <div className="upload-text">
                    {isDragReject ? (
                        <p className="upload-title reject">Only .apk files are accepted</p>
                    ) : isDragActive ? (
                        <p className="upload-title active">Drop your APK file here...</p>
                    ) : (
                        <>
                            <p className="upload-title">Drag & Drop your APK file here</p>
                            <p className="upload-subtitle">or click to browse your files</p>
                        </>
                    )}
                </div>
                <div className="upload-constraints">
                    <span>📦 .apk files only</span>
                    <span>📏 Maximum 50 MB</span>
                </div>
            </div>
            {error && (
                <div className="alert alert-error" style={{ marginTop: 12 }}>
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
        </div>
    );
};

export default FileUploader;
