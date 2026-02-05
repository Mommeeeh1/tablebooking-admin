'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const TOAST_DURATION = 4000

const TYPE_STYLES: Record<ToastType, { container: string; icon: string; iconChar: string }> = {
  success: {
    container: 'bg-green-50 border-green-500 text-green-800',
    icon: 'bg-green-500',
    iconChar: '\u2713',
  },
  error: {
    container: 'bg-red-50 border-red-500 text-red-800',
    icon: 'bg-red-500',
    iconChar: '!',
  },
  warning: {
    container: 'bg-amber-50 border-amber-500 text-amber-800',
    icon: 'bg-amber-500',
    iconChar: '\u26A0',
  },
  info: {
    container: 'bg-blue-50 border-blue-500 text-blue-800',
    icon: 'bg-blue-500',
    iconChar: 'i',
  },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 300)
    }, TOAST_DURATION)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const styles = TYPE_STYLES[toast.type]

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg max-w-md w-full transition-all duration-300 ${styles.container} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
      }`}
    >
      <span
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${styles.icon}`}
      >
        {styles.iconChar}
      </span>
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(() => onDismiss(toast.id), 300)
        }}
        className="flex-shrink-0 text-current opacity-60 hover:opacity-100 text-lg leading-none font-bold"
      >
        &times;
      </button>
    </div>
  )
}

function ConfirmModal({
  options,
  onResult,
}: {
  options: ConfirmOptions
  onResult: (result: boolean) => void
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const dismiss = (result: boolean) => {
    setVisible(false)
    setTimeout(() => onResult(result), 200)
  }

  const isDanger = options.variant === 'danger'

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center transition-all duration-200 ${
        visible ? 'bg-black/40' : 'bg-black/0'
      }`}
      onClick={() => dismiss(false)}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 transition-all duration-200 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-2">{options.title}</h3>
        <p className="text-gray-600 text-sm mb-6">{options.message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => dismiss(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {options.cancelText || 'Cancel'}
          </button>
          <button
            onClick={() => dismiss(true)}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {options.confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions
    resolve: (value: boolean) => void
  } | null>(null)
  const nextId = useRef(0)

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId.current++
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const confirmFn = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ options, resolve })
    })
  }, [])

  const handleConfirmResult = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result)
      setConfirmState(null)
    }
  }

  return (
    <ToastContext.Provider value={{ showToast, confirm: confirmFn }}>
      {children}
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </div>
      </div>
      {/* Confirm modal */}
      {confirmState && (
        <ConfirmModal options={confirmState.options} onResult={handleConfirmResult} />
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
