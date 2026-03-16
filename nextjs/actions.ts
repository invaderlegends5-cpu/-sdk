'use server';

import { headers } from 'next/headers';
import { CoreIAM } from '../core';

let coreIAMInstance: CoreIAM | null = null;

function getCoreIAM(): CoreIAM {
  if (!coreIAMInstance) {
    coreIAMInstance = new CoreIAM();
  }
  return coreIAMInstance;
}

export async function login(identifier: string, password: string) {
  const iam = getCoreIAM();
  const reqHeaders = headers();
  
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

export async function register(userData: any) {
  const iam = getCoreIAM();
  const reqHeaders = headers();
  
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

export async function logout() {
  const iam = getCoreIAM();
  const reqHeaders = headers();
  
  const response = await iam.logout(reqHeaders);
  
  return {
    ok: response.ok,
    status: response.status,
    data: await response.json().catch(() => ({}))
  };
}
