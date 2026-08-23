export function CompactMultiChoice({ number, label, value, options, onToggle }) {
  const selected = options.filter(option => value.includes(option.id))
  const summary = selected.length ? selected.map(option => option.label).join(' + ') : 'Escolha uma opção'

  return (
    <fieldset className="choice-field compact-multi-choice">
      <legend>{number} · {label}</legend>
      <details className="multi-choice-dropdown">
        <summary>
          <span>{summary}</span>
          <small>{value.length}/2</small>
        </summary>
        <div className="multi-choice-menu">
          {options.map(option => {
            const checked = value.includes(option.id)
            const disabled = !checked && value.length >= 2
            return (
              <label key={option.id} className={checked ? 'is-selected' : ''}>
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
