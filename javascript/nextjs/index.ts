// // /var/www/coreIAM/sdk/javascript/nextjs/index.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { CoreIAM } from '../core';

// export class NextHandlers {
//   constructor(private iam: CoreIAM) {}

//   async handleProxy(req: NextRequest, internalPath: string) {
//     // 1. Consume body only for non-GET requests
//     const body = req.method !== 'GET' ? await req.json().catch(() => undefined) : undefined;
    
//     // 2. Map the dashboard path to the VPS backend path
//     let targetPath = internalPath;
//     if (internalPath === '/csrf') {
//       targetPath = '/auth/csrf-token';
//     } else if (!internalPath.startsWith('/auth')) {
//       targetPath = `/auth${internalPath}`;
//     }

//     // 3. Call your working proxy logic
//     const response = await this.iam.proxy(targetPath, {
//       method: req.method,
//       body: body ? JSON.stringify(body) : undefined,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     }, req.headers);

//     // 4. Construct the response
//     const data = await response.json().catch(() => ({}));
//     const res = NextResponse.json(data, { status: response.status });

//     // 5. Forward Set-Cookie (Critical for Login/Logout/CSRF)
//     const setCookie = response.headers.get('set-cookie');
//     if (setCookie) res.headers.set('set-cookie', setCookie);

//     return res;
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { CoreIAM } from '../core';

export class NextHandlers {
  constructor(private iam: CoreIAM) {}
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

  async handleProxy(req: NextRequest, internalPath: string) {
    // Force POST for csrf token route
    const method = internalPath === '/csrf' ? 'POST' : req.method;
    const body = method !== 'GET' ? await req.json().catch(() => undefined) : undefined;

    let targetPath = internalPath;
    if (internalPath === '/csrf') {
      targetPath = '/auth/csrf-token';
    } else if (!internalPath.startsWith('/auth')) {
      targetPath = `/auth${internalPath}`;
    }

    const response = await this.iam.proxy(targetPath, {
      method: method, // Use the overridden method
      body: body ? JSON.stringify(body) : undefined,
      headers: { 'Content-Type': 'application/json' },
    }, req.headers);

  //   const data = await response.json().catch(() => ({}));
  //   const res = NextResponse.json(data, { status: response.status });

  //   const setCookie = response.headers.get('set-cookie');
  //   if (setCookie) res.headers.set('set-cookie', setCookie);

  //   return res;
  // }
    const data = await response.json().catch(() => ({}));
    const res = NextResponse.json(data, { status: response.status });

    // FIX: Grab ALL Set-Cookie headers (jwt + refreshToken) and append them
    const setCookies = response.headers.getSetCookie();
    if (setCookies && setCookies.length > 0) {
      setCookies.forEach(cookie => {
        res.headers.append('set-cookie', cookie);
      });
    }

    return res;
  }
}
