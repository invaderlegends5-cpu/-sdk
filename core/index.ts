// core/index.ts
export interface CoreIAMConfig {
    baseUrl: string;
    apiKey: string;
    tenantId: string;
  }
  
  export class CoreIAM {
    constructor(private config: CoreIAMConfig) {}
  
    async proxy(path: string, init: RequestInit, incomingHeaders: Headers) {
      const url = `${this.config.baseUrl}${path}`;
      const headers = new Headers(init.headers);
      headers.set('X-API-Key', this.config.apiKey);
      headers.set('x-tenant-id', this.config.tenantId);
  
      const cookie = incomingHeaders.get('cookie');
      if (cookie) headers.set('cookie', cookie);
  
      const response = await fetch(url, { ...init, headers });
      return response;
    }
  }