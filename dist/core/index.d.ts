export interface CoreIAMConfig {
    baseUrl: string;
    apiKey: string;
    tenantId: string;
}
export declare class CoreIAM {
    private config;
    constructor(config: CoreIAMConfig);
    proxy(path: string, init: RequestInit, incomingHeaders: Headers): Promise<Response>;
}
