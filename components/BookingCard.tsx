import { Booking } from '@/lib/api/bookings'
import { StatusBadge } from './StatusBadge'

interface BookingCardProps {
  booking: Booking
  onApprove: (id: string) => void
  onReject: (id: string) => void
  loading?: boolean
}

export function BookingCard({ booking, onApprove, onReject, loading }: BookingCardProps) {
  const date = new Date(booking.date)
  const canTakeAction = booking.status === 'PENDING'

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Booking #{booking.id.slice(0, 8)}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{booking.user.email}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium w-32">Date:</span>
          <span>{date.toLocaleDateString('sv-SE')}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium w-32">Time:</span>
          <span>{booking.time}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium w-32">People:</span>
          <span>{booking.numberOfPeople}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium w-32">Created:</span>
          <span>{new Date(booking.createdAt).toLocaleString('sv-SE')}</span>
        </div>
      </div>

      {canTakeAction && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => onApprove(booking.id)}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(booking.id)}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  )
}
