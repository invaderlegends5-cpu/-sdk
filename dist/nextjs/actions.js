"use strict";
// /var/www/coreIAM/sdk/javascript/nextjs/actions.ts
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCsrfToken = getCsrfToken;
exports.login = login;
exports.register = register;
exports.logout = logout;
const core_1 = require("../core");
let coreIAMInstance = null;
function getCoreIAM() {
    if (!coreIAMInstance) {
        coreIAMInstance = new core_1.CoreIAM();
    }
    return coreIAMInstance;
}
async function getCsrfToken() {
    try {
        const iam = getCoreIAM();
        const mockHeaders = new Headers(); // Server actions don't have request headers
        const response = await iam.getCsrfToken(mockHeaders);
        const data = await response.json();
        return {
            success: true,
            data,
            status: response.status
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get CSRF token',
            status: 500
        };
    }
}
async function login(identifier, password, csrfToken) {
    try {
        const iam = getCoreIAM();
        const mockHeaders = new Headers();
        if (csrfToken) {
            mockHeaders.set('x-csrf-token', csrfToken);
        }
        const response = await iam.login({ identifier, password }, mockHeaders);
        const data = await response.json().catch(() => ({}));
        return {
            success: true,
            data,
            status: response.status
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Login failed',
            status: 500
        };
    }
}
async function register(userData, csrfToken) {
    try {
        const iam = getCoreIAM();
        const mockHeaders = new Headers();
        if (csrfToken) {
            mockHeaders.set('x-csrf-token', csrfToken);
        }
        const response = await iam.register(userData, mockHeaders);
        const data = await response.json().catch(() => ({}));
        return {
            success: true,
            data,
            status: response.status
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Registration failed',
            status: 500
        };
    }
}
async function logout() {
    try {
        const iam = getCoreIAM();
        const mockHeaders = new Headers();
        const response = await iam.logout(mockHeaders);
        const data = await response.json().catch(() => ({}));
        return {
            success: true,
            data,
            status: response.status
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Logout failed',
            status: 500
        };
    }
}
