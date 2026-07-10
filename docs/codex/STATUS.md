# Project Status

Last updated: 2026-07-10 14:30
Updated by: Claude Code (DeepSeek-v4-pro)

## Current Snapshot

- Current objective: 首轮开发 — 建立项目骨架、Domain Layer、数据目录、规则引擎、Command AST、Shell Renderer 和开发验证页面
- Current state: 首轮开发完成。TypeScript 0 错误、目录审计 0 错误 0 警告、33 单元测试通过、生产构建成功。
- Last active agent: Claude Code
- Likely next agent: Claude Code
- Next recommended step: 实现参数解释面板，点击命令片段定位控件；补齐字幕混流/烧录 UI；添加 h264_nvenc/hevc_nvenc/FLAC 编码器数据

## Active TODO

- [ ] 实现参数解释面板（点击命令片段定位控件，显示禁用原因和来源）
  - Owner: pending
  - Status: not started
  - Relevant files: src/components/explanation/, src/pages/builder/
  - Notes/blockers: 需要先完成第二阶段 UI 框架

- [ ] 实现字幕混流/烧录完整 UI
  - Owner: pending
  - Status: not started
  - Relevant files: src/pages/builder/sections/SubtitleSection.tsx, src/domain/filters/
  - Notes/blockers: Domain Layer 已有字幕模型（SubtitleMuxConfig / SubtitleBurnConfig），UI 待开发

- [ ] 添加硬件编码器数据（h264_nvenc, hevc_nvenc）
  - Owner: pending
  - Status: not started
  - Relevant files: src/data/encoders/video/
  - Notes/blockers: 需核验 NVENC 参数范围和 preset 选项

- [ ] 添加 FLAC 音频编码器数据
  - Owner: pending
  - Status: not started
  - Relevant files: src/data/encoders/audio/
  - Notes/blockers: FLAC 参数较简单，优先度低

- [ ] 核验 5 项标记为待核验的参数（见 source-map.md）
  - Owner: pending
  - Status: not started
  - Relevant files: docs/source-map.md
  - Notes/blockers: libx264 CQP 范围 0~69、libsvtav1 QP 范围 0~63、libsvtav1 preset 数值 0~13、libopus frame_duration、AAC aac_coder

- [ ] 预设管理与本地持久化
  - Owner: pending
  - Status: not started
  - Relevant files: src/features/presets/, src/features/persistence/
  - Notes/blockers: schemaVersion 迁移逻辑待设计

## Recently Completed

- 2026-07-10 14:25: 首轮开发完成 — 项目骨架、核心类型、编码器/容器/解释/参数数据、规则引擎 11 条规则、规范化器、兼容性校验器、视频滤镜构建器、Command AST 构建器、Bash/PowerShell/CMD 渲染器、Zustand store、开发验证页面、目录审计脚本、33 项单元测试、source-map.md、architecture.md

## Decisions

- 2026-07-10 13:50:
  - Decision: 采用 React 18 + Vite 5 + TypeScript strict + Zustand + Zod + Vitest 技术栈
  - Reason: 与 Codex 项目指令集的技术栈要求一致，纯前端无需后端
  - Impact: 所有代码需通过 TypeScript strict 模式检查

- 2026-07-10 13:55:
  - Decision: Domain Layer 完全脱离 React/Zustand，所有业务逻辑为纯函数
  - Reason: 确保规则引擎、命令构建器和规范化器可以独立测试
  - Impact: usePipeline hook 串联所有 Domain 层函数，UI 只消费结果

- 2026-07-10 14:00:
  - Decision: 编码器能力独立定义，不建立全局 CRF 范围
  - Reason: 每个编码器的每种质量模式独立定义范围，避免硬编码全局默认值
  - Impact: libx264 CRF 范围 0~51、libx265 CRF 范围 0~51、libsvtav1 CRF 范围 0~63，各自独立

- 2026-07-10 14:05:
  - Decision: 规则使用声明式 AST（9 种操作符），不在 JSON 中嵌入 JS 字符串表达式
  - Reason: 指令集中明确要求使用受控规则 AST
  - Impact: 规则定义文件完全可 JSON 化，安全可审计

- 2026-07-10 14:10:
  - Decision: 字幕混流和字幕烧录在 Config 模型中完全分离
  - Reason: 混流不触发视频重编码，烧录要求重编码，两者生成不同结构的命令
  - Impact: SubtitleMuxConfig 和 SubtitleBurnConfig 独立，各自映射到不同的 Command AST 区域

## Risks And Blockers

- Node.js 环境依赖:
  - Impact: 项目需要 Node.js 24.18.0（已通过 winget 在当前机器安装），新设备需重新安装
  - Mitigation or next check: 在新设备上运行 `npm install && npm run check`

- 未核验参数（5 项）:
  - Impact: libx264 CQP、libsvtav1 QP/preset、libopus frame_duration、AAC aac_coder 的参数范围来自 FFmpegFreeUI 定义，尚未通过编码器官方文档交叉核验
  - Mitigation or next check: 在 source-map.md 中记录，暂不影响核心功能

- 非 Git 仓库:
  - Impact: 无版本控制和远程备份，代码丢失风险
  - Mitigation or next check: 建议在后续阶段初始化 Git 仓库

## Environment Notes

- Current known environment:
  - OS: Windows 11 Pro for Workstations 10.0.26220
  - Node.js: v24.18.0（通过 winget 安装）
  - npm: 11.16.0
  - Package manager: npm
  - Shell: Git Bash (MinGW64)
  - Working directory: d:\pyprogram\FFCodec Lab
- Recheck required before: 切换设备、在新目录运行、npm install 失败时
- Local-only notes:
  - Node.js 路径: C:\Program Files\nodejs\
  - 开发服务器: `npm run dev` → `http://localhost:5173`
  - 全量检查: `npm run check`（tsc + vitest + audit + build）

## Verification And Commands

- Commands run:
  - `npx tsc --noEmit`: 0 errors, 类型检查通过
  - `npx vitest run`: 33/33 tests passed (3 文件, 849ms)
  - `npx tsx scripts/validate-catalog.ts`: 0 errors, 0 warnings
  - `npx vite build`: 成功 (235KB JS, 1.3KB CSS)
  - `npx vite --host`: 开发服务器 localhost:5173 可用
  - `npm install`: 344 packages installed
- Tests/checks:
  - rules.test.ts: 17 tests — 规则表达式求值 + R01-R15 不变量
  - command.test.ts: 11 tests — 命令构建 + 快照 + 不变量 (originId, -vf 唯一性, 转义)
  - normalizer.test.ts: 5 tests — preset/profile/quality 切换
- Not run: React Testing Library 集成测试（首轮仅含单元测试）

## Git Sync

- Git repository: no
- Branch: N/A
- Last known commit: N/A
- Uncommitted changes: N/A
- Working tree clean: N/A (not a git repo)
- Commit recommended before switching agents/devices: N/A — 建议 `git init` 并做首次提交

## Session Log

Append new entries below this line. Use `YYYY-MM-DD HH:MM` so same-day work remains ordered. Do not overwrite previous entries.

### 2026-07-10 14:30 - Claude Code (DeepSeek-v4-pro)

- Objective: 首轮开发 — 依据 Codex 项目指令集和 FFmpegFreeUI 裁剪方案，建立纯前端 FFmpeg 压制命令生成器的基础架构、数据目录和核心引擎
- Work completed:
  1. 项目骨架: Vite 5 + React 18 + TypeScript strict + Zustand + Zod + Vitest，57 个源文件
  2. Domain Layer (18 文件): ProjectConfig 类型、Zod schema、Catalog 类型、RuleExpression AST (9 操作符)、RuleEffect (8 效果)、规范化器、兼容性校验器、视频滤镜构建器、Command AST (15 阶段排序)、Bash/PowerShell/CMD 渲染器
  3. Data Layer (10 文件): libx264/libx265/libsvtav1 视频编码器、AAC/libopus 音频编码器、MP4/MKV/WebM/MOV 容器兼容矩阵、70+ 条参数解释、7 个共享参数定义、11 条内置规则
  4. 应用层 (3 文件): Zustand store (ProjectConfig + UI 会话)、React pipeline hook (config→normalize→rules→validate→command→render)
  5. UI (1 页面): DevVerificationPage — 选择编码器/质量模式/容器，显示能力面板、规则消息、规范化通知、Command AST 和渲染命令
  6. 脚本 (1 文件): validate-catalog.ts — 来源检查、ID 唯一性、默认值范围、解释引用完整性
  7. 测试 (3 文件, 33 tests): 规则引擎 (17)、命令构建 (11)、规范化器 (5)
  8. 文档 (2 文件): architecture.md (分层架构、数据流、关键决策)、source-map.md (FFmpegFreeUI→本项目模块映射)
  9. HandShake 记录: 初始化并填充 STATUS.md、工作进度.md、版本迭代记录.md
- Files changed: 57 new files created (完整清单见 architecture.md)
- Commands run:
  - `winget install OpenJS.NodeJS.LTS` — Node.js 24.18.0 安装成功
  - `npm install` — 344 packages
  - `npx tsc --noEmit` — 0 errors (4 轮修复后)
  - `npx vitest run` — 33/33 passed
  - `npx tsx scripts/validate-catalog.ts` — 0 errors, 0 warnings
  - `npx vite build` — 成功
- Verification:
  - TypeScript strict 模式: 0 errors
  - 目录审计: 0 errors, 0 warnings
  - 单元测试: 33/33 passed
  - 生产构建: 235KB JS, 1.3KB CSS
  - 开发服务器: localhost:5173 正常运行
- TODO changes:
  - 本阶段完成: 项目骨架、核心类型、编码器/容器数据、规则引擎、Command AST、Shell 渲染器、开发验证页面
  - 新增 TODO: 解释面板、字幕 UI、硬件编码器、FLAC、参数核验、预设管理
- Decisions/risks:
  - 技术栈: React 18 + Vite 5 + TS strict + Zustand + Zod + Vitest
  - Domain Layer 零 React 依赖，所有业务逻辑为纯函数
  - 编码器能力独立定义，无全局 CRF 范围
  - 声明式规则 AST，不在 JSON 中嵌入 JS 表达式
  - 字幕混流与烧录完全分离
  - 5 项参数标记为待核验（记录在 source-map.md）
  - 非 Git 仓库，建议初始化
- Environment notes:
  - Node.js v24.18.0 通过 winget 安装于 C:\Program Files\nodejs\
  - 开发命令: `npm run dev` / `npm run check`
- Git status: 非 Git 仓库（not a git repository）
- Next step: 实现参数解释面板 + 字幕 UI，或按用户指示进入第二阶段
