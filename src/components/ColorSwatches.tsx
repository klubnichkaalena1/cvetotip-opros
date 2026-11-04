type Props = {
  colors: string[]
  size?: 'sm' | 'lg'
  label?: string
}

export function ColorSwatches({ colors, size = 'sm', label }: Props) {
  return (
    <div className={`swatches swatches--${size}`}>
      {label && <span className="swatches-label">{label}</span>}
      <div className="swatches-row" role="list" aria-label={label ?? 'Палитра цветов'}>
        {colors.map((color) => (
          <span
            key={color}
            role="listitem"
            className="swatch"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  )
}
