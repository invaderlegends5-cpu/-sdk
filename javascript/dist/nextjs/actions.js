"use strict";
// /var/www/coreIAM/sdk/javascript/nextjs/actions.ts
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginActionSdk = loginActionSdk;
exports.registerActionSdk = registerActionSdk;
exports.logoutActionSdk = logoutActionSdk;
exports.initiateOAuthActionSdk = initiateOAuthActionSdk;
const headers_1 = require("next/headers");
const core_1 = require("../core");
/**
 * INTERNAL HELPER: Syncs fetch Response cookies to Next.js cookie store.
 * This handles both setting new JWTs and clearing cookies on logout.
 */
//async function syncCookiesToNext(response: Response) {
// const cookieStore = await cookies();
// const setCookies = response.headers.getSetCookie();
//  for (const cookieStr of setCookies) {
//    const parts = cookieStr.split(';');
//    const [nameValue, ...attributes] = parts;
//    const [name, ...valueParts] = nameValue.split('=');
//    const cookieOptions: any = {};
//    attributes.forEach(attr => {
//      const [attrName, attrValue] = attr.trim().split('=');
//      const lowerName = attrName?.toLowerCase();
//      if (lowerName === 'httponly') cookieOptions.httpOnly = true;
//      if (lowerName === 'secure') cookieOptions.secure = true;
//      if (lowerName === 'path') cookieOptions.path = attrValue || '/';
//      if (lowerName === 'max-age') cookieOptions.maxAge = parseInt(attrValue, 10);
//      if (lowerName === 'samesite') cookieOptions.sameSite = attrValue?.toLowerCase() || 'lax';
//    });
//    cookieStore.set(name.trim(), valueParts.join('=').trim(), cookieOptions);
//  }
//}
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
        let isDeleting = false;
        attributes.forEach(attr => {
            const [attrName, attrValue] = attr.trim().split('=');
            const lowerName = attrName?.toLowerCase();
            if (lowerName === 'httponly')
                cookieOptions.httpOnly = true;
            if (lowerName === 'secure')
                cookieOptions.secure = true;
            if (lowerName === 'path')
                cookieOptions.path = attrValue || '/';
            if (lowerName === 'max-age') {
                const maxAge = parseInt(attrValue, 10);
                if (maxAge <= 0) {
                    isDeleting = true; // Cookie is being deleted
                }
                else {
                    cookieOptions.maxAge = maxAge;
                }
            }
            if (lowerName === 'expires') {
                const expiryDate = new Date(attrValue);
                if (expiryDate.getTime() < Date.now()) {
                    isDeleting = true; // Cookie has expired
                }
                else {
                    cookieOptions.expires = expiryDate;
                }
            }
            if (lowerName === 'samesite')
                cookieOptions.sameSite = attrValue?.toLowerCase() || 'lax';
        });
        const cookieName = name.trim();
        const cookieValue = valueParts.join('=').trim();
        if (isDeleting || cookieValue === '') {
            // Properly delete the cookie instead of just setting an empty value
            cookieStore.delete(cookieName);
        }
        else {
            // Set the cookie with the new value
            cookieStore.set(cookieName, cookieValue, cookieOptions);
        }
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
// export async function registerActionSdk(userData: any) {
//   const reqHeaders = await headers();
//   const iam = new CoreIAM();
//   try {
//     // 1. Get CSRF Token
//     const csrfRes = await iam.getCsrfToken(reqHeaders);
//     const csrfData = await csrfRes.json();
//     const csrfToken = csrfData.csrfToken;
//     // 2. Build Headers - MUST include Content-Type and Cookies for the CSRF session
//     const authHeaders = new Headers();
//     authHeaders.set('Content-Type', 'application/json');
//     authHeaders.set('x-csrf-token', csrfToken);
//     const csrfCookies = csrfRes.headers.getSetCookie();
//     if (csrfCookies.length > 0) {
//       authHeaders.set('cookie', csrfCookies.map(c => c.split(';')[0]).join('; '));
//     }
//     // 3. Call Core Register - Pass the flat object the AuthService expects
//     const response = await iam.register(userData, authHeaders);
//     // 4. Sync JWT/Session cookies back to Next.js
//     const cookieStore = await cookies();
//     response.headers.getSetCookie().forEach(cookieStr => {
//       const [nameValue] = cookieStr.split(';');
//       const [name, ...value] = nameValue.split('=');
//       cookieStore.set(name.trim(), value.join('=').trim(), { path: '/' });
//     });
//     return {
//       ok: response.ok,
//       status: response.status,
//       data: await response.json().catch(() => ({}))
//     };
//   } catch (error: any) {
//     return { ok: false, status: 500, data: { message: error.message } };
//   }
// }
async function registerActionSdk(userData) {
    const reqHeaders = await (0, headers_1.headers)();
    const iam = new core_1.CoreIAM();
    try {
        // Use the same unified approach as login
        const response = await iam.registerWithCsrfProtection(userData, reqHeaders);
        await syncCookiesToNext(response);
        return {
            ok: response.ok,
            status: response.status,
            data: await response.json().catch(() => ({}))
        };
    }
    catch (error) {
        return { ok: false, status: 500, data: { error: error instanceof Error ? error.message : 'Registration failed' } };
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
async function initiateOAuthActionSdk(provider, redirectUri) {
    const iam = new core_1.CoreIAM();
    // We don't need cookies here, just the API key
    const response = await iam.proxy(`/auth/oauth/initiate/${provider}?redirectUri=${encodeURIComponent(redirectUri)}&scopes=email,profile`, {
        method: 'GET',
    }, new Headers());
    const data = await response.json();
    if (data.url) {
        // Redirect the browser to Google/GitHub
        window.location.href = data.url;
    }
}
