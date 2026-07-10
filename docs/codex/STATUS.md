# Project Status

Last updated: 2026-07-10 15:05
Updated by: Claude Code (DeepSeek-v4-pro)

## Current Snapshot

- Current objective: 第二阶段开发 — 完成可用 MVP（正式 BuilderPage、参数解释、字幕、命令预览、预设）
- Current state: 第二阶段核心功能完成。TypeScript 0 错误、目录审计 0 错误 0 警告、76 单元测试通过、生产构建成功、10 项验收配置全部通过。
- Last active agent: Claude Code
- Likely next agent: Claude Code
- Next recommended step: 交叉核验 5 项待核验参数；添加 FLAC 编码器；实现 PresetManager UI 组件

## Active TODO

- [ ] 交叉核验 5 项待核验参数（libx264 CQP、libsvtav1 QP/preset、libopus frame_duration、AAC aac_coder）
  - Owner: pending
  - Status: not started
  - Relevant files: docs/source-map.md
  - Notes/blockers: 需要 FFmpeg 官方文档或编码器官方文档

- [ ] 实现 PresetManager UI 组件（预设管理面板）
  - Owner: pending
  - Status: not started
  - Relevant files: src/features/presets/PresetManager.tsx
  - Notes/blockers: preset-service.ts 已完成，UI 组件待开发

- [ ] React Testing Library 集成测试
  - Owner: pending
  - Status: not started
  - Relevant files: src/tests/
  - Notes/blockers: 当前仅有单元测试（76 tests），需增加组件渲染测试

- [ ] 添加 FLAC 编码器（可选扩展）
  - Owner: pending
  - Status: not started
  - Relevant files: src/data/encoders/audio/
  - Notes/blockers: FLAC 参数简单，前提是正式页面、预设均已完成后

- [ ] 添加硬件编码器数据（h264_nvenc, hevc_nvenc）
  - Owner: pending
  - Status: not started
  - Relevant files: src/data/encoders/video/
  - Notes/blockers: 需核验 NVENC 参数范围和 preset 选项；需在纵向闭环验证通过后

## Recently Completed

- 2026-07-10 14:55: 第二阶段核心开发完成 — SourceRef/VerificationLevel 类型模型分离、presentation 解析层（ResolvedField）、正式 BuilderPage + 7 个组件、解释面板、命令预览（多行/单行/复制/token点击/3种Shell）、视频/音频/字幕 UI（通过 resolved fields 渲染）、预设服务（CRUD + 导入导出 + Zod验证 + schema migration + 5个内置预设）、持久化层（localStorage适配器）、76 单元测试（+43 new）、10 项验收配置全部通过、mvp-acceptance.md

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

- ~~非 Git 仓库~~ (已解决)

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
  - `npx tsc -b --noEmit`: 0 errors, 类型检查通过
  - `npx vitest run`: 76/76 tests passed (5 文件, 1.07s)
  - `npx tsx scripts/validate-catalog.ts`: 0 errors, 0 warnings
  - `npx vite build`: 成功 (263KB JS, 1.3KB CSS)
  - `npx tsx scripts/acceptance-test.ts`: 10/10 验收配置通过
  - `npm install --save-dev @types/node`: installed
- Tests/checks:
  - rules.test.ts: 17 tests — 规则表达式求值 + R01-R15 不变量
  - command.test.ts: 11 tests — 命令构建 + 快照 + 不变量 (originId, -vf 唯一性, 转义)
  - normalizer.test.ts: 5 tests — preset/profile/quality 切换
  - presentation.test.ts: 25 tests — 字段解析、section构建、builder view集成、command origin映射
  - presets.test.ts: 18 tests — CRUD、导入导出、Zod验证、schema migration、内置预设
- Not run: React Testing Library 集成测试

## Git Sync

- Git repository: yes
- Branch: master
- Last known commit: 097b02a (v0.1.0 首轮开发)
- Remote: `git@github.com:maxzrb/FFCodec-Lab.git` (private)
- Uncommitted changes: 15 modified + 11 new files (see Session Log for details)
- Working tree clean: no
- Commit recommended before switching agents/devices: YES

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

### 2026-07-10 15:05 - Claude Code (DeepSeek-v4-pro)

- Objective: 第二阶段开发 — 完成可用 MVP，建立完整的 FFmpeg 压制命令生成器闭环
- Work completed:
  1. **Section 2 — 参数核验状态模型修正**:
     - 新增 `SourceAuthority` 和 `VerificationLevel` 类型到 catalog-types.ts
     - 更新 `ParameterDefinition` 和 `EncoderDefinition`：添加 `sourceAuthority`、`verificationLevel`、`needsCrossVerification` 字段
     - 保留旧 `status` 字段标记为 `@deprecated` 以保证向后兼容
     - 更新全部 5 个编码器数据文件、7 个共享参数定义
     - 目录审计脚本新增 `checkVerificationLevel()`：检查字段完整性 + 非法状态组合
  2. **Section 4 — 字段解析层（Presentation Layer）**:
     - `resolved-field.ts`：`ResolvedField`、`ResolvedSection`、`ResolvedBuilderView` 类型
     - `resolve-field.ts`：`resolveControlField`、`resolveParameterField`、`resolveTextField`、`resolveSwitchField`、`attachDiagnostics`
     - `resolve-section.ts`：6 个 section builder（input、video、frame、audio、subtitle、container）
     - `resolve-builder-view.ts`：`resolveBuilderView()` — 整合所有解析 + command origin 映射
     - 零 React 依赖，纯 TypeScript
  3. **Sections 3/6/7/8 — 正式 BuilderPage + 组件**:
     - `BuilderPage.tsx`：正式产品页面，消费 `resolveBuilderView()` 输出
     - `ParameterField.tsx`：渲染单个 `ResolvedField`，支持 select/number/text/switch
     - `ParameterSection.tsx`：可折叠区域，渲染字段列表
     - `CommandPreview.tsx`：多行/单行显示、复制、Shell 切换、token 点击定位
     - `ShellSelector.tsx`：Bash/PowerShell/CMD 切换
     - 组件零 FFmpeg 业务硬编码
     - `DevVerificationPage` 保留为开发调试页面
  4. **Section 5 — 解释系统**:
     - `ExplanationPanel.tsx`：显示参数标题、说明、命令示例、影响评估（画质/体积/速度/兼容性）、注意事项、来源引用
     - 支持点击字段？按钮打开解释
  5. **Section 9 — 命令预览**:
     - 支持 Bash/PowerShell/CMD 三种 Shell
     - 单行/多行切换
     - 点击命令 token → 定位控件（通过 originId 映射到 ResolvedField）
     - 错误状态禁止复制
     - 两遍编码显示两条命令
  6. **Section 10 — 预设与持久化**:
     - `preset-types.ts`：`UserPreset` 类型 + Zod 导入导出 schema
     - `storage-adapter.ts`：抽象 `StorageAdapter` 接口 + `LocalStorageAdapter` 实现
     - `preset-service.ts`：完整 CRUD + import/export + schema migration + 5 个内置预设
     - 预设保存 `ProjectConfig`，不保存命令文本
  7. **Section 12 — 测试**:
     - `presentation.test.ts`：25 tests — 字段解析、控件类型、值读取、fieldState应用、section构建、builder view集成、command origin映射
     - `presets.test.ts`：18 tests — CRUD、导入导出、Zod验证、schema migration、内置预设结构
     - 总计 76 tests（33 original + 43 new），全部通过
  8. **Section 13 — 验收测试**:
     - `scripts/acceptance-test.ts`：10 个配置的自动化验收脚本
     - 生成 `docs/mvp-acceptance.md`：包含每个案例的 Config 摘要、规则消息、Command AST、三种 Shell 命令
     - 10/10 全部通过
- Files changed:
  - Modified: catalog-types.ts, catalog/index.ts, libx264.ts, libx265.ts, libsvtav1.ts, aac.ts, libopus.ts, parameters/index.ts, rules/index.ts, builder-store.ts, App.tsx, validate-catalog.ts, package.json, package-lock.json, STATUS.md
  - New: domain/presentation/{resolved-field,resolve-field,resolve-section,resolve-builder-view,index}.ts (5 files)
  - New: pages/builder/BuilderPage.tsx, components/{ParameterField,ParameterSection,ShellSelector,CommandPreview}.tsx (5 files)
  - New: features/explanations/ExplanationPanel.tsx (1 file)
  - New: features/presets/{preset-types,preset-service}.ts (2 files)
  - New: features/persistence/storage-adapter.ts (1 file)
  - New: tests/unit/{presentation,presets}.test.ts (2 files)
  - New: scripts/acceptance-test.ts, docs/mvp-acceptance.md (2 files)
- Commands run:
  - `npx tsc -b --noEmit` — 0 errors
  - `npx vitest run` — 76/76 passed
  - `npx tsx scripts/validate-catalog.ts` — 0 errors, 0 warnings
  - `npx vite build` — 263KB JS
  - `npx tsx scripts/acceptance-test.ts` — 10/10 通过
  - `npm install --save-dev @types/node` — installed
- Verification:
  - TypeScript strict 模式: 0 errors
  - 目录审计: 0 errors, 0 warnings
  - 单元测试: 76/76 passed (5 files)
  - 生产构建: 263KB JS, 1.3KB CSS
  - 验收: 10/10 配置通过
  - 原有 33 测试 0 弱化/删除
- TODO changes:
  - 完成: 解释面板、字幕 UI（mux/burn/字段解析）、命令预览（token定位+三种Shell）、预设管理（CRUD+导入导出）、参数核验模型修正
  - 保留: 5 项参数交叉核验、FLAC 编码器、硬件编码器、PresetManager UI 组件
- Decisions/risks:
  - 参数核验模型: `sourceAuthority`（数据来源）+ `verificationLevel`（核验程度）分离；保留旧字段保证向后兼容
  - Presentation Layer: 纯 TypeScript 解析层，UI 只消费 `ResolvedField`；编码器范围内 5 项 `needsCrossVerification: true`
  - 字幕烧录+copy 冲突: 规则 R08 生成 error，阻止无效配置
  - 预设: 存储 `ProjectConfig` 不存命令文本；Zod 验证导入内容；内置预设数值来自已核验目录
  - 未引入硬件编码器，未引入复杂滤镜系统
- Environment notes:
  - Node.js v24.18.0 via winget
  - @types/node 已安装
  - PATH must include `/c/Program Files/nodejs`
- Git status: 15 modified + 11 new files, working tree NOT clean
- Next step: 提交本阶段变更；交叉核验 5 项参数；实现 PresetManager UI；添加 FLAC
