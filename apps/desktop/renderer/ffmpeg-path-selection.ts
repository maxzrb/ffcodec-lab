// FFmpeg 运行路径与左栏自定义文件夹分开保存，避免菜单选择污染设置输入框。

const CUSTOM_PATH_STORAGE_KEY = 'ffcodec-desktop-ffmpeg-path'
const SELECTED_PATH_STORAGE_KEY = 'ffcodec-desktop-selected-ffmpeg-path'
const SELECTION_CHANGE_EVENT = 'ffcodec:ffmpeg-selection-change'

function readPath(key: string): string | undefined {
  return (localStorage.getItem(key) ?? window.electronAPI?.storageGetItem(key))?.trim() || undefined
}

export function getPreferredFFmpegPath(): string | undefined {
  return readPath(SELECTED_PATH_STORAGE_KEY) ?? readPath(CUSTOM_PATH_STORAGE_KEY)
}

export function notifyPreferredFFmpegPathChange(): void {
  window.dispatchEvent(new Event(SELECTION_CHANGE_EVENT))
}

export function onPreferredFFmpegPathChange(listener: () => void): () => void {
  window.addEventListener(SELECTION_CHANGE_EVENT, listener)
  return () => window.removeEventListener(SELECTION_CHANGE_EVENT, listener)
}
