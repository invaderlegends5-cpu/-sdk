export interface CoreIAMConfig {
    baseUrl?: string;
    apiKey?: string;
    tenantId?: string;
}
export declare class CoreIAM {
    private baseUrl;
    private apiKey;
    private tenantId;
    /**
       * Encodes the 2-key pattern.
       * If no baseUrl is provided, it uses the production default.
       */
    static generateKey(prefix: 'pk' | 'sk', tenantId: string, baseUrl?: string): string;
    static decodeKey(key: string): {
        baseUrl: string;
        tenantId: string;
    };
    constructor(config?: CoreIAMConfig);
    proxy(path: string, init: RequestInit, incomingHeaders: Headers): Promise<Response>;
    getCsrfToken(headers: Headers): Promise<Response>;
    login(body: any, headers: Headers): Promise<Response>;
    register(body: any, headers: Headers): Promise<Response>;
    logout(headers: Headers): Promise<Response>;
}
