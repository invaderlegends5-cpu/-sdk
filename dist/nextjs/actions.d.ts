export interface AuthResult {
    ok: boolean;
    status: number;
    data: any;
}
export declare function loginWithHeaders(identifier: string, password: string, requestHeaders: Headers): Promise<AuthResult>;
export declare function registerWithHeaders(userData: any, requestHeaders: Headers): Promise<AuthResult>;
export declare function logoutWithHeaders(requestHeaders: Headers): Promise<AuthResult>;
