import { apiClient } from './client'

export interface AdminLoginResponse {
  token: string
}

export const authApi = {
  adminLogin: async (email: string, password: string): Promise<AdminLoginResponse> => {
    return apiClient.post<AdminLoginResponse>('/auth/admin/login', { email, password })
  },
}
