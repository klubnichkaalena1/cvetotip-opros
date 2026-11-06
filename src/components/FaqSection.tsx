import { useId, useState } from 'react'
import { faqItems } from '../data/faq'

export function FaqSection() {
  const baseId = useId()
  const [openId, setOpenId] = useState<string | null>(null)

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <section className="faq" aria-labelledby={`${baseId}-title`}>
      <h2 id={`${baseId}-title`} className="faq-title">
        Частые вопросы
      </h2>
      <ul className="faq-list">
        {faqItems.map((item) => {
          const isOpen = openId === item.id
          const panelId = `${baseId}-panel-${item.id}`
          const buttonId = `${baseId}-btn-${item.id}`

          return (
            <li key={item.id} className={`faq-item${isOpen ? ' faq-item--open' : ''}`}>
              <h3 className="faq-item-heading">
                <button
                  type="button"
                  id={buttonId}
                  className="faq-trigger"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(item.id)}
                >
                  <span className="faq-question">{item.question}</span>
                  <span className="faq-chevron" aria-hidden="true" />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="faq-panel"
                hidden={!isOpen}
              >
                <p className="faq-answer">{item.answer}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
