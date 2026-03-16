"use strict";
// /var/www/coreIAM/sdk/javascript/nextjs/actions.ts
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginActionSdk = loginActionSdk;
const headers_1 = require("next/headers");
const core_1 = require("../core");
// INTERNAL HELPER: Syncs fetch Response cookies to Next.js cookie store
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
        });
        cookieStore.set(name.trim(), valueParts.join('=').trim(), cookieOptions);
    }
}
// EXPORTED ACTION: Clean interface for the tenant
async function loginActionSdk(identifier, password) {
    const reqHeaders = await (0, headers_1.headers)();
    const iam = new core_1.CoreIAM();
    try {
        const response = await iam.loginWithCsrfProtection(identifier, password, reqHeaders);
        // Automatically sync cookies for the tenant
        await syncCookiesToNext(response);
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
