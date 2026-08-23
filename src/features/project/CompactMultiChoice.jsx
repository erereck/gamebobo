import './CompactMultiChoice.css'

export function CompactMultiChoice({ number, label, value, options, onToggle, max = 2, isOptionDisabled, fullField = false, note }) {
  const selected = options.filter(option => value.includes(option.id))
  const summary = selected.length ? selected.map(option => option.label).join(' + ') : 'Escolha uma opção'

  return (
    <fieldset className={`choice-field compact-multi-choice${fullField ? ' full-field' : ''}`}>
      <legend>{number} · {label}</legend>
      {note && <p>{note}</p>}
      <details className="multi-choice-dropdown">
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
