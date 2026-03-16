export interface AuthResult {
    ok: boolean;
    status: number;
    data: any;
}
export declare function loginActionSdk(identifier: string, password: string): Promise<AuthResult>;
