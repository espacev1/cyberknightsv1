import axios from 'axios';
import { supabase } from '../supabaseClient';

const API_BASE = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;

const api = axios.create({
    baseURL: API_BASE,
});

// Attach auth token to every request
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

// API Methods
export const uploadAPKToStorage = async (file, onProgress) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
        .from('apks')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            onUploadProgress: (progress) => {
                if (onProgress) {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    onProgress(percent);
                }
            }
        });

    if (error) throw error;
    return { filePath: data.path, fileName: file.name, fileSize: file.size };
};

// Helper to remove null bytes and other illegal PostgreSQL characters
const sanitizeData = (obj) => {
    if (typeof obj === 'string') {
        // Remove null bytes (\u0000) which PostgreSQL JSONB/Text doesn't support
        return obj.replace(/\0/g, '');
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitizeData);
    }
    if (typeof obj === 'object' && obj !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeData(value);
        }
        return sanitized;
    }
    return obj;
};

export const saveAnalyzedReport = async (reportData) => {
    const sanitizedReport = sanitizeData(reportData);
    const response = await api.post('/scan/save-report', sanitizedReport);
    return response.data;
};

// No longer needed for storage flow, but kept for interface consistency
export const analyzeAPKStorage = async (fileData) => {
    return { success: true };
};

// Keep legacy for small files or local dev if needed
export const uploadAPK = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('apk', file);

    const response = await api.post('/scan/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
            if (onProgress) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percent);
            }
        }
    });
    return response.data;
};

export const getReport = async (reportId) => {
    const response = await api.get(`/scan/report/${reportId}`);
    return response.data;
};

export const getHistory = async () => {
    const response = await api.get('/scan/history');
    return response.data;
};

export const getAdminStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

export const getSignatures = async () => {
    const response = await api.get('/admin/signatures');
    return response.data;
};

export const addSignature = async (sha256_hash, threat_name) => {
    const response = await api.post('/admin/signatures', { sha256_hash, threat_name });
    return response.data;
};

export const deleteSignature = async (signatureId) => {
    const response = await api.delete(`/admin/signatures/${signatureId}`);
    return response.data;
};

export default api;
