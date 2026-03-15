export interface AuthResult {
    success: boolean;
    data?: any;
    error?: string;
    status?: number;
}
export declare function getCsrfToken(): Promise<AuthResult>;
export declare function login(identifier: string, password: string, csrfToken?: string): Promise<AuthResult>;
export declare function register(userData: any, csrfToken?: string): Promise<AuthResult>;
export declare function logout(): Promise<AuthResult>;
