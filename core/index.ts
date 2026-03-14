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

export class CoreIAM {
  private baseUrl: string = '';
  private apiKey: string = '';
  private tenantId: string = '';

  constructor(config?: CoreIAMConfig) {
    const secretKey = config?.apiKey || process.env.COREIAM_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_COREIAM_PUBLISHABLE_KEY;
    const targetKey = secretKey || publishableKey;

    if (!targetKey) {
      throw new Error('CoreIAM: Missing COREIAM_SECRET_KEY or NEXT_PUBLIC_COREIAM_PUBLISHABLE_KEY');
    }

    this.apiKey = secretKey || '';

    // Extract Base64 payload from pk_test_PAYLOAD or sk_test_PAYLOAD
    try {
      const parts = targetKey.split('_');
      const payload = parts.length === 3 ? parts[2] : parts[0];
      const decoded = Buffer.from(payload, 'base64').toString('utf-8');
      const [decodedBaseUrl, decodedTenantId] = decoded.split('|');

      this.baseUrl = config?.baseUrl || decodedBaseUrl;
      this.tenantId = config?.tenantId || decodedTenantId;
    } catch (e) {
      // Fallback for non-encoded legacy keys
      this.baseUrl = config?.baseUrl || '';
      this.tenantId = config?.tenantId || '';
    }
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
}