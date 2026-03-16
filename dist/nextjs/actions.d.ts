export interface AuthResult {
    ok: boolean;
    status: number;
    data: any;
}
export declare function loginActionSdk(identifier: string, password: string): Promise<AuthResult>;
export declare function registerActionSdk(userData: any): Promise<{
    ok: boolean;
    status: number;
    data: any;
}>;
export declare function logoutActionSdk(): Promise<AuthResult>;
