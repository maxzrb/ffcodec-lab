// ============================================================
// @ffcodec/workbench — shared React workbench for Web & Desktop.
// ============================================================

export { WorkbenchApp } from './WorkbenchApp'
export { useBuilderStore, usePipeline, useRuntimeFilterDiagnostics } from './hooks'
export type { PipelineOutput } from './hooks'
export { I18nProvider, useI18n, translateText, localizeExplanation } from './features/i18n/i18n'
export type { Locale } from './features/i18n/i18n'
export { Dropdown } from './components/Dropdown'
export type { DropdownOption } from './components/Dropdown'
export { AppDialogProvider, useAppDialog } from './features/dialog/AppDialogProvider'
export type { AppDialogOptions } from './features/dialog/AppDialogProvider'
