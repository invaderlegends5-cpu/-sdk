export interface CoreIAMConfig {
    baseUrl: string;
    apiKey: string;
    tenantId: string;
}
export declare class CoreIAM {
    private config;
    constructor(config: CoreIAMConfig);
    /**
     * The base proxy engine that preserves your header mapping
     */
    proxy(path: string, init: RequestInit, incomingHeaders: Headers): Promise<Response>;
    getCsrfToken(headers: Headers): Promise<Response>;
    login(body: any, headers: Headers): Promise<Response>;
    register(body: any, headers: Headers): Promise<Response>;
    logout(headers: Headers): Promise<Response>;
}
