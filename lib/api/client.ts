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
        
        if (res.status === 403) {
            const error = await res.json();
            throw new Error(error.detail || 'Account suspended');
        }
        
        if (!res.ok) throw new Error('Login failed');
        const data = await res.json();
        this.setToken(data.access_token);
        return data;
    },


    async getCurrentUser(): Promise<{ id: string; email: string; name: string; role: string; banned?: boolean }> {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (res.status === 401) {
            this.removeToken(); // Clear invalid token
            throw new Error('401: Session expired. Please login again.');
        }
        
        if (res.status === 403) {
            const error = await res.json();
            throw new Error('BANNED: ' + (error.detail || 'Account suspended'));
        }

        if (!res.ok) throw new Error('Failed to get user');
        return res.json();
    },

    async updateProfile(name: string) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ name }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Failed to update profile');
        }
        return res.json();
    },

    async changePassword(currentPassword: string, newPassword: string) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || 'Failed to change password');
        }
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

    async getDocuments(params?: {
        search?: string;
        status_filter?: string;
        date_range?: string;
        sort_by?: string;
        sort_order?: string;
        page?: number;
        limit?: number;
        file_type?: string;
        category?: string;
        min_size?: number;
        max_size?: number;
        start_date?: string;
        end_date?: string;
    }) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        // Build query string
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.status_filter) queryParams.append('status_filter', params.status_filter);
        if (params?.date_range) queryParams.append('date_range', params.date_range);
        if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.file_type) queryParams.append('file_type', params.file_type);
        if (params?.category) queryParams.append('category', params.category);
        if (params?.min_size !== undefined) queryParams.append('min_size', params.min_size.toString());
        if (params?.max_size !== undefined) queryParams.append('max_size', params.max_size.toString());
        if (params?.start_date) queryParams.append('start_date', params.start_date);
        if (params?.end_date) queryParams.append('end_date', params.end_date);

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/api/documents${queryString ? `?${queryString}` : ''}`;

        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (res.status === 401) {
            this.removeToken();
            throw new Error('401: Session expired. Please login again.');
        }

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

    async updateDocumentCategory(documentId: string, category: string) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${API_BASE_URL}/api/documents/${documentId}/category`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ category })
        });

        if (!res.ok) throw new Error('Failed to update category');
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

    // Manual Review Methods
    async approveDocument(documentId: string, notes?: string): Promise<void> {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/api/verification/${documentId}/review`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                decision: 'approved',
                verifier_notes: notes || ''
            })
        });

        if (!response.ok) throw new Error('Failed to approve document');
    },

    async rejectDocument(documentId: string, notes: string): Promise<void> {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/api/verification/${documentId}/review`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                decision: 'rejected',
                verifier_notes: notes
            })
        });

        if (!response.ok) throw new Error('Failed to reject document');
    },

    async flagDocument(documentId: string, notes: string): Promise<void> {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/api/verification/${documentId}/review`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                decision: 'flagged',
                verifier_notes: notes
            })
        });

        if (!response.ok) throw new Error('Failed to flag document');
    },

    // Get preview token for document (for iframe/img viewing)
    async getPreviewToken(documentId: string): Promise<{ preview_token: string; expires_in: number }> {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/api/preview/token/${documentId}?token=${token}`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Failed to get preview token');
        }

        return response.json();
    },

    // Certificate Methods
    async generateCertificate(documentId: string): Promise<{ success: boolean; certificate: any }> {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/api/certificates/generate/${documentId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to generate certificate');
        }

        return response.json();
    },

    async downloadCertificate(certificateId: string): Promise<Blob> {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/api/certificates/download/${certificateId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to download certificate');
        return response.blob();
    },

    async getDocumentCertificate(documentId: string): Promise<{ exists: boolean; certificate?: any }> {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_BASE_URL}/api/certificates/document/${documentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to get certificate');
        return response.json();
    },

    // Notification Preferences
    async getNotificationPreferences() {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/notifications/preferences`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch notification preferences');
        return response.json();
    },

    async updateNotificationPreferences(preferences: any) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/notifications/preferences`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(preferences)
        });
        if (!response.ok) throw new Error('Failed to update notification preferences');
        return response.json();
    },

    async resetNotificationPreferences() {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/notifications/preferences/reset`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to reset notification preferences');
        return response.json();
    },

    // Share APIs
    async createShare(documentId: string, options: {
        expires_in: string;
        password?: string;
        allow_download: boolean;
    }) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/shares`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                document_id: documentId,
                ...options
            })
        });
        if (!response.ok) throw new Error('Failed to create share');
        return response.json();
    },

    async getUserShares() {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/shares`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch shares');
        return response.json();
    },

    async revokeShare(shareId: string) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/shares/${shareId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to revoke share');
        return response.json();
    },

    async getPublicShare(shareId: string, password?: string) {
        const params = new URLSearchParams();
        if (password) params.append('password', password);
        const url = `${API_BASE_URL}/api/public/share/${shareId}${password ? `?${params}` : ''}`;
        const response = await fetch(url);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to access share');
        }
        return response.json();
    },

    async getVerifierDocuments(params?: {
        search?: string;
        status_filter?: string;
        date_range?: string;
        show_deleted?: boolean;
        sort_by?: string;
        sort_order?: string;
        page?: number;
        limit?: number;
    }) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        // Build query string
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.status_filter) queryParams.append('status_filter', params.status_filter);
        if (params?.date_range) queryParams.append('date_range', params.date_range);
        if (params?.show_deleted !== undefined) queryParams.append('show_deleted', params.show_deleted.toString());
        if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/api/verifier/documents${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
            this.removeToken();
            throw new Error('401: Session expired. Please login again.');
        }

        if (!response.ok) throw new Error('Failed to fetch documents');
        return response.json();
    },

    async getVerifierStats() {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/api/verifier/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch verifier stats');
        return response.json();
    },

    async getVerifierQueue(filters: {
        status?: string;
        sortBy?: string;
        page?: number;
        limit?: number;
    } = {}) {
        const token = this.getToken();
        const params = new URLSearchParams();
        if (filters.status) params.append('status_filter', filters.status);
        if (filters.sortBy) params.append('sort_by', filters.sortBy);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());

        const response = await fetch(`${API_BASE_URL}/api/verifier/queue?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch review queue');
        return response.json();
    },

    async quickReview(documentId: string, decision: 'approved' | 'rejected', notes?: string) {
        const token = this.getToken();
        const params = new URLSearchParams({ decision });
        if (notes) params.append('notes', notes);

        const response = await fetch(`${API_BASE_URL}/api/verifier/quick-review/${documentId}?${params}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to review document');
        return response.json();
    },

    async getReviewHistory(filters: {
        decision?: string;
        page?: number;
        limit?: number;
    } = {}) {
        const token = this.getToken();
        const params = new URLSearchParams();
        if (filters.decision) params.append('decision', filters.decision);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());

        const response = await fetch(`${API_BASE_URL}/api/verifier/history?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch review history');
        return response.json();
    },

    // ===== ADMIN API =====
    async getAdminStats() {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to get admin stats');
        return res.json();
    },

    async getAdminUsers(params?: { search?: string; role?: string; status?: string; page?: number; limit?: number; }) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.role) queryParams.append('role', params.role);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/api/admin/users${queryString ? `?${queryString}` : ''}`;
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to get users');
        return res.json();
    },

    async updateUserRole(userId: string, role: string) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ role })
        });
        if (!res.ok) throw new Error('Failed to update role');
        return res.json();
    },

    async updateUserStatus(userId: string, status: string) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('Failed to update status');
        return res.json();
    },

    async deleteUserAdmin(userId: string) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete user');
        return res.json();
    },

    async createUser(data: { name: string; email: string; password: string; role: string }) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error('Failed to create user');
        return res.json();
    },

    async resetUserPassword(userId: string, newPassword: string) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ new_password: newPassword })
        });

        if (!res.ok) throw new Error('Failed to reset password');
        return res.json();
    }

};
