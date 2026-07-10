# Project Status

Last updated: 2026-07-10 16:50
Updated by: Claude Code (DeepSeek-v4-pro)

## Current Snapshot

- Current objective: 第四阶段开发 — 架构收口 + 交互完整性修复 + PresetManager UI + Intel QSV + E2E 测试 + v0.4.0
- Current state: Phase 4 已完成约 60%。TypeScript 0 错误、目录审计 0 错误 0 警告、193 单元测试通过、生产构建成功。
  - Section 3-5 ✓: v0.3.0 基线 + warning 治理 + configBinding 全量迁移
  - Section 6-11 ✓: 交互完整性修复 + applyFieldChange + 审计清单 + 调试面板 + 契约测试
  - Section 14 ✓: PresetManager 正式 UI
  - Section 15-21: QSV 待开始
  - Section 22-27: E2E + 文档 + 发布待开始
- v0.4.0 至今指标:
  - tsc: 0 errors
  - vitest: 193/193 passed (12 files, +56 new)
  - audit: 0 errors, 0 warnings (5 warning 修复)
  - build: 297 KB JS + 1.3 KB CSS
- Last active agent: Claude Code
- Likely next agent: Claude Code
- Next recommended step: Intel QSV (h264_qsv + hevc_qsv) 编码器接入
- Likely next agent: Claude Code
- Next recommended step: 治理 5 条目录 warning → configBinding 全量迁移 → 交互控件完整性审计

## Active TODO

- [ ] 为软件编码器（libx264, libx265, libsvtav1, aac, libopus）controls 添加 configBinding
  - Owner: pending
  - Status: revision #19 — 旧回退删除后的清理任务
  - Relevant files: src/data/encoders/video/*.ts, src/data/encoders/audio/*.ts

- [ ] 删除 getControlValue 旧模式匹配回退
  - Owner: pending
  - Status: 等待全部 controls 完成 configBinding
  - Relevant files: src/domain/command/command-builder.ts

- [ ] React Testing Library 集成测试
  - Owner: pending
  - Status: not started
  - Notes/blockers: 当前 137 测试全为单元测试

- [ ] 实现 PresetManager UI 组件
  - Owner: pending
  - Relevant files: src/features/presets/PresetManager.tsx
  - Notes/blockers: preset-service.ts 已完成

- [ ] 第四阶段：QSV / AMF / VideoToolbox 硬件编码器
  - Owner: pending
  - Notes/blockers: 需要先完成 configBinding 清理

## Recently Completed

- 2026-07-10 16:10: 第三阶段 Milestone B — 多字幕轨道（SubtitleTrackConfig[] + -c:s:N + -metadata:s:s:N + -disposition:s:N）、独立配置迁移模块（migrateConfig 共用管道）、诊断修复建议（code+context → fixes, 事务性应用）、可分享配置（ShareableProjectConfig, URL hash, JSON export）、审计扩展（11 新检查）、137 单元测试（+61 new）

- 2026-07-10 15:50: 第三阶段 Milestone A — 基础类型扩展（CodecFamily, EncoderImplementation, RateControlModeId, CapabilityScope, ConfigPath, Diagnostic）、5 项参数核验（libopus 枚举修正, AAC anmr 实验性）、NVENC 编码器（h264_nvenc + hevc_nvenc）、FLAC 编码器、OGG 容器、modeArguments + configBinding 命令构建器扩展

- 2026-07-10 14:55: 第二阶段核心开发完成

- 2026-07-10 14:25: 首轮开发完成

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

### 2026-07-10 16:15 - Claude Code (DeepSeek-v4-pro)

- Objective: 第三阶段开发 — Milestone B + 诊断修复 + 分享配置 + 测试
- Work completed:
  1. **Phase 4** — 独立配置迁移模块: `src/domain/migration/` (migrateConfig, migration-registry, v1-to-v2)
  2. **Phase 5** — 多字幕轨道: SubtitleTrackConfig[] 替换 SubtitleMuxConfig, -c:s:N/-metadata:s:s:N/-disposition:s:N, sourceCodec 未知 copy→warning, mainStreamRelIndex/externalStreamIndex 区分
  3. **Phase 6** — 诊断修复建议: buildFixSuggestions (code+context→fixes), applyFix (白名单→schema→norm→rules→validation)
  4. **Phase 7** — 可分享配置: ShareableProjectConfig (剔除本地路径), URL hash base64url, 长度上限 2000→JSON export, Zod验证+migration
  5. **Phase 8** — 审计扩展 (11 新检查) + 61 新测试 (capability, nvenc, flac, subtitle-tracks, diagnostic-fix, share-config)
- Files changed:
  - Modified: STATUS.md, validate-catalog.ts, project-config.ts, config-schema.ts, defaults.ts, command-builder.ts, resolve-section.ts, rules/index.ts, acceptance-test.ts, rules.test.ts, presentation.test.ts
  - New: src/domain/migration/ (4 files), src/domain/diagnostics/ (3 files), src/features/sharing/ (2 files), src/tests/unit/capability.test.ts, nvenc.test.ts, flac.test.ts, subtitle-tracks.test.ts, diagnostic-fix.test.ts, share-config.test.ts
- Commands run:
  - `npx tsc -b --noEmit`: 0 errors
  - `npx vitest run`: 137/137 passed (11 files)
  - `npx tsx scripts/validate-catalog.ts`: 0 errors, 5 warnings (configBinding legacy)
  - `npx vite build`: 成功 (296KB JS)
- Verification:
  - TypeScript strict 模式: 0 errors
  - 目录审计: 0 errors, 5 warnings (预期 — revision #19 configBinding 遗留)
  - 单元测试: 137/137 passed (76 original + 61 new)
  - 生产构建: 成功
  - 原有 76 测试 0 弱化/删除
- TODO changes:
  - 完成: 5 项参数核验、NVENC+FLAC、多字幕轨道、配置迁移、诊断修复、分享配置
  - 新增: 软件编码器 configBinding 清理、旧回退删除
- Decisions/risks:
  - SubtitleTrackConfig 不存储 inputIndex (由 Command Builder 分配)
  - -c:s:N per-track (不用全局 -c:s)
  - sourceCodec 未知 + copy → warning (非 error)
  - ShareableProjectConfig 剔除 input/output/subtitle 路径
  - 5 个 audit warnings 来自 revision #19 — 软件编码器 controls 尚未迁移到 configBinding
- Environment notes: 不涉及环境变化
- Git status: 36 modified + 21 new files, uncommitted
- Next step: 提交 Phase 8 变更；为软件编码器添加 configBinding；第四阶段

### 2026-07-10 15:50 - Claude Code (DeepSeek-v4-pro)

- Objective: 第三阶段 Milestone A — 基础类型扩展 + 参数核验 + NVENC + FLAC
- Work completed:
  1. 13 个新类型: CodecFamily, EncoderImplementation, RateControlModeId, CapabilityScope, HardwareRequirement, AvailabilityClass, ConfigBinding, ConfigPath (受控路径), Diagnostic, DiagnosticCategory, DiagnosticFix, ConfigPatchOperation
  2. 5 项参数核验: libx264 CQP 0-69 已确认, libsvtav1 QP/preset 已确认, libopus frame_duration 枚举修正, AAC anmr 实验性标记
  3. NVENC: h264_nvenc + hevc_nvenc (细粒度硬件需求, modeArguments, configBinding)
  4. FLAC: 无损编码, compression_level 0-12, MP4 supported-with-caveat
  5. OGG 容器新增
  6. command-builder: modeArguments + configBinding 支持
  7. 呈现层: FLAC 无码率控件, 编码器分组/badge
- Files changed: 36 files (+4 new: h264_nvenc.ts, hevc_nvenc.ts, flac.ts, config-path.ts)
- Commands run: tsc 0, vitest 76/76, audit 0/0, build OK
- Verification: TS 0, 76 tests, audit 0/0, build 293KB JS
- Git status: committed (9de6228)

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

### 2026-07-10 16:50 - Claude Code (DeepSeek-v4-pro)

- Objective: 第四阶段 Part 1/2 — 架构收口 + 交互完整性 + PresetManager UI
- Work completed:
  1. **Section 3** — v0.3.0 基线: tag v0.3.0, tsc 0, vitest 137, audit 0/5, build 296KB
  2. **Section 4** — Warning 治理: `docs/audit-warning-register.md`, 登记全部 5 条 W001-W005
  3. **Section 5** — configBinding 全量迁移:
     - 为 5 个软件编码器 22 个 controls 添加 configBinding
     - 删除 command-builder.ts 旧 getControlValue 模式匹配回退
     - 审计升级 warning→error: 0 errors, 0 warnings
  4. **Section 6-11** — 交互完整性:
     - `apply-field-change.ts`: 统一字段变更入口，React 不解析 ConfigPath
     - ResolvedField 添加 configBinding 字段
     - 删除 BuilderPage `mapFieldIdToConfigPath` 硬编码映射
     - resolve-section.ts: 使用 configBinding 替代模式匹配
     - `control-interaction-audit.md`: 全量控件审计清单
     - `InteractionDebugPanel.tsx`: 开发模式调试面板
     - `control-binding-contract.test.ts`: 56 契约测试
     - 复选框审计: checked/e.target.checked/?? 全部正确
  5. **Section 14** — PresetManager UI:
     - PresetManager/PresetList/PresetEditorDialog/PresetImportDialog
     - resolve-preset-summary: catalog-driven 预设摘要
     - BuilderPage 集成（💾 预设按钮）
- Files changed:
  - Modified: STATUS.md, validate-catalog.ts, command-builder.ts, BuilderPage.tsx, resolved-field.ts, resolve-field.ts, resolve-section.ts, presentation/index.ts
  - New: audit-warning-register.md, control-interaction-audit.md
  - New: apply-field-change.ts, InteractionDebugPanel.tsx, control-binding-contract.test.ts
  - New: PresetManager.tsx, PresetList.tsx, PresetEditorDialog.tsx, PresetImportDialog.tsx, resolve-preset-summary.ts
  - Encoder configBinding: libx264.ts, libx265.ts, libsvtav1.ts, aac.ts, libopus.ts
- Commands run:
  - `npx tsc -b --noEmit`: 0 errors（多次）
  - `npx vitest run`: 193/193 passed (12 files, +56 new)
  - `npx tsx scripts/validate-catalog.ts`: 0 errors, 0 warnings
  - `npx vite build`: 成功 (297KB JS)
- Verification:
  - TypeScript strict 模式: 0 errors
  - 目录审计: 0 errors, 0 warnings (5 warning → 已修复)
  - 单元测试: 193/193 passed (137 original + 56 new)
  - 生产构建: 成功
  - 原有 137 测试 0 弱化/删除
- TODO changes:
  - 完成: configBinding 迁移, 交互完整性修复, PresetManager UI
  - 新增: QSV 编码器接入, E2E 测试, 文档
- Decisions/risks:
  - applyFieldChange 统一入口: React 零 ConfigPath 解析
  - configBinding 全量覆盖: 所有 encoder qualityModes controls
  - InteractionDebugPanel 仅开发模式启用 (?debugInteractions=1)
  - specialParameters 写入/读取路径不一致（sp.id vs snake_case key）— 标记为待修复
- Environment notes: 不涉及环境变化
- Git status: 4 commits (0ba8726, df728e5, 41e95bf, 396ae9c), working tree clean
- Next step: QSV 编码器接入 (h264_qsv + hevc_qsv) 或按用户指示
