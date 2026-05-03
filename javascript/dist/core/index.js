"use strict";
// // // /var/www/coreIAM/sdk/javascript/core/index.ts
// // export interface CoreIAMConfig {
// //     baseUrl: string;
// //     apiKey: string;
// //     tenantId: string;
// //   }
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreIAM = void 0;
const DEFAULT_GATEWAY_URL = "https://api.e-qalam.com";
class CoreIAM {
    apiKey = '';
    baseUrl = '';
    constructor(config) {
        this.apiKey = config?.apiKey || process.env.COREIAM_API_KEY || '';
        // Use the provided URL, or fallback to your default SaaS gateway
        this.baseUrl = config?.baseUrl || DEFAULT_GATEWAY_URL;
        if (!this.apiKey)
            throw new Error('CoreIAM: Missing API Key');
    }
    async proxy(path, init, incomingHeaders) {
        const url = `${this.baseUrl}${path}`;
        const headers = new Headers(init.headers);
        if (this.apiKey) {
            headers.set('X-API-Key', this.apiKey);
        }
        // if (this.tenantId) {
        //   headers.set('X-Tenant-ID', this.tenantId);
        // }
        const cookie = incomingHeaders.get('cookie');
        if (cookie) {
            headers.set('cookie', cookie);
            const jwtMatch = cookie.match(/jwt=([^;]+)/);
            if (jwtMatch) {
                headers.set('Authorization', `Bearer ${jwtMatch[1]}`);
            }
        }
        const csrf = incomingHeaders.get('x-csrf-token');
        if (csrf)
            headers.set('x-csrf-token', csrf);
        return fetch(url, { ...init, headers });
    }
    async getCsrfToken(headers) {
        return this.proxy('/auth/csrf-token', { method: 'GET' }, headers);
    }
    async login(body, headers) {
        return this.proxy('/auth/login', { method: 'POST', body: JSON.stringify(body) }, headers);
    }
    async register(body, headers) {
        return this.proxy('/auth/register', { method: 'POST', body: JSON.stringify(body) }, headers);
    }
    async logout(headers) {
        return this.proxy('/auth/logout', { method: 'POST' }, headers);
    }
    async loginWithCsrfProtection(identifier, password, incomingHeaders) {
        const csrfResponse = await this.getCsrfToken(incomingHeaders);
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrfToken || csrfData._csrf;
        if (!csrfToken) {
            throw new Error('Failed to obtain CSRF token');
        }
        const authHeaders = new Headers(incomingHeaders);
        authHeaders.set('x-csrf-token', csrfToken);
        const csrfCookies = csrfResponse.headers.getSetCookie();
        const existingCookieStr = incomingHeaders.get('cookie') || '';
        const newCookiePairs = csrfCookies.map(c => c.split(';')[0]);
        if (newCookiePairs.length > 0) {
            const combinedCookies = [existingCookieStr, ...newCookiePairs].filter(Boolean).join('; ');
            authHeaders.set('cookie', combinedCookies);
        }
        return this.proxy('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password }),
        }, authHeaders);
    }
    async registerWithCsrfProtection(userData, incomingHeaders) {
        const csrfResponse = await this.getCsrfToken(incomingHeaders);
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrfToken || csrfData._csrf;
        if (!csrfToken) {
            throw new Error('Failed to obtain CSRF token');
        }
        const authHeaders = new Headers(incomingHeaders);
        authHeaders.set('x-csrf-token', csrfToken);
        const setCookieHeader = csrfResponse.headers.get('set-cookie');
        if (setCookieHeader) {
            const existingCookie = incomingHeaders.get('cookie') || '';
            const updatedCookie = setCookieHeader.split(',').map(cookie => cookie.trim())
                .map(cookie => cookie.split(';')[0])
                .join('; ');
            const combinedCookies = [existingCookie, updatedCookie].filter(Boolean).join('; ');
            authHeaders.set('cookie', combinedCookies);
        }
        return this.proxy('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        }, authHeaders);
    }
}
exports.CoreIAM = CoreIAM;
