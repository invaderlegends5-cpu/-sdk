// /var/www/coreIAM/sdk/javascript/nextjs/actions.ts
'use server';

import { CoreIAM } from '../core';

export interface AuthResult {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
}

let coreIAMInstance: CoreIAM | null = null;

function getCoreIAM(): CoreIAM {
  if (!coreIAMInstance) {
    coreIAMInstance = new CoreIAM();
  }
  return coreIAMInstance;
}

export async function getCsrfToken(): Promise<AuthResult> {
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
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get CSRF token',
      status: 500
    };
  }
}

export async function login(identifier: string, password: string, csrfToken?: string): Promise<AuthResult> {
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
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
      status: 500
    };
  }
}

export async function register(userData: any, csrfToken?: string): Promise<AuthResult> {
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
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
      status: 500
    };
  }
}

export async function logout(): Promise<AuthResult> {
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
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed',
      status: 500
    };
  }
}
