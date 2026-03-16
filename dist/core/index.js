"use strict";
// // /var/www/coreIAM/sdk/javascript/core/index.ts
// export interface CoreIAMConfig {
//     baseUrl: string;
//     apiKey: string;
//     tenantId: string;
//   }
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreIAM = void 0;
const DEFAULT_GATEWAY_URL = "https://coreiam.e-qalam.com";
class CoreIAM {
    baseUrl = '';
    apiKey = '';
    tenantId = '';
    /**
       * Encodes the 2-key pattern.
       * If no baseUrl is provided, it uses the production default.
       */
    static generateKey(prefix, tenantId, baseUrl) {
        const url = (baseUrl || DEFAULT_GATEWAY_URL).replace(/\/$/, '');
        const payload = typeof window !== 'undefined'
            ? btoa(`${url}|${tenantId}`)
            : Buffer.from(`${url}|${tenantId}`).toString('base64');
        return `${prefix}_test_${payload}`;
    }
    static decodeKey(key) {
        try {
            const parts = key.split('_');
            const payload = parts.length === 3 ? parts[2] : parts[0];
            const decoded = typeof window !== 'undefined'
                ? atob(payload)
                : Buffer.from(payload, 'base64').toString('utf-8');
            const [baseUrl, tenantId] = decoded.split('|');
            return { baseUrl, tenantId };
        }
        catch (e) {
            return { baseUrl: '', tenantId: '' };
        }
    }
    // constructor(config?: CoreIAMConfig) {
    //   const secretKey = config?.apiKey || process.env.COREIAM_SECRET_KEY;
    //   const publishableKey = process.env.NEXT_PUBLIC_COREIAM_PUBLISHABLE_KEY;
    //   const targetKey = secretKey || publishableKey;
    //   if (!targetKey) {
    //     throw new Error('CoreIAM: Missing COREIAM_SECRET_KEY or NEXT_PUBLIC_COREIAM_PUBLISHABLE_KEY');
    //   }
    //   this.apiKey = secretKey || '';
    //   // Extract Base64 payload from pk_test_PAYLOAD or sk_test_PAYLOAD
    //   try {
    //     const parts = targetKey.split('_');
    //     const payload = parts.length === 3 ? parts[2] : parts[0];
    //     const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    //     const [decodedBaseUrl, decodedTenantId] = decoded.split('|');
    //     this.baseUrl = config?.baseUrl || decodedBaseUrl;
    //     this.tenantId = config?.tenantId || decodedTenantId;
    //   } catch (e) {
    //     // Fallback for non-encoded legacy keys
    //     this.baseUrl = config?.baseUrl || '';
    //     this.tenantId = config?.tenantId || '';
    //   }
    // }
    constructor(config) {
        const secretKey = config?.apiKey || process.env.COREIAM_SECRET_KEY;
        const publishableKey = process.env.NEXT_PUBLIC_COREIAM_PUBLISHABLE_KEY;
        const targetKey = secretKey || publishableKey;
        if (!targetKey)
            throw new Error('CoreIAM: Missing Keys');
        this.apiKey = secretKey || '';
        const { baseUrl, tenantId } = CoreIAM.decodeKey(targetKey);
        this.baseUrl = config?.baseUrl || baseUrl;
        this.tenantId = config?.tenantId || tenantId;
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
    // Replace your current loginWithCsrfProtection method in core/index.ts
    async loginWithCsrfProtection(identifier, password, incomingHeaders) {
        // 1. Get the CSRF token
        const csrfResponse = await this.getCsrfToken(incomingHeaders);
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrfToken || csrfData._csrf;
        if (!csrfToken) {
            throw new Error('Failed to obtain CSRF token');
        }
        // 2. Prepare headers for the login request
        const authHeaders = new Headers(incomingHeaders);
        authHeaders.set('x-csrf-token', csrfToken);
        // CRITICAL FIX: Extract the Set-Cookie array from the CSRF response
        const csrfCookies = csrfResponse.headers.getSetCookie();
        // Extract just the "name=value" pairs to build the 'Cookie' header for the backend
        const existingCookieStr = incomingHeaders.get('cookie') || '';
        const newCookiePairs = csrfCookies.map(c => c.split(';')[0]);
        if (newCookiePairs.length > 0) {
            const combinedCookies = [existingCookieStr, ...newCookiePairs].filter(Boolean).join('; ');
            authHeaders.set('cookie', combinedCookies);
        }
        // 3. Perform login with the continuous session context
        return this.proxy('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password }),
        }, authHeaders);
    }
}
exports.CoreIAM = CoreIAM;
