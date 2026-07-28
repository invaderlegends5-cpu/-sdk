export interface CoreIAMConfig {
    baseUrl?: string;
    apiKey?: string;
    tenantId?: string;
}
export declare class CoreIAM {
    private apiKey;
    private baseUrl;
    private isRefreshing;
    private refreshPromise;
    constructor(config?: {
        apiKey?: string;
        baseUrl?: string;
    });
    proxy(path: string, init: RequestInit, incomingHeaders: Headers): Promise<Response>;
    getCsrfToken(headers: Headers): Promise<Response>;
    login(body: any, headers: Headers): Promise<Response>;
    register(body: any, headers: Headers): Promise<Response>;
    logout(headers: Headers): Promise<Response>;
    loginWithCsrfProtection(identifier: string, password: string, incomingHeaders: Headers): Promise<Response>;
    registerWithCsrfProtection(userData: any, incomingHeaders: Headers): Promise<Response>;
    refreshTokens(headers: Headers): Promise<boolean>;
}
