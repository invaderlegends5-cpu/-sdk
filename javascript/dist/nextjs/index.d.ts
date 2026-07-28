import { NextRequest, NextResponse } from 'next/server';
import { CoreIAM } from '../core';
export declare class NextHandlers {
    private iam;
    constructor(iam: CoreIAM);
    /**
      async handleProxy(req: NextRequest, internalPath: string) {
        const body = req.method !== 'GET' ? await req.json().catch(() => undefined) : undefined;
        
        let targetPath = internalPath;
        if (internalPath === '/csrf') {
          targetPath = '/auth/csrf-token';
        } else if (!internalPath.startsWith('/auth')) {
          targetPath = `/auth${internalPath}`;
        }
    
        const response = await this.iam.proxy(targetPath, {
          method: req.method,
          body: body ? JSON.stringify(body) : undefined,
          headers: { 'Content-Type': 'application/json' },
        }, req.headers);
    
        const data = await response.json().catch(() => ({}));
        const res = NextResponse.json(data, { status: response.status });
    
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) res.headers.set('set-cookie', setCookie);
    
        return res;
      }
    */
    handleProxy(req: NextRequest, internalPath: string): Promise<NextResponse<any>>;
}
