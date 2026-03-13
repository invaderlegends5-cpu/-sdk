// /var/www/coreIAM/sdk/javascript/nextjs/index.ts
import { NextRequest, NextResponse } from 'next/server';
import { CoreIAM } from '../core';

export class NextHandlers {
  constructor(private iam: CoreIAM) {}

  async handleProxy(req: NextRequest, path: string) {
    const body = req.method !== 'GET' ? await req.json() : undefined;
    
    // EXPLICITLY capture headers from the incoming NextRequest
    const incomingHeaders = new Headers(req.headers);
    
    // Ensure critical headers are present
    const csrfToken = req.headers.get('x-csrf-token');
    const cookie = req.headers.get('cookie');

    // Call the proxy with the explicit headers
    const response = await this.iam.proxy(path, {
      method: req.method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'x-csrf-token': csrfToken }),
        ...(cookie && { 'cookie': cookie }),
      },
    }, req.headers);

    const data = await response.json().catch(() => ({}));
    const res = NextResponse.json(data, { status: response.status });

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) res.headers.set('set-cookie', setCookie);

    return res;
  }
}