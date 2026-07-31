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
    isRefreshing = false;
    refreshPromise = null;
    constructor(config) {
        this.apiKey = config?.apiKey || process.env.COREIAM_API_KEY || '';
        // Use the provided URL, or fallback to your default SaaS gateway
        this.baseUrl = config?.baseUrl || DEFAULT_GATEWAY_URL;
        if (!this.apiKey)
            throw new Error('CoreIAM: Missing API Key');
    }
    // async proxy(path: string, init: RequestInit, incomingHeaders: Headers) {
    //   const url = `${this.baseUrl}${path}`;
    //   const headers = new Headers(init.headers);
    //   if (this.apiKey) {
    //     headers.set('X-API-Key', this.apiKey);
    //   }
    //   // if (this.tenantId) {
    //   //   headers.set('X-Tenant-ID', this.tenantId);
    //   // }
    //   const cookie = incomingHeaders.get('cookie');
    //   if (cookie) {
    //     headers.set('cookie', cookie);
    //     const jwtMatch = cookie.match(/jwt=([^;]+)/);
    //     if (jwtMatch) {
    //       headers.set('Authorization', `Bearer ${jwtMatch[1]}`);
    //     }
    //   }
    //   const csrf = incomingHeaders.get('x-csrf-token');
    //   if (csrf) headers.set('x-csrf-token', csrf);
    //   return fetch(url, { ...init, headers });
    // }
    //  async getCsrfToken(headers: Headers) {
    //    return this.proxy('/auth/csrf-token', { method: 'GET' }, headers);
    //  }
    async refreshTokens(headers) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'X-API-Key': this.apiKey,
                    'cookie': headers.get('cookie') || '', // Send the refreshToken cookie
                },
            });
            if (response.ok) {
                // Node.js doesn't save cookies, so we must manually extract the new Set-Cookie headers
                const setCookies = response.headers.getSetCookie();
                if (setCookies && setCookies.length > 0) {
                    return setCookies; // Return the array of raw Set-Cookie strings
                }
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    async proxy(path, init, incomingHeaders) {
        const url = `${this.baseUrl}${path}`;
        const headers = new Headers(init.headers);
        if (this.apiKey) {
            headers.set('X-API-Key', this.apiKey);
        }
        const userAgent = incomingHeaders.get('user-agent');
        if (userAgent)
            headers.set('user-agent', userAgent);
        const forwardedFor = incomingHeaders.get('x-forwarded-for');
        if (forwardedFor)
            headers.set('x-forwarded-for', forwardedFor);
        const cookie = incomingHeaders.get('cookie');
        if (cookie) {
            headers.set('cookie', cookie);
            // KEEP THIS: CoreIAM's JwtAuthGuard expects the Authorization header
            const jwtMatch = cookie.match(/jwt=([^;]+)/);
            if (jwtMatch) {
                headers.set('Authorization', `Bearer ${jwtMatch[1]}`);
            }
        }
        const csrf = incomingHeaders.get('x-csrf-token');
        if (csrf)
            headers.set('x-csrf-token', csrf);
        // 1. Make the original request
        let response = await fetch(url, { ...init, headers });
        // 2. If we get a 401, attempt to refresh the token and retry ONCE
        if (response.status === 401 && !headers.get('x-retry')) {
            if (!this.isRefreshing) {
                this.isRefreshing = true;
                this.refreshPromise = this.refreshTokens(incomingHeaders);
            }
            const newSetCookies = await this.refreshPromise;
            this.isRefreshing = false;
            this.refreshPromise = null;
            if (newSetCookies && newSetCookies.length > 0) {
                // Combine the new cookies into a single string for the retry request
                const cookieStr = newSetCookies.map(c => c.split(';')[0]).join('; ');
                const retryHeaders = new Headers(headers);
                retryHeaders.set('x-retry', 'true');
                retryHeaders.set('cookie', cookieStr);
                // Update the Authorization header with the new JWT
                const newJwtMatch = cookieStr.match(/jwt=([^;]+)/);
                if (newJwtMatch) {
                    retryHeaders.set('Authorization', `Bearer ${newJwtMatch[1]}`);
                }
                // Make the retry request with the fresh token
                response = await fetch(url, { ...init, headers: retryHeaders });
                // CRITICAL: Manually append the new Set-Cookie headers to the final response.
                // This allows your nextjs/index.ts file to read them and sync them to the browser!
                const modifiedResponse = new Response(response.body, response);
                newSetCookies.forEach(c => {
                    modifiedResponse.headers.append('set-cookie', c);
                });
                return modifiedResponse;
            }
        }
        return response;
    }
    async getCsrfToken(headers) {
        // Change method from 'GET' to 'POST'
        return this.proxy('/auth/csrf-token', { method: 'POST' }, headers);
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
