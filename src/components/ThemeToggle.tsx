import type { ColorTheme } from '../lib/theme'

type Props = {
  theme: ColorTheme
  onChange: (theme: ColorTheme) => void
}

export function ThemeToggle({ theme, onChange }: Props) {
  const next = theme === 'light' ? 'dark' : 'light'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => onChange(next)}
      aria-label={
        theme === 'light'
          ? 'Включить тёмную тему'
          : 'Включить светлую тему'
      }
      title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
      <span className="theme-toggle-label">
        {theme === 'light' ? 'Тёмная' : 'Светлая'}
      </span>
    </button>
  )
}
