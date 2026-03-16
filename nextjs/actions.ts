// /var/www/coreIAM/sdk/javascript/nextjs/actions.ts
'use server';

import { cookies, headers } from 'next/headers';
import { CoreIAM } from '../core';

export interface AuthResult {
  ok: boolean;
  status: number;
  data: any;
}

/**
 * INTERNAL HELPER: Syncs fetch Response cookies to Next.js cookie store.
 * This handles both setting new JWTs and clearing cookies on logout.
 */
async function syncCookiesToNext(response: Response) {
  const cookieStore = await cookies();
  const setCookies = response.headers.getSetCookie();
  
  for (const cookieStr of setCookies) {
    const parts = cookieStr.split(';');
    const [nameValue, ...attributes] = parts;
    const [name, ...valueParts] = nameValue.split('=');
    
    const cookieOptions: any = {};
    attributes.forEach(attr => {
      const [attrName, attrValue] = attr.trim().split('=');
      const lowerName = attrName?.toLowerCase();
      if (lowerName === 'httponly') cookieOptions.httpOnly = true;
      if (lowerName === 'secure') cookieOptions.secure = true;
      if (lowerName === 'path') cookieOptions.path = attrValue || '/';
      if (lowerName === 'max-age') cookieOptions.maxAge = parseInt(attrValue, 10);
      if (lowerName === 'samesite') cookieOptions.sameSite = attrValue?.toLowerCase() || 'lax';
    });
    
    cookieStore.set(name.trim(), valueParts.join('=').trim(), cookieOptions);
  }
}

export async function loginActionSdk(identifier: string, password: string): Promise<AuthResult> {
  const reqHeaders = await headers();
  const iam = new CoreIAM();
  
  try {
    const response = await iam.loginWithCsrfProtection(identifier, password, reqHeaders);
    await syncCookiesToNext(response);
    
    return {
      ok: response.ok,
      status: response.status,
      data: await response.json().catch(() => ({}))
    };
  } catch (error) {
    return { ok: false, status: 500, data: { error: error instanceof Error ? error.message : 'Login failed' } };
  }
}

export async function registerActionSdk(userData: any): Promise<AuthResult> {
  const reqHeaders = await headers();
  const iam = new CoreIAM();
  
  try {
    // Re-using the CSRF protection logic for registration as well
    const csrfResponse = await iam.getCsrfToken(reqHeaders);
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken || csrfData._csrf;

    const authHeaders = new Headers(reqHeaders);
    authHeaders.set('x-csrf-token', csrfToken);
    
    // Chain the CSRF cookie
    const csrfCookies = csrfResponse.headers.getSetCookie();
    if (csrfCookies.length > 0) {
      const existing = reqHeaders.get('cookie') || '';
      const combined = [existing, ...csrfCookies.map(c => c.split(';')[0])].filter(Boolean).join('; ');
      authHeaders.set('cookie', combined);
    }

    const response = await iam.register(userData, authHeaders);
    await syncCookiesToNext(response);
    
    return {
      ok: response.ok,
      status: response.status,
      data: await response.json().catch(() => ({}))
    };
  } catch (error) {
    return { ok: false, status: 500, data: { error: error instanceof Error ? error.message : 'Registration failed' } };
  }
}

export async function logoutActionSdk(): Promise<AuthResult> {
  const reqHeaders = await headers();
  const iam = new CoreIAM();
  
  try {
    const response = await iam.logout(reqHeaders);
    // This will sync the "expired" cookies to the browser, effectively logging the user out locally
    await syncCookiesToNext(response);
    
    return {
      ok: response.ok,
      status: response.status,
      data: await response.json().catch(() => ({}))
    };
  } catch (error) {
    return { ok: false, status: 500, data: { error: 'Logout failed' } };
  }
}
