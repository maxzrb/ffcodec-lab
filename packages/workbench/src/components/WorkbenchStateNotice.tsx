import type { ResolvedWorkspacePanel } from '@ffcodec/domain/presentation/resolved-field'
import { useI18n } from '../features/i18n/i18n'

interface WorkbenchStateNoticeProps {
  notice: NonNullable<ResolvedWorkspacePanel['stateNotice']>
  onPanelChange: (panelId: string) => void
}

/** 解释当前模式为何隐藏或停用了后续参数。 */
export function WorkbenchStateNotice({ notice, onPanelChange }: WorkbenchStateNoticeProps) {
  const { text } = useI18n()
  return (
    <section className="workbench-state-notice" role="status">
      <span className="workbench-state-notice__icon" aria-hidden="true">i</span>
      <div>
        <h2>{text(notice.title)}</h2>
        <p>{text(notice.description)}</p>
      </div>
      {notice.actionPanelId && notice.actionLabel && (
        <button type="button" className="button-ghost" onClick={() => onPanelChange(notice.actionPanelId!)}>
          {text(notice.actionLabel)}
        </button>
      )}
    </section>
  )
}
