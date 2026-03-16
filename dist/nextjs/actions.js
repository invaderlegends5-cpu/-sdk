"use strict";
// /var/www/coreIAM/sdk/javascript/nextjs/actions.ts
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithHeaders = loginWithHeaders;
exports.registerWithHeaders = registerWithHeaders;
exports.logoutWithHeaders = logoutWithHeaders;
const core_1 = require("../core");
async function loginWithHeaders(identifier, password, requestHeaders) {
    const iam = new core_1.CoreIAM();
    try {
        // Get CSRF token first
        const csrfResponse = await iam.getCsrfToken(requestHeaders);
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrfToken || csrfData._csrf;
        if (!csrfToken) {
            throw new Error('Failed to obtain CSRF token');
        }
        // Create headers object with CSRF token
        const authHeaders = new Headers(requestHeaders);
        authHeaders.set('x-csrf-token', csrfToken);
        // Perform login
        const response = await iam.login({ identifier, password }, authHeaders);
        return {
            ok: response.ok,
            status: response.status,
            data: await response.json().catch(() => ({}))
        };
    }
    catch (error) {
        return {
            ok: false,
            status: 500,
            data: { error: error instanceof Error ? error.message : 'An error occurred' }
        };
    }
}
async function registerWithHeaders(userData, requestHeaders) {
    const iam = new core_1.CoreIAM();
    try {
        // Get CSRF token first
        const csrfResponse = await iam.getCsrfToken(requestHeaders);
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrfToken || csrfData._csrf;
        if (!csrfToken) {
            throw new Error('Failed to obtain CSRF token');
        }
        // Create headers object with CSRF token
        const authHeaders = new Headers(requestHeaders);
        authHeaders.set('x-csrf-token', csrfToken);
        // Perform registration
        const response = await iam.register(userData, authHeaders);
        return {
            ok: response.ok,
            status: response.status,
            data: await response.json().catch(() => ({}))
        };
    }
    catch (error) {
        return {
            ok: false,
            status: 500,
            data: { error: error instanceof Error ? error.message : 'An error occurred' }
        };
    }
}
async function logoutWithHeaders(requestHeaders) {
    const iam = new core_1.CoreIAM();
    try {
        const response = await iam.logout(requestHeaders);
        return {
            ok: response.ok,
            status: response.status,
            data: await response.json().catch(() => ({}))
        };
    }
    catch (error) {
        return {
            ok: false,
            status: 500,
            data: { error: error instanceof Error ? error.message : 'An error occurred' }
        };
    }
}
