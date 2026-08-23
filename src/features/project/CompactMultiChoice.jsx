import './CompactMultiChoice.css'

export function CompactMultiChoice({ number, label, value, options, onToggle, max = 2, isOptionDisabled, fullField = false, note, open = false, onOpenChange }) {
  const selected = options.filter(option => value.includes(option.id))
  const summary = selected.length ? selected.map(option => option.label).join(' + ') : 'Escolha uma opção'

  return (
    <fieldset className={`choice-field compact-multi-choice${fullField ? ' full-field' : ''}`}>
      <legend>{number} · {label}</legend>
      {note && <p>{note}</p>}
      <details className="multi-choice-dropdown" open={open} onToggle={event => onOpenChange?.(event.currentTarget.open)}>
        <summary>
          <span>{summary}</span>
          <small>{value.length}/{max}</small>
        </summary>
        <div className="multi-choice-menu">
          {options.map(option => {
            const checked = value.includes(option.id)
            const blocked = Boolean(isOptionDisabled?.(option))
            const disabled = blocked || (!checked && value.length >= max)
            return (
              <label key={option.id} className={`${checked ? 'is-selected' : ''}${disabled && !checked ? ' is-disabled' : ''}`}>
                <input type="checkbox" checked={checked} disabled={disabled} onChange={() => onToggle(option.id)} />
                <span>{option.label}</span>
                {checked && <b>✓</b>}
              </label>
            )
          })}
        </div>
      </details>
    </fieldset>
  )
}

export function CompactSingleChoice({ number, label, value, options, onChange, fullField = false, note, descriptions = false, open = false, onOpenChange }) {
  const selected = options.find(option => option.id === value) ?? options[0]

  return (
    <fieldset className={`choice-field compact-multi-choice compact-single-choice${fullField ? ' full-field' : ''}`}>
      <legend>{number} · {label}</legend>
      {note && <p>{note}</p>}
      <details className="multi-choice-dropdown" open={open} onToggle={event => onOpenChange?.(event.currentTarget.open)}>
        <summary><span>{selected?.label ?? 'Escolha uma opção'}</span></summary>
        <div className="multi-choice-menu">
          {options.map(option => {
            const checked = option.id === value
            return (
              <label key={option.id} className={checked ? 'is-selected' : ''}>
                <input type="radio" name={`compact-${number}`} value={option.id} checked={checked} onChange={() => { onChange(option.id); onOpenChange?.(false) }} />
                <span>{option.label}{descriptions && option.description ? <small>{option.description}</small> : null}</span>
                {checked && <b>✓</b>}
              </label>
            )
          })}
        </div>
      </details>
    </fieldset>
  )
}
