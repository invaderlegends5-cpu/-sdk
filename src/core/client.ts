import axios from 'axios';

export class CoreIAMClient {
  private baseUrl: string;
  private tenantId: string;

  constructor(config?: { baseUrl?: string; tenantId?: string }) {
    this.baseUrl = config?.baseUrl || process.env.COREIAM_AUTH_URL!;
    this.tenantId = config?.tenantId || 'default-tenant';
  }

  async login(credentials: { identifier: string; password: string }, csrfToken?: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, credentials, {
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
          'x-tenant-id': this.tenantId,
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async getUserTenants(jwtToken: string, userId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/tenants/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'x-tenant-id': this.tenantId,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user tenants');
    }
  }

  async createTenant(jwtToken: string, userId: string, tenantData: any) {
    try {
      const response = await axios.post(`${this.baseUrl}/tenants`, tenantData, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'Authorization': `Bearer ${jwtToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create tenant');
    }
  }

  decodeJwtPayload(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding JWT:', e);
      return null;
    }
  }
}