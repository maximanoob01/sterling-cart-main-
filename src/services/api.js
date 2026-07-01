/**
 * Centralized API service for Sterling Kart.
 * Handles base URL, auth headers, error parsing.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseUrl = API_URL;
  }

  getToken() {
    return localStorage.getItem('sterling_token');
  }

  setToken(token) {
    localStorage.setItem('sterling_token', token);
  }

  removeToken() {
    localStorage.removeItem('sterling_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const fetchOptions = { credentials: 'include', ...options };
    const headers = { 'Content-Type': 'application/json', ...fetchOptions.headers };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      let response = await fetch(url, { ...fetchOptions, headers });
      
      // If unauthorized and not already trying to refresh/login
      if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/verify-otp')) {
        try {
          const refreshRes = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
          });
          
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.success && refreshData.token) {
              this.setToken(refreshData.token);
              // Retry original request
              headers['Authorization'] = `Bearer ${refreshData.token}`;
              response = await fetch(url, { ...fetchOptions, headers });
            }
          } else {
            this.removeToken();
          }
        } catch (err) {
          this.removeToken();
        }
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
        }
        throw new ApiError(data.error || 'Something went wrong', response.status, data.details);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error('API request failed:', error);
      throw new ApiError('Network error — please check your connection', 0);
    }
  }

  get(endpoint)            { return this.request(endpoint); }
  post(endpoint, body)     { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); }
  put(endpoint, body)      { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); }
  delete(endpoint)         { return this.request(endpoint, { method: 'DELETE' }); }

  // File upload (multipart)
  async upload(endpoint, formData) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {};
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, { method: 'POST', headers, body: formData, credentials: 'include' });
    const data = await response.json();
    if (!response.ok) throw new ApiError(data.error || 'Upload failed', response.status);
    return data;
  }
}

class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const api = new ApiService();
export default api;
export { ApiError };
