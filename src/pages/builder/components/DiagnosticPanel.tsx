import type { Diagnostic, DiagnosticFix } from '../../../domain/rules/rule-types'
import { buildFixSuggestions } from '../../../domain/diagnostics/build-fix-suggestions'
import { presentDiagnostic } from '../../../domain/presentation/present-diagnostic'
import type { Catalog } from '../../../domain/catalog/catalog-types'
import { useI18n } from '../../../features/i18n/i18n'

interface DiagnosticPanelProps {
  diagnostics: Diagnostic[]
  catalog: Catalog
  getOriginLabel: (originId: string) => string
  onLocate: (originId: string) => void
  onApplyFix: (fix: DiagnosticFix) => void
}

export function DiagnosticPanel({
  diagnostics,
  catalog,
  getOriginLabel,
  onLocate,
  onApplyFix,
}: DiagnosticPanelProps) {
  const { locale } = useI18n()
  if (diagnostics.length === 0) return null

  return (
    <section className="diagnostic-panel" aria-label={locale === 'zh-CN' ? '诊断与建议' : 'Diagnostics and suggestions'}>
      <div className="diagnostic-panel__header">
        <strong>{locale === 'zh-CN' ? '诊断与建议' : 'Diagnostics & suggestions'}</strong>
        <span>{diagnostics.length}</span>
      </div>
      <div className="diagnostic-panel__list">
        {diagnostics.map((diagnostic, index) => {
          const copy = presentDiagnostic(diagnostic, locale)
          const fixes = buildFixSuggestions(diagnostic, catalog)
          return (
            <article key={`${diagnostic.code}-${index}`} className={`diagnostic-card diagnostic-card--${diagnostic.severity}`}>
              <div className="diagnostic-card__heading">
                <span className="diagnostic-card__level">{copy.level}</span>
                <strong>{copy.title}</strong>
              </div>
              <p>{copy.explanation}</p>
              <p className="diagnostic-card__guidance">
                <strong>{locale === 'zh-CN' ? '建议：' : 'Recommended: '}</strong>{copy.guidance}
              </p>
              {diagnostic.originIds.length > 0 && (
                <div className="diagnostic-card__origins">
                  <span>{locale === 'zh-CN' ? '相关参数' : 'Affected fields'}</span>
                  {diagnostic.originIds.map((originId) => (
                    <button key={originId} type="button" className="button-ghost" onClick={() => onLocate(originId)}>
                      {getOriginLabel(originId)}
                    </button>
                  ))}
                </div>
              )}
              {fixes.length > 0 && (
                <div className="diagnostic-card__fixes">
                  {fixes.map((fix) => (
                    <button key={fix.id} type="button" className="button-ghost" onClick={() => onApplyFix(fix)}>
                      {locale === 'zh-CN' ? fix.label : englishFixLabel(fix)}
                    </button>
                  ))}
                </div>
              )}
              <code className="diagnostic-card__code">{diagnostic.code}</code>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function englishFixLabel(fix: DiagnosticFix): string {
  if (fix.id.startsWith('fix.container.')) return `Use ${fix.id.replace('fix.container.', '').toUpperCase()} container`
  if (fix.id === 'fix.encoder.to.av1') return 'Use SVT-AV1 encoder'
  if (fix.id === 'fix.burn.disable') return 'Disable subtitle burn-in'
  if (fix.id === 'fix.burn.switch.encode' || fix.id === 'fix.resolution.encode') return 'Switch video to Encode'
  if (fix.id === 'fix.resolution.source') return 'Reset picture settings'
  return fix.label
}
