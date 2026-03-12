"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextHandlers = void 0;
// nextjs/index.ts
const server_1 = require("next/server");
class NextHandlers {
    iam;
    constructor(iam) {
        this.iam = iam;
    }
    async handleProxy(req, path) {
        const body = req.method !== 'GET' ? await req.json() : undefined;
        const response = await this.iam.proxy(path, {
            method: req.method,
            body: body ? JSON.stringify(body) : undefined,
        }, req.headers);
        const data = await response.json().catch(() => ({}));
        const res = server_1.NextResponse.json(data, { status: response.status });
        const setCookie = response.headers.get('set-cookie');
        if (setCookie)
            res.headers.set('set-cookie', setCookie);
        return res;
    }
}
exports.NextHandlers = NextHandlers;
