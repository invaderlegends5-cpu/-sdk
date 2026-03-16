export declare function login(identifier: string, password: string): Promise<{
    ok: boolean;
    status: number;
    data: any;
}>;
export declare function register(userData: any): Promise<{
    ok: boolean;
    status: number;
    data: any;
}>;
export declare function logout(): Promise<{
    ok: boolean;
    status: number;
    data: any;
}>;
