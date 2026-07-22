# FFCodec Lab Monorepo + Electron 桌面应用实施计划

## 一、项目背景

FFCodec Lab 当前是基于 React、Vite 和 TypeScript 开发的纯前端应用，部署于 Cloudflare Pages。

本次改造采用 Monorepo 架构，在同一个 Git 仓库中同时维护：

1. FFCodec Lab 网页版；
2. FFCodec Lab Electron 桌面版；
3. 两端共用的 Domain Layer；
4. 编码器及参数目录；
5. 命令生成与诊断逻辑；
6. 通用 React 工作台组件；
7. 国际化、类型定义和测试工具。

Electron 桌面版需要实现：

1. 自动检测 FFmpeg 和 ffprobe；
2. 原生文件、目录和输出路径选择；
3. 安全执行结构化 FFmpeg 参数；
4. 显示实时编码进度；
5. 支持任务取消；
6. 保存编码日志和历史；
7. 生成 Windows 安装包；
8. 后续扩展 macOS 和 Linux。

整个改造必须保证网页应用仍可独立开发、构建和部署。Electron 构建失败不能阻断网页开发，桌面专属依赖不能进入网页产物。

---

## 二、架构目标

### 2.1 单一代码源

网页和桌面版不得分别维护以下代码：

- Domain Layer
- 编码器目录
- 参数定义
- 命令生成逻辑
- 诊断逻辑
- 共享工作台组件
- 通用国际化文案

这些代码统一放入 `packages/`，由 Web 和 Desktop 共同引用。

修改共享包后，网页和桌面端同时获得更新，不再执行仓库间的 merge、cherry-pick 或手动复制。

### 2.2 平台功能隔离

以下功能不得放入共享核心包：

- Electron Main Process
- Electron preload
- IPC
- child_process
- FFmpeg 本地执行
- electron-store
- 原生文件对话框
- 本地日志
- Windows 安装包
- Cloudflare Pages 配置

Web 和 Desktop 都是独立应用，只共享平台无关的代码。

### 2.3 桌面端不加载线上网页

Electron 开发环境可以加载本地 Vite 开发服务器。

Electron 生产环境只能加载安装包中的本地 Renderer 构建产物，不直接加载 Cloudflare Pages 页面。

---

## 三、技术选型

| 项目 | 方案 |
|------|------|
| Monorepo 管理 | pnpm workspace |
| 任务调度 | 初期直接使用 pnpm scripts |
| 网页构建 | Vite |
| 桌面框架 | Electron |
| 桌面构建 | electron-vite |
| 安装包 | electron-builder |
| 前端 | React + TypeScript |
| IPC | preload + contextBridge + ipcMain |
| FFmpeg 执行 | child_process.spawn |
| 进度读取 | `-progress pipe:1` |
| 媒体探测 | ffprobe |
| 本地设置 | electron-store |
| 单元测试 | Vitest |
| 首发平台 | Windows 11 |
| 首发安装格式 | NSIS |

Electron、electron-vite、electron-builder 和 electron-store 均使用实施时受支持的稳定版本，并通过 `pnpm-lock.yaml` 固定。

---

## 四、目标目录结构

```
FFCodec-Lab/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── WebApp.tsx
│   │   │   └── web-platform.ts
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── desktop/
│       ├── electron/
│       │   ├── main/
│       │   │   ├── index.ts
│       │   │   ├── create-window.ts
│       │   │   ├── security.ts
│       │   │   ├── ipc/
│       │   │   │   ├── register-handlers.ts
│       │   │   │   ├── dialog-handlers.ts
│       │   │   │   ├── ffmpeg-handlers.ts
│       │   │   │   ├── history-handlers.ts
│       │   │   │   └── system-handlers.ts
│       │   │   ├── ffmpeg/
│       │   │   │   ├── detector.ts
│       │   │   │   ├── probe.ts
│       │   │   │   ├── executor.ts
│       │   │   │   ├── progress-parser.ts
│       │   │   │   ├── job-manager.ts
│       │   │   │   ├── error-parser.ts
│       │   │   │   └── types.ts
│       │   │   ├── store/
│       │   │   │   ├── desktop-store.ts
│       │   │   │   ├── history-store.ts
│       │   │   │   └── log-manager.ts
│       │   │   └── utils/
│       │   │       ├── path-validation.ts
│       │   │       └── window-bounds.ts
│       │   │
│       │   └── preload/
│       │       ├── index.ts
│       │       └── desktop-api.ts
│       │
│       ├── renderer/
│       │   ├── main.tsx
│       │   ├── DesktopApp.tsx
│       │   ├── desktop-platform.ts
│       │   └── vite-env.d.ts
│       │
│       ├── resources/
│       │   ├── icon.ico
│       │   ├── icon.png
│       │   └── icon.icns
│       │
│       ├── electron.vite.config.ts
│       ├── electron-builder.yml
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── domain/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── catalog/
│   │   ├── src/
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── command-plan/
│   │   ├── src/
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── diagnostics/
│   │   ├── src/
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── workbench/
│   │   ├── src/
│   │   │   ├── WorkbenchApp.tsx
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── styles/
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── platform-api/
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── context.tsx
│   │   │   └── capabilities.ts
│   │   └── package.json
│   │
│   ├── desktop-ui/
│   │   ├── src/
│   │   │   ├── DesktopEncodingExtension.tsx
│   │   │   ├── FFmpegSettings.tsx
│   │   │   ├── FilePickerButton.tsx
│   │   │   ├── EncodingPanel.tsx
│   │   │   ├── EncodingHistory.tsx
│   │   │   └── hooks/
│   │   └── package.json
│   │
│   ├── i18n/
│   │   ├── src/
│   │   └── package.json
│   │
│   └── test-utils/
│       ├── src/
│       └── package.json
│
├── scripts/
│   ├── catalog-audit.ts
│   ├── ffmpeg-smoke-test.ts
│   └── verify-workspace.ts
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DESKTOP_PLAN.md
│   ├── MIGRATION.md
│   └── RELEASE.md
│
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── eslint.config.js
├── vitest.workspace.ts
├── pnpm-lock.yaml
└── README.md
```

---

## 五、各模块职责

### 5.1 `apps/web`

只负责网页环境的入口和部署。包括：网页 main.tsx、网页 Vite 配置、Cloudflare Pages 配置、网页端 platform adapter。不得依赖 Electron、Node.js 或桌面专属包。

### 5.2 `apps/desktop`

负责 Electron 宿主。包括：Main Process、Preload、Desktop Renderer 入口、IPC、FFmpeg 本地执行、文件对话框、本地存储、日志、安装包。Desktop Renderer 不复制工作台主体，而是引用 `@ffcodec/workbench` 和 `@ffcodec/desktop-ui`。

### 5.3 `packages/domain`

保存纯 TypeScript 领域逻辑。要求：不能导入 React、Electron、Node.js API，不能访问 window/document，不能依赖具体平台。

### 5.4 `packages/catalog`

保存编码器定义、参数定义、字段元数据、默认值、可见性条件、参数依赖关系、路径字段类型。路径参数增加明确元数据：

```ts
export type PathFieldKind = 'open-file' | 'open-files' | 'save-file' | 'directory'
```

### 5.5 `packages/command-plan`

保存 Command Plan 构建、参数 token、命令语义、Shell Renderer、结构化执行计划。需要同时支持两种输出：可复制命令文本和安全执行参数数组。

```ts
export interface ExecutionPlan {
  args: string[]
  inputPaths: string[]
  outputPaths: string[]
  expectedDurationMs?: number
}
```

禁止从 `RenderedCommand.text` 反向解析 `ExecutionPlan`。

### 5.6 `packages/workbench`

保存网页和桌面端共同使用的 React 工作台。该包不得直接调用 `window.desktopAPI`。它只能依赖抽象的 `PlatformAdapter` 接口。

### 5.7 `packages/platform-api`

定义 Web 和 Desktop 共同遵守的平台能力协议：

```ts
export interface PlatformCapabilities {
  desktop: boolean
  nativeFileDialog: boolean
  localFFmpegExecution: boolean
  revealInFolder: boolean
  persistentEncodingHistory: boolean
}
```

网页端提供空实现或受限实现，桌面端提供 Electron 实现。

### 5.8 `packages/desktop-ui`

只保存 Desktop Renderer 使用的 React 组件：FFmpeg 状态/设置、原生文件选择按钮、编码面板、任务历史、日志查看。它可以依赖 `@ffcodec/workbench` 和 `@ffcodec/platform-api`，但不能直接访问 Node.js API。

---

## 六、Workspace 配置

根目录建立 `pnpm-workspace.yaml`：

```yaml
packages:
  - apps/*
  - packages/*
```

根目录 `package.json` 脚本：

```json
{
  "scripts": {
    "dev:web": "pnpm --filter @ffcodec/web dev",
    "dev:desktop": "pnpm --filter @ffcodec/desktop dev",
    "build:web": "pnpm --filter @ffcodec/web build",
    "build:desktop": "pnpm --filter @ffcodec/desktop build",
    "build:desktop:win": "pnpm --filter @ffcodec/desktop build:win",
    "typecheck": "pnpm -r --if-present typecheck",
    "test": "pnpm -r --if-present test",
    "lint": "pnpm -r --if-present lint",
    "audit:catalog": "pnpm --filter @ffcodec/catalog audit",
    "check": "pnpm typecheck && pnpm test && pnpm lint && pnpm audit:catalog",
    "clean": "pnpm -r --if-present clean"
  }
}
```

Electron 相关依赖只安装到 `apps/desktop/package.json`。Cloudflare 相关依赖只安装到 `apps/web/package.json`。

---

## 七、依赖方向约束

允许：`apps/web` → workbench/platform-api/domain/catalog/command-plan/diagnostics/i18n
允许：`apps/desktop` → workbench/desktop-ui/platform-api/domain/catalog/command-plan/diagnostics/i18n

禁止：
- `packages/domain` → React / Electron
- `packages/catalog` → apps/web
- `packages/workbench` → apps/desktop / Electron
- `packages/platform-api` → Electron
- `apps/web` → desktop-ui

共享包不得反向依赖具体应用。

---

## 八、Web 和 Desktop 的组合方式

### Web 入口

```tsx
import { WorkbenchApp } from '@ffcodec/workbench'
import { PlatformProvider } from '@ffcodec/platform-api'
import { webPlatform } from './web-platform'

export function WebApp() {
  return (
    <PlatformProvider value={webPlatform}>
      <WorkbenchApp />
    </PlatformProvider>
  )
}
```

### Desktop Renderer 入口

```tsx
import { WorkbenchApp } from '@ffcodec/workbench'
import { DesktopEncodingExtension } from '@ffcodec/desktop-ui'
import { PlatformProvider } from '@ffcodec/platform-api'
import { desktopPlatform } from './desktop-platform'

export function DesktopApp() {
  return (
    <PlatformProvider value={desktopPlatform}>
      <WorkbenchApp
        extensions={[<DesktopEncodingExtension key="desktop-encoding" />]}
      />
    </PlatformProvider>
  )
}
```

---

## 九、扩展点设计

```ts
export interface WorkbenchExtensions {
  headerItems?: ReactNode[]
  inspectorTabs?: InspectorTabExtension[]
  commandActions?: CommandActionExtension[]
  pathFieldRenderer?: PathFieldRenderer
  settingsSections?: SettingsSectionExtension[]
}
```

桌面版通过扩展点注入 Header（FFmpeg 状态）、Command Actions（执行编码）、Inspector（编码面板）、Path Field（原生文件选择）、Settings（FFmpeg 设置）。网页端不提供这些扩展。

不要在共享组件中到处写 `if (window.desktopAPI)` — 平台判断集中在 Desktop Host 和 Platform Adapter。

---

## 十、FFmpeg 执行安全设计

### 10.1 禁止执行完整 Shell 文本

以下设计**禁止**使用：

```ts
spawn('powershell', ['-Command', commandText])
spawn('cmd', ['/c', commandText])
spawn('bash', ['-c', commandText])
```

桌面执行接口使用结构化参数：

```ts
export interface FFmpegExecutionRequest {
  args: string[]
  inputPaths: string[]
  outputPaths: string[]
  expectedDurationMs?: number
  overwriteMode: 'replace' | 'fail'
}
```

Main Process 从自身配置读取 FFmpeg 绝对路径：

```ts
const child = spawn(ffmpegPath, request.args, {
  shell: false,
  windowsHide: true,
  stdio: ['pipe', 'pipe', 'pipe'],
})
```

Renderer 不传递 `ffmpegPath`，也不传递 `shell`。

### 10.2 执行前校验

主进程必须校验：FFmpeg 路径有效、参数结构有效、至少存在一个输入、输入文件存在、输出路径有效、输入和输出不是同一文件、输出目录存在或可创建、覆盖策略明确、参数数量和总长度没有异常。

---

## 十一、FFmpeg 和 ffprobe 检测

```ts
export interface FFmpegInstallation {
  found: boolean
  ffmpegPath: string | null
  ffprobePath: string | null
  version: string | null
  configuration: string | null
  source: 'saved' | 'path' | 'winget' | 'scoop' | 'chocolatey' | 'common-path' | 'manual' | null
}
```

Windows 检测顺序：用户已保存路径 → `where ffmpeg` → `where ffprobe` → Scoop → Chocolatey → WinGet → 常见目录 → 用户手动选择。

常见目录：`C:\ffmpeg\bin`、`C:\Program Files\ffmpeg\bin`、`C:\ProgramData\chocolatey\bin`、`%USERPROFILE%\scoop\apps\ffmpeg\current\bin`、`%LOCALAPPDATA%\Microsoft\WinGet\Packages`。

检测命令必须设置超时：`ffmpeg -version`、`ffprobe -version`。

---

## 十二、媒体探测

ffprobe 用于读取媒体总时长、容器格式、视频/音频/字幕流信息、分辨率、帧率、编码格式、像素格式、声道布局。执行 `ffprobe -v error -show_format -show_streams -of json <输入文件>`。

涉及多输入、`-ss`、`-t`、变速滤镜、循环、拼接和多输出时，不能简单将输入总时长视为输出总时长。无法确定预计时长时，`percent = null`，界面显示不定进度条。

---

## 十三、FFmpeg 进度解析

执行时由 Main Process 自动加入 `-progress pipe:1 -nostats -stats_period 0.5`。stdout 用于解析 `frame`、`fps`、`bitrate`、`total_size`、`out_time_us`、`out_time`、`speed`、`progress`。stderr 只用于保存完整日志、生成错误摘要、辅助诊断。

任务是否成功主要依据：spawn 是否成功、退出码、终止信号、是否由用户取消。禁止通过 stderr 是否包含 `Error`、`Invalid` 等字符串直接判断任务失败。

---

## 十四、任务模型

```ts
export type FFmpegJobPhase = 'created' | 'starting' | 'running' | 'cancelling' | 'completed' | 'failed' | 'cancelled'

export interface FFmpegJobSnapshot {
  jobId: string
  phase: FFmpegJobPhase
  createdAt: number
  startedAt: number | null
  endedAt: number | null
  inputPaths: string[]
  outputPaths: string[]
  frame: number | null
  fps: number | null
  bitrate: string | null
  speed: number | null
  outTimeMs: number | null
  expectedDurationMs: number | null
  percent: number | null
  estimatedRemainingMs: number | null
  totalSize: number | null
  exitCode: number | null
  signal: string | null
  errorSummary: string | null
  logPath: string
}
```

首版只允许一个活跃编码任务。后续再增加等待队列、并发限制、暂停和恢复等。

---

## 十五、取消和进程清理

取消策略：
1. 优先向 FFmpeg stdin 写入 `q`
2. 等待进程正常退出
3. 超时后终止 FFmpeg
4. Windows 下必要时终止进程树
5. 判断是否删除未完成输出文件
6. 记录取消原因和结束时间

应用关闭时检查活跃任务、提示用户、确认退出后终止任务、确认无残留 FFmpeg 进程、保存最终任务状态。

---

## 十六、Preload API

```ts
export interface DesktopAPI {
  platform: 'win32' | 'darwin' | 'linux'
  openFileDialog(options: OpenFileDialogOptions): Promise<string[]>
  saveFileDialog(options: SaveFileDialogOptions): Promise<string | null>
  openDirectoryDialog(): Promise<string | null>
  getPathForFile(file: File): string
  detectFFmpeg(): Promise<FFmpegInstallation>
  validateFFmpegPath(path: string): Promise<FFmpegInstallation>
  setFFmpegPath(path: string): Promise<FFmpegInstallation>
  getFFmpegInstallation(): Promise<FFmpegInstallation>
  probeMedia(path: string): Promise<MediaProbeResult>
  startFFmpegJob(request: FFmpegExecutionRequest): Promise<FFmpegJobSnapshot>
  cancelFFmpegJob(jobId: string): Promise<FFmpegJobSnapshot>
  getFFmpegJob(jobId: string): Promise<FFmpegJobSnapshot | null>
  getActiveFFmpegJobs(): Promise<FFmpegJobSnapshot[]>
  onFFmpegJobUpdated(callback: (job: FFmpegJobSnapshot) => void): () => void
  listEncodingHistory(): Promise<EncodingHistoryItem[]>
  deleteEncodingHistoryItem(historyId: string): Promise<void>
  clearEncodingHistory(): Promise<void>
  readJobLog(jobId: string): Promise<string>
  revealOutput(jobId: string): Promise<void>
  revealLog(jobId: string): Promise<void>
}
```

禁止暴露通用的 `executeCommand`、`invoke`、`send`、`readAnyFile`、`openAnyPath`。

---

## 十七、原生文件选择与拖放

文件对话框根据参数元数据区分 open-file / open-files / save-file / directory。Renderer 中监听 dragover/drop，preload 使用 `webUtils.getPathForFile(file)` 获取本地路径。不使用 `will-navigate` 处理文件拖放。

路径包含空格、中文、括号、`&`、单引号、方括号时必须正常工作。由于执行层使用 `spawn(ffmpegPath, args, { shell: false })`，这些路径不需要再进行 Shell 转义。

---

## 十八、Electron 安全配置

```ts
const window = new BrowserWindow({
  width: 1280, height: 800,
  minWidth: 900, minHeight: 600,
  webPreferences: {
    preload: preloadPath,
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    webSecurity: true,
  },
})
```

同时：禁止任意导航、禁止任意新窗口、限制外部链接、校验 IPC 来源和参数、生产环境隐藏开发者工具入口、Renderer 不访问 Node.js、不加载远程页面作为应用主体。

---

## 十九、历史和日志

日志目录：`path.join(app.getPath('userData'), 'logs')`。每个任务保存 `ffcodec-<jobId>.log`。最多 100 个日志或最多保留 30 天。

历史记录只保存摘要（jobId、时间、状态、输入输出路径、编码器、耗时、退出码、日志路径）。实时进度不能持续写入 electron-store，只在任务状态发生重要变化或结束时保存。

---

## 二十、Git 和版本管理

整个项目只有一个 Git 仓库。网页和桌面版允许独立发布，共享包初期不发布到 npm。修改共享包时必须同时验证 Web 和 Desktop。Git 标签分别使用 `web-vX.Y.Z` 和 `desktop-vX.Y.Z`。

---

## 二十一、Cloudflare Pages 配置

Monorepo 迁移后，Cloudflare Pages 构建命令：`pnpm --filter @ffcodec/web build`，输出目录：`apps/web/dist`。网页构建不得触发 Electron 下载和桌面打包。

---

## 二十二、CI 设计

Web CI 触发：`apps/web/**`、`packages/**`、`pnpm-lock.yaml`。Desktop CI 触发：`apps/desktop/**`、`packages/**`、`pnpm-lock.yaml`。只要修改 `packages/`，Web CI 和 Desktop CI 都必须运行。

---

## 二十三、迁移实施阶段

### Phase 0：创建迁移基线

1. 确认当前 `main` 分支全部测试通过
2. 记录当前提交哈希，创建迁移标签 `pre-monorepo-web`
3. 创建独立迁移分支 `refactor/monorepo`
4. 保存 Cloudflare Pages 当前配置和现有构建/测试/审计结果
5. **验收**：出现严重问题时可以直接回退到 `pre-monorepo-web`

### Phase 1：建立 pnpm Workspace

1. 初始化 pnpm，创建 `pnpm-workspace.yaml`
2. 创建 `apps/` 和 `packages/`
3. 将当前网页项目通过 `git mv` 移动到 `apps/web`
4. 修改根目录脚本、TypeScript 和 Vite 路径
5. 修改 Cloudflare Pages 构建配置
6. **验收**：`pnpm install`、`pnpm dev:web`、`pnpm check:web`、`pnpm build:web` 全部通过。Cloudflare Pages 预览部署通过。

### Phase 2：抽取纯 TypeScript 共享包

按顺序抽取：domain → catalog → command-plan → diagnostics → i18n → test-utils。每抽取一个包都要：使用 `git mv`、增加独立 `package.json`、修正 import、运行原有测试、确认 Web 构建无变化、独立提交。

**验收**：网页运行效果、生成命令、测试数量和构建结果与迁移前一致。

### Phase 3：抽取共享工作台

抽取 BuilderPage、WorkbenchShell、ParameterField、CommandPreview、DiagnosticPanel、通用样式到 `packages/workbench`。建立 PlatformProvider 和有限扩展点。让 `apps/web` 变成薄宿主。

**验收**：`apps/web` 主要只保留入口、网页平台适配器、网页专属配置。页面表现和功能与迁移前一致。

### Phase 4：建立 Electron 安全壳层

1. 创建 `apps/desktop`
2. 引入 Electron、electron-vite、创建 Main Process / preload / Desktop Renderer
3. 引用 `@ffcodec/workbench`
4. 配置 BrowserWindow 安全参数、导航限制、窗口状态、独立桌面菜单
5. **验收**：`pnpm dev:web` 正常启动网页。`pnpm dev:desktop` 正常启动 Electron。两端显示相同的工作台主体。

### Phase 5：建立平台接口与桌面扩展

1. 创建 `packages/platform-api`、Web/Desktop Platform Adapter
2. 创建 `packages/desktop-ui`、Header/Inspector/Command Action/Path Field 扩展点
3. **验收**：共享工作台中没有直接访问 `window.desktopAPI`/Electron/Node.js API。

### Phase 6：FFmpeg 与 ffprobe 检测

1. 自动检测 FFmpeg 和 ffprobe（PATH、Scoop、Chocolatey、WinGet、常见目录、手动指定）
2. 验证版本、保存路径、设置检测超时
3. **验收**：至少能识别 PATH/Scoop/Chocolatey/WinGet/常见目录/手动指定。网页端不显示 FFmpeg 设置。

### Phase 7：原生文件对话框与拖放

1. 输入/输出文件选择、多文件选择、目录选择、字幕和脚本选择
2. Renderer 文件拖放、`webUtils.getPathForFile`
3. **验收**：网页仍使用原有输入方式。桌面端路径包含特殊字符时正常工作。

### Phase 8：结构化执行计划

1. 增加 `ExecutionPlan`、将命令参数保存为结构化 token
2. 输出 `string[]`、保留 Shell 文本渲染
3. 校验输入输出、判断输出覆盖、估算任务时长
4. **验收**：复制命令和桌面执行在语义上保持一致，但使用不同输出链路。

### Phase 9：FFmpeg 执行引擎

1. 直接 spawn FFmpeg（`shell: false`）
2. 添加 `-progress pipe:1`、stdout 解析进度、stderr 写入日志
3. 支持失败处理、取消、清理进程、限制并发
4. **验收**：正常/短任务/错误任务均正确。取消后无残留进程。特殊字符路径正常。应用退出后无僵尸进程。

### Phase 10：编码 UI

编码前显示输入/输出文件、FFmpeg 版本、预计时长、覆盖策略。编码中显示进度条、Frame/FPS/Speed/Bitrate/输出大小/预计剩余时间/取消按钮。完成后显示成功状态/耗时/输出路径/输出大小。失败后显示错误摘要/退出码/常见原因/完整日志。

**验收**：网页端不出现执行按钮和编码面板。Desktop 组件重新挂载后能够恢复当前任务状态。

### Phase 11：历史和日志

记录成功/失败/取消任务、查看日志、定位输出、删除/清空历史、清理过期日志。

**验收**：实时进度不频繁写入 electron-store。日志缺失时界面能够正常处理。

### Phase 12：Windows 打包

electron-builder 配置 NSIS 安装包。首版不捆绑 FFmpeg。首次启动时自动检测，未找到时引导用户安装或手动选择。

**验收**：`pnpm build:desktop:win` 生成可安装的 Windows 安装包。在干净 Windows 11 环境测试安装/启动/FFmpeg 检测/文件选择/编码/取消/历史/日志/卸载。

---

## 二十四、测试策略

- **共享包测试**：Domain Layer、编码器目录、参数绑定、Command Plan、Shell Renderer、Execution Plan、诊断逻辑
- **Web 回归测试**：网页启动、编码器选择、参数编辑、命令生成、诊断、复制命令、Cloudflare 构建
- **Electron 单元测试**：FFmpeg 检测、ffprobe 解析、IPC 参数校验、进度解析、任务状态转换、取消流程、日志管理、历史管理、窗口位置恢复
- **模拟 FFmpeg**：创建模拟程序用于自动化测试（正常完成、异常退出、长任务取消等），避免全部依赖真实视频编码
- **实际媒体测试**：保留一个短视频作为 smoke test

---

## 二十五、风险控制

1. **Monorepo 迁移破坏网页部署**：迁移前创建 Git 标签、使用独立迁移分支、每个包独立迁移和提交
2. **共享包划分过细**：初期先建立 domain、catalog、command-plan、workbench、platform-api、desktop-ui，后续按需拆分
3. **共享 UI 被桌面逻辑污染**：平台能力通过 Platform Adapter 注入，桌面 UI 通过扩展点注入
4. **Electron 依赖影响 Web**：Electron 依赖只位于 apps/desktop，Web 构建只过滤 @ffcodec/web
5. **Command Plan 只能输出文本**：保留原 Shell Renderer，补充 ExecutionPlan，不从文本反向拆参数

## 二十六、提交顺序

```
chore: create monorepo migration baseline
chore: initialize pnpm workspace
refactor(web): move web app into apps/web
build(web): restore Cloudflare Pages build
refactor(domain): extract shared domain package
refactor(catalog): extract encoder catalog package
refactor(command-plan): extract command planning package
refactor(workbench): extract shared React workbench
refactor(platform): add platform adapter contracts
electron: add secure desktop application shell
desktop: add workbench renderer host
ffmpeg: add FFmpeg and ffprobe detection
desktop: add native file dialogs
command-plan: add structured execution plan
ffmpeg: add progress-based executor
ffmpeg: add job cancellation and cleanup
desktop: add encoding panel
desktop: add history and log management
build(desktop): add Windows NSIS packaging
test: add cross-platform workspace coverage
docs: complete monorepo architecture documentation
```

## 二十七、最终完成标准

- 整个项目只使用一个 Git 仓库
- Web 和 Desktop 拥有独立应用目录，共享逻辑只维护一份
- 网页可独立开发和部署，桌面端可独立开发和打包
- Electron 依赖不会进入网页产物
- 共享包修改会同时测试 Web 和 Desktop
- Renderer 无 Node.js 直接访问能力，preload 只暴露有限 API
- FFmpeg 使用绝对路径和结构化参数执行，不通过 Shell 执行完整命令文本
- 进度通过 `-progress pipe:1` 获取
- 支持 ffprobe、原生文件选择和拖放、实时进度和任务取消
- 退出应用后无残留 FFmpeg 进程
- 支持编码日志和历史
- 能够生成 Windows NSIS 安装包

---

实施必须从 Phase 0 开始。先创建可回退的网页基线，再建立 Workspace。不得在没有基线标签、没有迁移分支、没有网页回归测试的情况下直接移动现有项目文件。
