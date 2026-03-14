"use strict";
// // /var/www/coreIAM/sdk/javascript/core/index.ts
// export interface CoreIAMConfig {
//     baseUrl: string;
//     apiKey: string;
//     tenantId: string;
//   }
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreIAM = void 0;
class CoreIAM {
    baseUrl = '';
    apiKey = '';
    tenantId = '';
    constructor(config) {
        const secretKey = config?.apiKey || process.env.COREIAM_SECRET_KEY;
        const publishableKey = process.env.NEXT_PUBLIC_COREIAM_PUBLISHABLE_KEY;
        const targetKey = secretKey || publishableKey;
        if (!targetKey) {
            throw new Error('CoreIAM: Missing COREIAM_SECRET_KEY or NEXT_PUBLIC_COREIAM_PUBLISHABLE_KEY');
        }
        this.apiKey = secretKey || '';
        // Extract Base64 payload from pk_test_PAYLOAD or sk_test_PAYLOAD
        try {
            const parts = targetKey.split('_');
            const payload = parts.length === 3 ? parts[2] : parts[0];
            const decoded = Buffer.from(payload, 'base64').toString('utf-8');
            const [decodedBaseUrl, decodedTenantId] = decoded.split('|');
            this.baseUrl = config?.baseUrl || decodedBaseUrl;
            this.tenantId = config?.tenantId || decodedTenantId;
        }
        catch (e) {
            // Fallback for non-encoded legacy keys
            this.baseUrl = config?.baseUrl || '';
            this.tenantId = config?.tenantId || '';
        }
    }
    async proxy(path, init, incomingHeaders) {
        const url = `${this.baseUrl}${path}`;
        const headers = new Headers(init.headers);
        headers.set('X-API-Key', this.apiKey);
        headers.set('x-tenant-id', this.tenantId);
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
}
exports.CoreIAM = CoreIAM;
