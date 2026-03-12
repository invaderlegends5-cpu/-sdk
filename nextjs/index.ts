// nextjs/index.ts
import { NextRequest, NextResponse } from 'next/server';
import { CoreIAM } from '../core';

export class NextHandlers {
  constructor(private iam: CoreIAM) {}

  async handleProxy(req: NextRequest, path: string) {
    const body = req.method !== 'GET' ? await req.json() : undefined;
    
    const response = await this.iam.proxy(path, {
      method: req.method,
      body: body ? JSON.stringify(body) : undefined,
    }, req.headers);

    const data = await response.json().catch(() => ({}));
    const res = NextResponse.json(data, { status: response.status });

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) res.headers.set('set-cookie', setCookie);

    return res;
  }
}