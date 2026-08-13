import { useEffect, useRef } from 'react'

export function Modal({ open, onClose, locked = false, className = '', children, label }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`modal ${className}`.trim()}
      aria-label={label}
      onCancel={event => {
        if (locked) event.preventDefault()
        else onClose?.()
      }}
      onClose={() => !locked && onClose?.()}
    >
      {children}
    </dialog>
  )
}
