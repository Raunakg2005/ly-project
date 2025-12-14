const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = {
    // Get JWT token from localStorage
    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('token');
    },

    // Set JWT token
    setToken(token: string) {
        if (typeof window === 'undefined') return;
        localStorage.setItem('token', token);
    },

    // Remove JWT token
    removeToken() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('token');
    },

    // Auth APIs
    async register(data: { name: string; email: string; password: string }) {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Registration failed');
        return res.json();
    },

    async login(email: string, password: string) {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error('Login failed');
        const data = await res.json();
        this.setToken(data.access_token);
        return data;
    },

    async getCurrentUser() {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to get user');
        return res.json();
    },

    // Document APIs
    async uploadDocument(file: File) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || 'Upload failed');
        }

        return res.json();
    },

    async getDocuments(skip = 0, limit = 20) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${API_BASE_URL}/api/documents?skip=${skip}&limit=${limit}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch documents');
        return res.json();
    },

    async getDocument(id: string) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch document');
        return res.json();
    },

    async deleteDocument(id: string, hardDelete = false) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${API_BASE_URL}/api/documents/${id}?hard_delete=${hardDelete}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to delete document');
        return res.json();
    },

    async downloadDocument(id: string) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${API_BASE_URL}/api/documents/${id}/download`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to download document');
        return res.blob();
    },

    // Verification APIs
    async analyzeDocument(documentId: string) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${API_BASE_URL}/api/verification/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ document_id: documentId }),
        });

        if (!res.ok) throw new Error('Failed to analyze document');
        return res.json();
    },

    async requestVerification(documentId: string) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${API_BASE_URL}/api/verification/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ document_id: documentId }),
        });

        if (!res.ok) throw new Error('Failed to request verification');
        return res.json();
    },

    async getVerificationStatus(documentId: string) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${API_BASE_URL}/api/verification/${documentId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to get verification status');
        return res.json();
    },
};
