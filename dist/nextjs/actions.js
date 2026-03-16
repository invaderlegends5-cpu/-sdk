"use strict";
// /var/www/coreIAM/sdk/javascript/nextjs/actions.ts
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginActionSdk = loginActionSdk;
exports.registerActionSdk = registerActionSdk;
exports.logoutActionSdk = logoutActionSdk;
const headers_1 = require("next/headers");
const core_1 = require("../core");
/**
 * INTERNAL HELPER: Syncs fetch Response cookies to Next.js cookie store.
 * This handles both setting new JWTs and clearing cookies on logout.
 */
async function syncCookiesToNext(response) {
    const cookieStore = await (0, headers_1.cookies)();
    const setCookies = response.headers.getSetCookie();
    for (const cookieStr of setCookies) {
        const parts = cookieStr.split(';');
        const [nameValue, ...attributes] = parts;
        const [name, ...valueParts] = nameValue.split('=');
        const cookieOptions = {};
        attributes.forEach(attr => {
            const [attrName, attrValue] = attr.trim().split('=');
            const lowerName = attrName?.toLowerCase();
            if (lowerName === 'httponly')
                cookieOptions.httpOnly = true;
            if (lowerName === 'secure')
                cookieOptions.secure = true;
            if (lowerName === 'path')
                cookieOptions.path = attrValue || '/';
            if (lowerName === 'max-age')
                cookieOptions.maxAge = parseInt(attrValue, 10);
            if (lowerName === 'samesite')
                cookieOptions.sameSite = attrValue?.toLowerCase() || 'lax';
        });
        cookieStore.set(name.trim(), valueParts.join('=').trim(), cookieOptions);
    }
}
async function loginActionSdk(identifier, password) {
    const reqHeaders = await (0, headers_1.headers)();
    const iam = new core_1.CoreIAM();
    try {
        const response = await iam.loginWithCsrfProtection(identifier, password, reqHeaders);
        await syncCookiesToNext(response);
        return {
            ok: response.ok,
            status: response.status,
            data: await response.json().catch(() => ({}))
        };
    }
    catch (error) {
        return { ok: false, status: 500, data: { error: error instanceof Error ? error.message : 'Login failed' } };
    }
}
async function registerActionSdk(userData) {
    const reqHeaders = await (0, headers_1.headers)();
    const iam = new core_1.CoreIAM();
    try {
        // 1. Get CSRF Token and handle cookie chaining
        const csrfResponse = await iam.getCsrfToken(reqHeaders);
        const { csrfToken } = await csrfResponse.json();
        const authHeaders = new Headers(reqHeaders);
        authHeaders.set('x-csrf-token', csrfToken);
        // Chain the CSRF cookie to the next request
        const csrfCookies = csrfResponse.headers.getSetCookie();
        if (csrfCookies.length > 0) {
            const existing = reqHeaders.get('cookie') || '';
            const combined = [existing, ...csrfCookies.map(c => c.split(';')[0])].filter(Boolean).join('; ');
            authHeaders.set('cookie', combined);
        }
        // 2. Perform the actual registration
        const response = await iam.register(userData, authHeaders);
        // 3. Sync the resulting JWT/Session cookies back to the browser
        await syncCookiesToNext(response);
        return {
            ok: response.ok,
            status: response.status,
            data: await response.json().catch(() => ({}))
        };
    }
    catch (error) {
        return { ok: false, status: 500, data: { error: 'Registration failed' } };
    }
}
async function logoutActionSdk() {
    const reqHeaders = await (0, headers_1.headers)();
    const iam = new core_1.CoreIAM();
    try {
        const response = await iam.logout(reqHeaders);
        // This will sync the "expired" cookies to the browser, effectively logging the user out locally
        await syncCookiesToNext(response);
        return {
            ok: response.ok,
            status: response.status,
            data: await response.json().catch(() => ({}))
        };
    }
    catch (error) {
        return { ok: false, status: 500, data: { error: 'Logout failed' } };
    }
}
