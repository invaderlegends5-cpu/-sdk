// // core/index.ts
// export interface CoreIAMConfig {
//     baseUrl: string;
//     apiKey: string;
//     tenantId: string;
//   }
  
//   export class CoreIAM {
//     constructor(private config: CoreIAMConfig) {}
  
//     async proxy(path: string, init: RequestInit, incomingHeaders: Headers) {
//       const url = `${this.config.baseUrl}${path}`;
//       const headers = new Headers(init.headers);
//       headers.set('X-API-Key', this.config.apiKey);
//       headers.set('x-tenant-id', this.config.tenantId);
  
//       const cookie = incomingHeaders.get('cookie');
//       if (cookie) headers.set('cookie', cookie);
  
//       const response = await fetch(url, { ...init, headers });
//       return response;
//     }
//   }


// /var/www/coreIAM/sdk/javascript/core/index.ts
export interface CoreIAMConfig {
    baseUrl: string;
    apiKey: string;
    tenantId: string;
  }
  
  export class CoreIAM {
    constructor(private config: CoreIAMConfig) {}
  
    /**
     * The base proxy engine that preserves your header mapping
     */
    async proxy(path: string, init: RequestInit, incomingHeaders: Headers) {
      const url = `${this.config.baseUrl}${path}`;
      const headers = new Headers(init.headers);
      
      // Admin & Security Headers
      headers.set('X-API-Key', this.config.apiKey);
      headers.set('x-tenant-id', this.config.tenantId);
  
      // Explicitly forward Cookie from incoming request
      const cookie = incomingHeaders.get('cookie');
      if (cookie) headers.set('cookie', cookie);
  
      // Explicitly forward CSRF from incoming request (for POST/PUT)
      const csrf = incomingHeaders.get('x-csrf-token');
      if (csrf) headers.set('x-csrf-token', csrf);
  
      return fetch(url, { ...init, headers });
    }
  
    // Explicit Auth Methods
    async getCsrfToken(headers: Headers) {
      return this.proxy('/auth/csrf-token', { method: 'GET' }, headers);
    }
  
    async login(body: any, headers: Headers) {
      return this.proxy('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }, headers);
    }
  
    async register(body: any, headers: Headers) {
      return this.proxy('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }, headers);
    }
  
    async logout(headers: Headers) {
      return this.proxy('/auth/logout', { method: 'POST' }, headers);
    }
  }