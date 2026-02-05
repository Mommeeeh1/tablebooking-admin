interface StatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {status}
    </span>
  )
}
