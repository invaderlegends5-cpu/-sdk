"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreIAM = void 0;
class CoreIAM {
    config;
    constructor(config) {
        this.config = config;
    }
    async proxy(path, init, incomingHeaders) {
        const url = `${this.config.baseUrl}${path}`;
        const headers = new Headers(init.headers);
        headers.set('X-API-Key', this.config.apiKey);
        headers.set('x-tenant-id', this.config.tenantId);
        const cookie = incomingHeaders.get('cookie');
        if (cookie)
            headers.set('cookie', cookie);
        const response = await fetch(url, { ...init, headers });
        return response;
    }
}
exports.CoreIAM = CoreIAM;
