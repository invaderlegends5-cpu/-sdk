"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.logout = logout;
const headers_1 = require("next/headers");
const core_1 = require("../core");
let coreIAMInstance = null;
function getCoreIAM() {
    if (!coreIAMInstance) {
        coreIAMInstance = new core_1.CoreIAM();
    }
    return coreIAMInstance;
}
async function login(identifier, password) {
    const iam = getCoreIAM();
    const reqHeaders = (0, headers_1.headers)();
    // Get CSRF token first
    const csrfResponse = await iam.getCsrfToken(reqHeaders);
    const { csrfToken } = await csrfResponse.json();
    // Then perform login with the token
    const loginResponse = await iam.login({ identifier, password }, reqHeaders);
    return {
        ok: loginResponse.ok,
        status: loginResponse.status,
        data: await loginResponse.json().catch(() => ({}))
    };
}
async function register(userData) {
    const iam = getCoreIAM();
    const reqHeaders = (0, headers_1.headers)();
    // Get CSRF token first
    const csrfResponse = await iam.getCsrfToken(reqHeaders);
    const { csrfToken } = await csrfResponse.json();
    // Then perform registration with the token
    const registerResponse = await iam.register(userData, reqHeaders);
    return {
        ok: registerResponse.ok,
        status: registerResponse.status,
        data: await registerResponse.json().catch(() => ({}))
    };
}
async function logout() {
    const iam = getCoreIAM();
    const reqHeaders = (0, headers_1.headers)();
    const response = await iam.logout(reqHeaders);
    return {
        ok: response.ok,
        status: response.status,
        data: await response.json().catch(() => ({}))
    };
}
