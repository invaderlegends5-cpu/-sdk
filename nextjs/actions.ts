// /var/www/coreIAM/sdk/javascript/nextjs/actions.ts
'use server';

import { CoreIAM } from '../core';

export interface AuthResult {
  ok: boolean;
  status: number;
  data: any;
}

export async function loginWithHeaders(identifier: string, password: string, requestHeaders: Headers): Promise<AuthResult> {
  const iam = new CoreIAM();
  
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
  } catch (error) {
    return {
      ok: false,
      status: 500,
      data: { error: error instanceof Error ? error.message : 'An error occurred' }
    };
  }
}

export async function registerWithHeaders(userData: any, requestHeaders: Headers): Promise<AuthResult> {
  const iam = new CoreIAM();
  
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
  } catch (error) {
    return {
      ok: false,
      status: 500,
      data: { error: error instanceof Error ? error.message : 'An error occurred' }
    };
  }
}

export async function logoutWithHeaders(requestHeaders: Headers): Promise<AuthResult> {
  const iam = new CoreIAM();
  
  try {
    const response = await iam.logout(requestHeaders);
    
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
