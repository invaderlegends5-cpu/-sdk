// /var/www/coreIAM/sdk/javascript/nextjs/actions.ts
'use server';

import { CoreIAM } from '../core';

// This function creates a CoreIAM instance that can be configured with context
export async function executeAuthOperation(
  operation: 'login' | 'register' | 'logout' | 'getCsrfToken',
  body?: any,
  headersList?: Headers
) {
  const iam = new CoreIAM();
  
  switch(operation) {
    case 'login':
      return {
        ok: true, // We'll handle the actual call later
        operation: 'login',
        body,
        headers: headersList
      };
    case 'register':
      return {
        ok: true,
        operation: 'register', 
        body,
        headers: headersList
      };
    case 'logout':
      return {
        ok: true,
        operation: 'logout',
        headers: headersList
      };
    case 'getCsrfToken':
      return {
        ok: true,
        operation: 'getCsrfToken',
        headers: headersList
      };
    default:
      return { ok: false, error: 'Invalid operation' };
  }
}
