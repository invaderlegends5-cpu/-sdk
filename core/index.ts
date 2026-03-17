// // /var/www/coreIAM/sdk/javascript/core/index.ts
// export interface CoreIAMConfig {
//     baseUrl: string;
//     apiKey: string;
//     tenantId: string;
//   }
  
//   export class CoreIAM {
//     constructor(private config: CoreIAMConfig) {}
  
//     /**
//      * The base proxy engine that preserves your header mapping
//      */
//     async proxy(path: string, init: RequestInit, incomingHeaders: Headers) {
//       const url = `${this.config.baseUrl}${path}`;
//       const headers = new Headers(init.headers);
      
//       // Admin & Security Headers
//       headers.set('X-API-Key', this.config.apiKey);
//       headers.set('x-tenant-id', this.config.tenantId);
  
//       // Explicitly forward Cookie from incoming request
//       const cookie = incomingHeaders.get('cookie');
//     if (cookie) {
//       headers.set('cookie', cookie);

//       // AUTOMATIC INJECTION: Extract JWT from cookie and add to Authorization header
//       const jwtMatch = cookie.match(/jwt=([^;]+)/);
//       if (jwtMatch) {
//         headers.set('Authorization', `Bearer ${jwtMatch[1]}`);
//       }
//     }
  
//       // Explicitly forward CSRF from incoming request (for POST/PUT)
//       const csrf = incomingHeaders.get('x-csrf-token');
//       if (csrf) headers.set('x-csrf-token', csrf);
  
//       return fetch(url, { ...init, headers });
//     }
  
//     // Explicit Auth Methods
//     async getCsrfToken(headers: Headers) {
//       return this.proxy('/auth/csrf-token', { method: 'GET' }, headers);
//     }
  
//     async login(body: any, headers: Headers) {
//       return this.proxy('/auth/login', {
//         method: 'POST',
//         body: JSON.stringify(body),
//       }, headers);
//     }
  
//     async register(body: any, headers: Headers) {
//       return this.proxy('/auth/register', {
//         method: 'POST',
//         body: JSON.stringify(body),
//       }, headers);
//     }
  
//     async logout(headers: Headers) {
//       return this.proxy('/auth/logout', { method: 'POST' }, headers);
//     }
//   }


export interface CoreIAMConfig {
  baseUrl?: string;
  apiKey?: string;
  tenantId?: string;
}

const DEFAULT_GATEWAY_URL = "https://coreiam.e-qalam.com";

export class CoreIAM {
  private baseUrl: string = '';
  private apiKey: string = '';
  private tenantId: string = '';

/**
   * Encodes the 2-key pattern. 
   * If no baseUrl is provided, it uses the production default.
   */
static generateKey(prefix: 'pk' | 'sk', tenantId: string, baseUrl?: string): string {
  const url = (baseUrl || DEFAULT_GATEWAY_URL).replace(/\/$/, '');
  const payload = typeof window !== 'undefined' 
    ? btoa(`${url}|${tenantId}`) 
    : Buffer.from(`${url}|${tenantId}`).toString('base64');
  
  return `${prefix}_test_${payload}`;
}

static decodeKey(key: string): { baseUrl: string; tenantId: string } {
  try {
    const parts = key.split('_');
    const payload = parts.length === 3 ? parts[2] : parts[0];
    const decoded = typeof window !== 'undefined'
      ? atob(payload)
      : Buffer.from(payload, 'base64').toString('utf-8');
    
    const [baseUrl, tenantId] = decoded.split('|');
    return { baseUrl, tenantId };
  } catch (e) {
    return { baseUrl: '', tenantId: '' };
  }
}

  // constructor(config?: CoreIAMConfig) {
  //   const secretKey = config?.apiKey || process.env.COREIAM_SECRET_KEY;
  //   const publishableKey = process.env.NEXT_PUBLIC_COREIAM_PUBLISHABLE_KEY;
  //   const targetKey = secretKey || publishableKey;

  //   if (!targetKey) {
  //     throw new Error('CoreIAM: Missing COREIAM_SECRET_KEY or NEXT_PUBLIC_COREIAM_PUBLISHABLE_KEY');
  //   }

  //   this.apiKey = secretKey || '';

  //   // Extract Base64 payload from pk_test_PAYLOAD or sk_test_PAYLOAD
  //   try {
  //     const parts = targetKey.split('_');
  //     const payload = parts.length === 3 ? parts[2] : parts[0];
  //     const decoded = Buffer.from(payload, 'base64').toString('utf-8');
  //     const [decodedBaseUrl, decodedTenantId] = decoded.split('|');

  //     this.baseUrl = config?.baseUrl || decodedBaseUrl;
  //     this.tenantId = config?.tenantId || decodedTenantId;
  //   } catch (e) {
  //     // Fallback for non-encoded legacy keys
  //     this.baseUrl = config?.baseUrl || '';
  //     this.tenantId = config?.tenantId || '';
  //   }
  // }

  constructor(config?: CoreIAMConfig) {
    const secretKey = config?.apiKey || process.env.COREIAM_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_COREIAM_PUBLISHABLE_KEY;
    const targetKey = secretKey || publishableKey;

    if (!targetKey) throw new Error('CoreIAM: Missing Keys');

    this.apiKey = secretKey || '';
    const { baseUrl, tenantId } = CoreIAM.decodeKey(targetKey);
    
    this.baseUrl = config?.baseUrl || baseUrl;
    this.tenantId = config?.tenantId || tenantId;
  }

  async proxy(path: string, init: RequestInit, incomingHeaders: Headers) {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(init.headers);
    
    headers.set('X-API-Key', this.apiKey);
    headers.set('x-tenant-id', this.tenantId);

    const cookie = incomingHeaders.get('cookie');
    if (cookie) {
      headers.set('cookie', cookie);
      const jwtMatch = cookie.match(/jwt=([^;]+)/);
      if (jwtMatch) {
        headers.set('Authorization', `Bearer ${jwtMatch[1]}`);
      }
    }

    const csrf = incomingHeaders.get('x-csrf-token');
    if (csrf) headers.set('x-csrf-token', csrf);

    return fetch(url, { ...init, headers });
  }

  async getCsrfToken(headers: Headers) {
    return this.proxy('/auth/csrf-token', { method: 'GET' }, headers);
  }

  async login(body: any, headers: Headers) {
    return this.proxy('/auth/login', { method: 'POST', body: JSON.stringify(body) }, headers);
  }

  async register(body: any, headers: Headers) {
    return this.proxy('/auth/register', { method: 'POST', body: JSON.stringify(body) }, headers);
  }

  async logout(headers: Headers) {
    return this.proxy('/auth/logout', { method: 'POST' }, headers);
  }
// Replace your current loginWithCsrfProtection method in core/index.ts

async loginWithCsrfProtection(identifier: string, password: string, incomingHeaders: Headers) {
  // 1. Get the CSRF token
  const csrfResponse = await this.getCsrfToken(incomingHeaders);
  const csrfData = await csrfResponse.json();
  const csrfToken = csrfData.csrfToken || csrfData._csrf;
  
  if (!csrfToken) {
    throw new Error('Failed to obtain CSRF token');
  }
  
  // 2. Prepare headers for the login request
  const authHeaders = new Headers(incomingHeaders);
  authHeaders.set('x-csrf-token', csrfToken);
  
  // CRITICAL FIX: Extract the Set-Cookie array from the CSRF response
  const csrfCookies = csrfResponse.headers.getSetCookie();
  
  // Extract just the "name=value" pairs to build the 'Cookie' header for the backend
  const existingCookieStr = incomingHeaders.get('cookie') || '';
  const newCookiePairs = csrfCookies.map(c => c.split(';')[0]);
  
  if (newCookiePairs.length > 0) {
    const combinedCookies = [existingCookieStr, ...newCookiePairs].filter(Boolean).join('; ');
    authHeaders.set('cookie', combinedCookies);
  }
  
  // 3. Perform login with the continuous session context
  return this.proxy('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  }, authHeaders);
}

async registerWithCsrfProtection(userData: any, incomingHeaders: Headers) {
  // 1. Get the CSRF token using the incoming headers to maintain session
  const csrfResponse = await this.getCsrfToken(incomingHeaders);
  const csrfData = await csrfResponse.json();
  const csrfToken = csrfData.csrfToken || csrfData._csrf;
  
  if (!csrfToken) {
    throw new Error('Failed to obtain CSRF token');
  }
  
  // 2. Prepare headers for the register request, preserving all original headers
  const authHeaders = new Headers(incomingHeaders);
  authHeaders.set('x-csrf-token', csrfToken);
  
  // Extract cookies from the CSRF response to maintain session continuity
  const setCookieHeader = csrfResponse.headers.get('set-cookie');
  if (setCookieHeader) {
    // Combine existing cookies with new ones from the CSRF response
    const existingCookie = incomingHeaders.get('cookie') || '';
    const updatedCookie = setCookieHeader.split(',').map(cookie => cookie.trim())
      .map(cookie => cookie.split(';')[0])
      .join('; ');
    
    const combinedCookies = [existingCookie, updatedCookie]
      .filter(Boolean)
      .join('; ');
    
    authHeaders.set('cookie', combinedCookies);
  }
  
  // 3. Perform registration with the continuous session context
  return this.proxy('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  }, authHeaders);
}

}
