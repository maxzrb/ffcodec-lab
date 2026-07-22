// ============================================================
// ConfigFilePanel — "配置文件" custom workbench panel.
// Renders collapsible sub-sections using parameter-section CSS.
// ============================================================

import { useState } from 'react'
import { useI18n } from '@ffcodec/workbench'
import { StorageModeSetting } from './StorageModeSetting'

export function ConfigFilePanel() {
  const { locale } = useI18n()
  const isZh = locale === 'zh-CN'
  const [expanded, setExpanded] = useState(true)

  return (
    <section className="parameter-section">
      <div className="parameter-section__header">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="parameter-section__toggle"
          aria-expanded={expanded}
        >
          <span
            className={`parameter-section__chevron ${expanded ? 'parameter-section__chevron--open' : ''}`}
            aria-hidden="true"
          >
            ▶
          </span>
          <span className="parameter-section__title">
            {isZh ? '偏好存储位置' : 'Preference storage'}
          </span>
        </button>
      </div>

      <div
        className={`parameter-section__body ${expanded ? 'parameter-section__body--expanded' : 'parameter-section__body--collapsed'}`}
      >
        <div className="parameter-section__body-inner">
          <StorageModeSetting />
        </div>
      </div>
    </section>
  )
}
