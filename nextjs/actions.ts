// /var/www/coreIAM/sdk/javascript/nextjs/actions.ts
'use server';

import { cookies, headers } from 'next/headers';
import { CoreIAM } from '../core';

export interface AuthResult {
  ok: boolean;
  status: number;
  data: any;
}

// INTERNAL HELPER: Syncs fetch Response cookies to Next.js cookie store
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
    });
    
    cookieStore.set(name.trim(), valueParts.join('=').trim(), cookieOptions);
  }
}

// EXPORTED ACTION: Clean interface for the tenant
export async function loginActionSdk(identifier: string, password: string): Promise<AuthResult> {
  const reqHeaders = await headers();
  const iam = new CoreIAM();
  
  try {
    const response = await iam.loginWithCsrfProtection(identifier, password, reqHeaders);
    
    // Automatically sync cookies for the tenant
    await syncCookiesToNext(response);
    
    return {
      ok: response.ok,
      status: response.status,
      data: await response.json().catch(() => ({}))
    };
  } catch (error) {
    return {
      ok: false,
      status: 500,
      data: { error: error instanceof Error ? error.message : 'An error occurred' }
    };
  }
}
