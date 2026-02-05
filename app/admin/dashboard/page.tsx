'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { bookingsApi, Booking } from '@/lib/api/bookings'
import { auth } from '@/lib/auth'
import { BookingCard } from '@/components/BookingCard'
import { useToast } from '@/components/Toast'

export default function DashboardPage() {
  const router = useRouter()
  const { showToast, confirm } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Redirect to login if no valid token; otherwise load all bookings
  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/admin/login')
      return
    }

    loadBookings()
  }, [router])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const token = auth.getToken()
      if (!token) {
        router.push('/admin/login')
        return
      }
      const data = await bookingsApi.getAll(token)
      setBookings(data)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load bookings', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Confirm dialog before approve/reject to prevent accidental clicks
  const handleApprove = async (bookingId: string) => {
    const confirmed = await confirm({
      title: 'Approve Booking',
      message: 'Are you sure you want to approve this booking?',
      confirmText: 'Approve',
      cancelText: 'Cancel',
    })
    if (!confirmed) return

    try {
      setActionLoading(bookingId)
      const token = auth.getToken()
      if (!token) return

      await bookingsApi.approve(bookingId, token)
      showToast('Booking approved successfully', 'success')
      await loadBookings()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to approve booking', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (bookingId: string) => {
    const confirmed = await confirm({
      title: 'Reject Booking',
      message: 'Are you sure you want to reject this booking?',
      confirmText: 'Reject',
      cancelText: 'Cancel',
      variant: 'danger',
    })
    if (!confirmed) return

    try {
      setActionLoading(bookingId)
      const token = auth.getToken()
      if (!token) return

      await bookingsApi.reject(bookingId, token)
      showToast('Booking rejected', 'success')
      await loadBookings()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to reject booking', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleLogout = () => {
    auth.removeToken()
    router.push('/admin/login')
  }

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length
  const approvedCount = bookings.filter((b) => b.status === 'APPROVED').length
  const rejectedCount = bookings.filter((b) => b.status === 'REJECTED').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading bookings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage all bookings</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="text-sm font-medium text-gray-600">Pending</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{pendingCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="text-sm font-medium text-gray-600">Approved</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{approvedCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="text-sm font-medium text-gray-600">Rejected</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{rejectedCount}</div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            All Bookings ({bookings.length})
          </h2>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No bookings found
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onApprove={handleApprove}
                onReject={handleReject}
                loading={actionLoading === booking.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
