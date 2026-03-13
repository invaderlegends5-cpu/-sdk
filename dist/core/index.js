"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreIAM = void 0;
class CoreIAM {
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * The base proxy engine that preserves your header mapping
     */
    async proxy(path, init, incomingHeaders) {
        const url = `${this.config.baseUrl}${path}`;
        const headers = new Headers(init.headers);
        // Admin & Security Headers
        headers.set('X-API-Key', this.config.apiKey);
        headers.set('x-tenant-id', this.config.tenantId);
        // Explicitly forward Cookie from incoming request
        const cookie = incomingHeaders.get('cookie');
        if (cookie) {
            headers.set('cookie', cookie);
            // AUTOMATIC INJECTION: Extract JWT from cookie and add to Authorization header
            const jwtMatch = cookie.match(/jwt=([^;]+)/);
            if (jwtMatch) {
                headers.set('Authorization', `Bearer ${jwtMatch[1]}`);
            }
        }
        // Explicitly forward CSRF from incoming request (for POST/PUT)
        const csrf = incomingHeaders.get('x-csrf-token');
        if (csrf)
            headers.set('x-csrf-token', csrf);
        return fetch(url, { ...init, headers });
    }
    // Explicit Auth Methods
    async getCsrfToken(headers) {
        return this.proxy('/auth/csrf-token', { method: 'GET' }, headers);
    }
    async login(body, headers) {
        return this.proxy('/auth/login', {
            method: 'POST',
            body: JSON.stringify(body),
        }, headers);
    }
    async register(body, headers) {
        return this.proxy('/auth/register', {
            method: 'POST',
            body: JSON.stringify(body),
        }, headers);
    }
    async logout(headers) {
        return this.proxy('/auth/logout', { method: 'POST' }, headers);
    }
}
exports.CoreIAM = CoreIAM;
