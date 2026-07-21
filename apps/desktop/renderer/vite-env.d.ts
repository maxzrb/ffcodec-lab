/// <reference types="vite/client" />

declare global {
  interface Window {
    electronAPI?: {
      platform: 'win32' | 'darwin' | 'linux'
      versions: {
        node: string
        chrome: string
        electron: string
      }
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
    }
  }
}

export {}
