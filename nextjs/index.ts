// // /var/www/coreIAM/sdk/javascript/nextjs/index.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { CoreIAM } from '../core';

// export class NextHandlers {
//   constructor(private iam: CoreIAM) {}

//   async handleProxy(req: NextRequest, path: string) {
//     const body = req.method !== 'GET' ? await req.json() : undefined;
    
//     // EXPLICITLY capture headers from the incoming NextRequest
//     const incomingHeaders = new Headers(req.headers);
    
//     // Ensure critical headers are present
//     const csrfToken = req.headers.get('x-csrf-token');
//     const cookie = req.headers.get('cookie');

//     // Call the proxy with the explicit headers
//     const response = await this.iam.proxy(path, {
//       method: req.method,
//       body: body ? JSON.stringify(body) : undefined,
//       headers: {
//         'Content-Type': 'application/json',
//         ...(csrfToken && { 'x-csrf-token': csrfToken }),
//         ...(cookie && { 'cookie': cookie }),
//       },
//     }, req.headers);

//     const data = await response.json().catch(() => ({}));
//     const res = NextResponse.json(data, { status: response.status });

//     const setCookie = response.headers.get('set-cookie');
//     if (setCookie) res.headers.set('set-cookie', setCookie);

//     return res;
//   }
// }


// /var/www/coreIAM/sdk/javascript/nextjs/index.ts
import { NextRequest, NextResponse } from 'next/server';
import { CoreIAM } from '../core';

export class NextHandlers {
  constructor(private iam: CoreIAM) {}

  async handleProxy(req: NextRequest, internalPath: string) {
    // 1. Consume body only for non-GET requests
    const body = req.method !== 'GET' ? await req.json().catch(() => undefined) : undefined;
    
    // 2. Map the dashboard path to the VPS backend path
    let targetPath = internalPath;
    if (internalPath === '/csrf') {
      targetPath = '/auth/csrf-token';
    } else if (!internalPath.startsWith('/auth')) {
      targetPath = `/auth${internalPath}`;
    }

    // 3. Call your working proxy logic
    const response = await this.iam.proxy(targetPath, {
      method: req.method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
      },
    }, req.headers);

    // 4. Construct the response
    const data = await response.json().catch(() => ({}));
    const res = NextResponse.json(data, { status: response.status });

    // 5. Forward Set-Cookie (Critical for Login/Logout/CSRF)
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) res.headers.set('set-cookie', setCookie);

    return res;
  }
}