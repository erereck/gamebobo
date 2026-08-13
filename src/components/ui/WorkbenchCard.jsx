export function WorkbenchCard({ kicker, meta, className = '', children, as: Tag = 'section' }) {
  return (
    <Tag className={`workbench-card ${className}`.trim()}>
      {(kicker || meta) && (
        <div className="card-kicker">
          <span>{kicker}</span>
          <span>{meta}</span>
        </div>
      )}
      {children}
    </Tag>
  )
}
