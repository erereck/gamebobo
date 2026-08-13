export function Button({ variant = 'secondary', size = 'default', className = '', children, ...props }) {
  return (
    <button className={`button button--${variant} button--${size} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
