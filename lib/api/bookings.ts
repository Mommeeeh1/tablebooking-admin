import { apiClient } from './client'

export interface Booking {
  id: string
  userId: string
  date: string
  time: string
  numberOfPeople: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
  }
}

export const bookingsApi = {
  getAll: async (token: string): Promise<Booking[]> => {
    return apiClient.get<Booking[]>('/admin/bookings', token)
  },
  
  approve: async (bookingId: string, token: string): Promise<Booking> => {
    return apiClient.patch<Booking>(`/admin/bookings/${bookingId}/approve`, {}, token)
  },
  
  reject: async (bookingId: string, token: string): Promise<Booking> => {
    return apiClient.patch<Booking>(`/admin/bookings/${bookingId}/reject`, {}, token)
  },
}
