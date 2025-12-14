// API client for DocShield backend
const API_BASE_URL = 'http://localhost:8000';

class DocShieldAPI {
    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const token = this.getToken();

        const headers: HeadersInit = {
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Don't set Content-Type for FormData (browser sets it with boundary)
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // Auth
    async register(email: string, password: string, name: string) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name }),
        });
    }

    async login(email: string, password: string) {
        const data = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (data.access_token && typeof window !== 'undefined') {
            localStorage.setItem('token', data.access_token);
        }

        return data;
    }

    async getCurrentUser() {
        return this.request('/api/auth/me');
    }

    // Documents
    async uploadDocument(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `Upload failed: ${response.status}`);
        }

        return response.json();
    }

    async getDocuments() {
        return this.request('/api/documents');
    }

    async getDocument(id: string) {
        return this.request(`/api/documents/${id}`);
    }

    async deleteDocument(id: string) {
        return this.request(`/api/documents/${id}`, {
            method: 'DELETE',
        });
    }

    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
    }
}

export const api = new DocShieldAPI();
