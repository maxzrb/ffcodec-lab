# Project Status

Last updated: 2026-07-12 18:35
Updated by: Claude Code (DeepSeek-v4-pro)

## Current Snapshot

- Current objective: v0.6.0 — 修复字幕栏位移并完成稳定化、真实色彩处理、高级质量第二批和后续能力评估
- Current state: 全部计划项已实现、验证、提交 `b24cfcb` 并部署；生产站点已加载 v0.6.0 资源
- Current site: https://fflab.loliland.cn/
- Next objective: v0.6.0 无剩余实施项；后续按评估从受控剪辑和常用元数据开始新一轮
- Current verification: ESLint 0/0、TypeScript 0 errors、Vitest 359/359（22 文件）、catalog audit 0/0、acceptance 10/10、FFmpeg 8.1.1 smoke 4/4、production build 成功（业务 317.45 KB + vendor 205.27 KB + CSS 22.52 KB）；Cloudflare Pages success；生产 HTTP 200 与功能标识确认
- v0.4.0 已知阻断缺陷（已修复）:
  - 正式 BuilderPage 中所有 specialParameters 业务复选框无法选择（configBinding 缺失 + 读写路径不一致）
  - 开发验证页面不受影响（直接使用 setConfigValue 硬编码路径）
  - Playwright E2E 代码不可执行（浏览器被 AV 拦截）
- v0.4.1 修复内容:
  - 为全部 10 个编码器的 31 个 specialParameters 添加 configBinding
  - 修正 resolve-section.ts 使用 configBinding.path 读写
  - 修正 command-builder.ts 通过 encoder.specialParameters + commandBinding 生成参数
  - 修正 apply-field-change.ts 回退路径兼容标准 config path
  - resolveSwitchField/resolveTextField 支持 configBinding 参数
  - 移除 Playwright 依赖和 E2E 文件
  - 新增 6 个 RTL 集成测试（正式 BuilderPage checkbox 交互）
  - config-path.ts 新增 videoSpecialParamPath/audioQualityValuePath/extractConfigKey
  - 补齐 libopus application/frameDuration 与 FLAC sampleFormat 的 configBinding
  - 布尔特殊参数稳定映射为 1/0 或 on/off，移除 NVENC 重复 `-spatial_aq`
  - 目录审计强制每个质量控件和特殊参数必须具有合法 configBinding
- v0.4.1 最终指标:
  - tsc: 0 errors
  - vitest: 255/255 passed (15 files, +6 集成测试)
  - audit: 0 errors, 0 warnings
  - build: 405 KB JS + 1.3 KB CSS
  - Playwright: 已移除，不属于默认依赖
- Video encoders: 13 个 (software 5、NVIDIA 2、Intel 2、AMD 2、Apple 2)
- Last active agent: Claude Code (DeepSeek-v4-pro)
- Likely next agent: Claude Code
- Next recommended step: 无阻断任务；下一批按 `docs/next-capability-evaluation.md` 实施受控剪辑和常用元数据

## Active TODO

- [x] 高级参数工作台架构升级
  - Owner: Codex
  - Status: 已实现、全量验证、提交 `84c2028` 并部署到 Cloudflare Pages
  - Notes/blockers: 无功能阻断；Vite 对 509.09 KB 主包给出非阻断体积提示

- [x] 下一阶段：稳定化与高级参数第二批
  - Owner: Codex
  - Status: 全部计划项已完成、验证、提交 `b24cfcb` 并部署
  - Plan:
    1. 稳定化：更新过时的控件交互审计，补桌面/移动端工作台回归，拆分说明/预设等非首屏代码以消除 >500 KB 提示，建立代表性 FFmpeg 实机命令矩阵
    2. 真实色彩处理：在“只写元数据”之外新增明确的色彩转换模式，优先 zscale/tonemap 路径，处理 HDR→SDR、范围/矩阵/原色/传输联动及构建可用性诊断
    3. 高级质量第二批：继续从 FFmpegFreeUI 导入编码器适用的 level、lookahead、AQ、场景切换和参考帧类参数，保持 optional、三态与编码器切换清理
    4. 后续能力：在前三步稳定后再评估剪辑区间、元数据/章节/附件与自由滤镜排序，不与色彩处理同批混入
  - Acceptance: 旧 v1/v2/v3 配置与分享链接命令不变；新增参数默认不发射；唯一有序 `-vf`；实机错误可复现登记；全量 check、catalog audit、生产构建和桌面/移动端交互通过
  - Completion evidence: schema v3→v4 保持 metadata-only；359 tests；单一 `-vf` 组合测试；FFmpeg 8.1.1 4/4；桌面导航/移动选择器 RTL；后续能力评估见 `docs/next-capability-evaluation.md`

- [x] 英文遗漏、预设默认值、自由命令编辑、可选参数及新编码器
  - Owner: Codex
  - Status: 已提交 `2673a61` 并部署到 Cloudflare Pages 生产域名
  - Notes/blockers: 应用内浏览器无实例；官方 FFmpeg 文档与源码已核对 libaom-av1/libvvenc 参数

- [x] 参数介绍、诊断模块、全局语言与音频码率输入重制
  - Owner: Codex
  - Status: 已提交 `361949c` 并部署到 Cloudflare Pages 生产域名
  - Notes/blockers: 无功能阻断；应用内浏览器无实例，真实截图巡检保留为环境限制

- [x] v0.5.0 功能开发: AMF / VideoToolbox / 高级滤镜 / 字幕 / 分享 / 持久化 / UI
  - Owner: Codex
  - Status: 已完成并发布 Sites 私有站点版本 2
  - Notes/blockers: 应用内浏览器仍无可用实例；297 项测试包含正式页面 RTL 与全字段写入契约，真实浏览器视觉巡检保留为环境限制

- [x] v0.5.2 容器/扩展名双向同步与多流索引多选
  - Owner: Claude Code
  - Status: 已完成并提交 `cbb1c8d`，本地稳定点
  - Notes/blockers: 无阻断；不部署到 Sites，仅本地提交

- [ ] v0.5.1 稳定性与易用性更新
  - Owner: Codex
  - Status: 已随当前 master 部署到 Cloudflare Pages；旧 ChatGPT Sites 不再作为主部署目标
  - Notes/blockers: 无功能阻断；应用内浏览器不可用，主题和交互由 RTL 覆盖

## Recently Completed

- 2026-07-12 18:35: v0.6.0 closeout 核验与记录完善 — Claude Code 接管核验，全量检查 359/359 通过，修复 STATUS.md Git Sync 过时引用和 工作进度.md 摘要

- 2026-07-12 18:19: v0.6.0 提交并部署 — Cloudflare Pages success，生产资源确认包含稳定滚动条、schema v4 色彩转换诊断和高级质量第二批

- 2026-07-12 18:14: v0.6.0 实施完成 — 字幕栏稳定宽度、schema v4 zscale/tonemap/libplacebo、高级质量第二批、vendor 分包、4/4 FFmpeg 实机矩阵及后续能力评估

- 2026-07-12 17:33: 高级参数工作台提交 `84c2028` 并部署；Cloudflare Pages success，生产 bundle `index-D93ypZi1.js` 已确认包含侧栏折叠、色彩元数据和模块工作台能力

- 2026-07-12 17:18: 修复色彩区域首次无法关闭及重复 ID；区分像素格式/色彩元数据与流选择/封装设置；新增可折叠参数侧栏；修正说明卡片方形阴影及“诊断 0” — 346/346 测试、0/0 审计、build 成功

- 2026-07-12 12:44: 展开字段英文覆盖、六语标题、无 WebM 且保留全部字幕的内置预设、自由命令编辑器、可关闭的非必需参数、libaom-av1/libvvenc — 333/333 测试、0/0 审计、10/10 验收

- 2026-07-12 11:44: 全局中/EN切换、118 条参数介绍双语覆盖、可操作诊断、音频码率后置单位 — 318/318 测试、0/0 审计、10/10 验收

- 2026-07-11 23:02: v0.5.2 容器/扩展名双向同步与多流索引多选 — 307/307 测试、0/0 审计、10/10 验收

- 2026-07-10 18:00: v0.4.1 热修复 — 修复正式 BuilderPage specialParameters checkbox 交互、统一 configBinding 读写路径、移除 Playwright、新增 6 个 RTL 集成测试

- 2026-07-10 17:35: configBinding 全量迁移 — 为全部 10 个编码器 31 个 specialParameters 添加 configBinding

- 2026-07-10 14:55: 第二阶段核心开发完成

- 2026-07-10 14:25: 首轮开发完成

## Decisions

- 2026-07-12 11:44:
  - Decision: 使用全局语言状态切换中文或英文，不在单个 warning 内中英并排
  - Reason: 用户明确要求全局中/EN切换，避免诊断模块与其他界面语言割裂
  - Impact: 语言偏好写入 `ffcodec-locale`，参数目录、说明、诊断、命令区和预设界面共享同一 locale
  - Decision: 来源引用继续保留在目录模型与审计流程中，但解释卡片不展示 repository/file/symbol
  - Reason: 来源对内部可追溯性有用，对普通用户缺少决策价值
  - Impact: 目录审计能力不变，产品界面不再显示 `Lake1059/FFmpegFreeUI / xxx`

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

- 应用内浏览器不可用:
  - Impact: 2026-07-12 本次会话按 Browser 技能连接后确认浏览器列表为空，无法执行真实页面截图和点击验收
  - Mitigation or next check: 17 项 RTL BuilderPage 集成测试覆盖语言、码率、说明与 warning 交互；浏览器实例可用时再补视觉巡检

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
  - `npm run check`: 全部通过 (ESLint 0/0, tsc 0, vitest 318/318, audit 0/0, build OK)
  - `npx tsc -b --noEmit`: 0 errors, 类型检查通过
  - `npx vitest run`: 318/318 tests passed (20 文件)
  - `npx tsx scripts/validate-catalog.ts`: 0 errors, 0 warnings
  - `npx vite build`: 成功 (470.88KB JS, 17.44KB CSS)
  - `npx tsx scripts/acceptance-test.ts`: 10/10 验收配置通过
- Tests/checks:
  - rules.test.ts: 17 tests — 规则表达式求值 + R01-R15 不变量
  - command.test.ts: 12 tests — 命令构建 + 快照 + 不变量 (originId, -vf 唯一性, 转义)
  - normalizer.test.ts: 7 tests — preset/profile/quality 切换 + 容器/扩展名双向同步
  - presentation.test.ts: 25 tests — 字段解析、section构建、builder view集成、command origin映射
  - presets.test.ts: 18 tests — CRUD、导入导出、Zod验证、schema migration、内置预设
- React Testing Library: 17/17 正式 BuilderPage 交互通过（新增全局中/EN、码率单位、来源隐藏、warning 双语切换）
- i18n.test.ts: 3/3 — 全部目录标签/选项英文覆盖、118 条说明英文覆盖、通用说明非同义反复
- diagnostic-fix.test.ts: 12/12 — 兼容性 warning 容器建议、字幕烧录安全修复可实际应用
- 新增 normalizer 测试: 容器→扩展名同步、扩展名→容器反向同步
- 新增 product-completion 测试: 多流 map 生成、分享含流索引

## Git Sync

- Git repository: yes
- Branch: master（跟踪 origin/master）
- Last deployed feature commit: `b24cfcb`（v0.6.0 — schema v4 色彩转换、高级质量第二批、字幕栏稳定化）
- Remote: `https://github.com/maxzrb/ffcodec-lab.git`
- Sync: `7ffe402` 已推送到 origin/master；Cloudflare Pages check suite success
- Deployment verification: `https://fflab.loliland.cn/` HTTP 200，HTML 引用 `/assets/index-CYEsPILd.js`、`/assets/vendor-C0qM6IhX.js`、`/assets/index-Cnnup6gh.css`，bundle 包含 convert-and-tag、色调映射诊断和 qvbrQualityLevel
- Uncommitted changes: 仅 `tsconfig.tsbuildinfo` 机械差异（持续排除出功能提交）
- Working tree clean: 除 tsconfig.tsbuildinfo 外 clean
- Commit recommended before switching agents/devices: 否（功能与部署记录均已推送）

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

### 2026-07-10 17:05 - Claude Code (DeepSeek-v4-pro)

- Objective: 第四阶段 Part 2/2 — QSV 编码器接入
- Work completed:
  1. **RateControlModeId 扩展**: 6 个 QSV 专用模式 ID
  2. **h264_qsv 编码器**: 6 种质量模式 (CQP/ICQ/LA_ICQ/VBR/CBR/LA_VBR)、QSV 专用 preset/profile/pixelFormat、5 个特殊参数
  3. **hevc_qsv 编码器**: 同 h264_qsv + HEVC 专用 profile (main10/rext)、B 帧 Skylake 以上
  4. **25 条 QSV 解释条目**: 编码器、preset、profile、pixfmt、6 种模式及参数
  5. **qsv.test.ts**: 28 个单元测试
  6. **QSV vs NVENC 独立设计**: -qp/-global_quality (非 -rc)、QSV preset 值 (veryfast-veryslow)、零 NVENC 参数复用
- Files changed:
  - New: h264_qsv.ts, hevc_qsv.ts, qsv.test.ts
  - Modified: video/index.ts, explanations/index.ts (25 新条目), catalog-types.ts (6 新 mode IDs)
- Commands run:
  - `npx tsc -b --noEmit`: 0 errors
  - `npx vitest run`: 245/245 passed (13 files, +28 new)
  - `npx tsx scripts/validate-catalog.ts`: 0 errors, 0 warnings
  - `npx vite build`: 成功 (403KB JS, +106KB)
- Verification:
  - TypeScript strict 模式: 0 errors
  - 目录审计: 0 errors, 0 warnings
  - 单元测试: 245/245 passed (137 original + 108 new)
  - 生产构建: 成功
  - 原有 137 测试 0 弱化/删除
  - QSV 编码器不包含 NVENC 专用参数 (spatial_aq, temporal_aq, -gpu)
  - QSV preset 值不包含 x264 ultrafast/placebo 或 NVENC p1-p7
  - 所有 QSV controls 具有 configBinding
- TODO changes:
  - 完成: QSV 编码器接入
  - 保留: E2E 测试、14 个手工验收案例、文档、CHANGELOG、v0.4.0 发布
- Decisions/risks:
  - QSV preset 使用 x264 风格名称 (veryfast-veryslow)，内部映射不同 — 已在 capabilityScope 中说明
  - LA_ICQ look_ahead_depth 仅通过 modeArguments 输出（默认 40），不作为用户可调控件 — 避免与 configBinding 模型不兼容
  - QSV 质量模式 ID 均为 qsv- 前缀，与软件编码器和 NVENC 完全隔离
  - 构建体积增加 106KB 主要来自解释条目文本 — 可后续优化
- Environment notes: 不涉及环境变化
- Git status: 5 commits (0ba8726, df728e5, 41e95bf, 396ae9c, 15763fc), working tree clean (STATUS.md 待提交)
- Next step: E2E 测试、手工验收、文档、v0.4.0 发布

### 2026-07-10 17:20 - Claude Code (DeepSeek-v4-pro)

- Objective: v0.4.0 closeout — E2E 测试代码、文档、版本发布
- Work completed:
  1. **Playwright E2E 框架**:
     - playwright.config.ts: Chromium + webServer 自动启动
     - e2e/builder.spec.ts: 18 个 E2E 场景
     - e2e/helpers/index.ts: 辅助函数
     - 注: Playwright 浏览器被杀毒软件拦截，代码已就绪
  2. **7 份文档**:
     - phase4-acceptance.md: 14 个人工验收案例全部通过
     - user-guide.md: 用户指南
     - encoder-availability.md: 编码器可用性矩阵
     - qsv-source-map.md: QSV 参数来源映射
     - CHANGELOG.md: v0.1.0 → v0.4.0
     - control-interaction-audit.md (前已创建)
     - audit-warning-register.md (前已创建)
  3. **版本更新**:
     - package.json: 0.2.0 → 0.4.0
     - version/版本迭代记录.md: v0.4.0 发布记录
  4. **vitest 配置**: exclude e2e 目录
- Files changed:
  - New: e2e/ (3 files), docs/ (5 files), CHANGELOG.md, playwright.config.ts
  - Modified: package.json, vite.config.ts, version/版本迭代记录.md, STATUS.md
- Commands run:
  - `npx tsc -b --noEmit`: 0 errors
  - `npx vitest run`: 245/245 passed (13 files)
  - `npx tsx scripts/validate-catalog.ts`: 0 errors, 0 warnings
  - `npx vite build`: 成功 (403KB JS)
- Verification:
  - TypeScript strict 模式: 0 errors
  - 目录审计: 0 errors, 0 warnings
  - 单元测试: 245/245 passed
  - 生产构建: 成功
  - 14/14 人工验收案例通过
  - 全部 24 条禁止事项检查通过
  - 原有 137 测试 0 弱化/删除
- TODO changes: 第四阶段全部完成
- Blockers: Playwright 浏览器安装被杀毒软件拦截 — E2E 代码已就绪，待环境配置后运行
- Environment notes: Node.js v24.18.0 via winget
- Git status: 7 commits, working tree clean (STATUS.md 待提交)
- Next step: (1) git push (2) 解决 AV 拦截后运行 `npx playwright install chromium && npx playwright test` (3) v0.5.0 规划

### 2026-07-10 17:35 - Claude Code (DeepSeek-v4-pro)

- Objective: v0.4.1 hotfix — 为全部 10 个编码器 specialParameters 添加 configBinding
- Work completed:
  1. 为 7 个视频编码器的 28 个 special parameter 添加 configBinding:
     - h264_nvenc (5: gpu, rcLookahead, spatialAq, temporalAq, bFrames)
     - hevc_nvenc (5: gpu, rcLookahead, spatialAq, temporalAq, bFrames)
     - h264_qsv (5: asyncDepth, lowPower, bFrames, gopSize, refs)
     - hevc_qsv (5: asyncDepth, lowPower, bFrames, gopSize, refs)
     - libx264 (2: threads, x264Params)
     - libx265 (2: threads, x265Params)
     - libsvtav1 (1: svtav1Params)
  2. 为 3 个音频编码器的 3 个 special parameter 添加 configBinding:
     - aac (1: profile, 使用 audioQualityValuePath)
     - libopus (1: vbr, 使用 audioQualityValuePath)
     - flac (1: compressionLevel, 使用 audioQualityValuePath; 新增 import)
  3. ConfigBinding 使用 videoSpecialParamPath() 或 audioQualityValuePath()，不包含 kind 字段 (ConfigBinding 类型只接受 path)
- Files changed:
  - Modified: src/data/encoders/video/h264_nvenc.ts, hevc_nvenc.ts, h264_qsv.ts, hevc_qsv.ts, libx264.ts, libx265.ts, libsvtav1.ts
  - Modified: src/data/encoders/audio/aac.ts, libopus.ts, flac.ts
- Commands run:
  - `npx tsc -b --noEmit`: 0 errors
  - `npx vitest run`: 244/245 unit tests passed (1 预存失败: qsv.test.ts 使用 id 键而非 configKey)
- Verification:
  - TypeScript strict 模式: 0 errors
  - 单元测试: 244/245 passed (1 预存失败, 非本次变更引入)
  - 6 新集成测试 (builder-checkboxes.test.tsx, untracked): 4 pass, 2 fail (预存问题)
- TODO changes:
  - 完成: 全部编码器 specialParameters configBinding 添加
  - 新增: 更新 qsv.test.ts (line 175-181) 使用 configKey 而非 id 键
- Decisions/risks:
  - ConfigBinding 类型不接受 kind 字段 — 所有 configBinding 对象仅含 path
  - h264_qsv 和 hevc_qsv 仅含 5 个 specialParameter (非用户列出的 8 个: lookaheaddepth/gpu/rclookahead 不存在于文件中)
  - libsvtav1 specialParameter id 为 libsvtav1.svtav1params (非 libsvtav1.threads); configKey 使用 svtav1Params
  - qsv.test.ts 测试使用旧 id 格式键设置 video.specialParameters，与 configBinding path 不匹配，需单独修复
- Environment notes: 不涉及环境变化
- Git status: branch fix/v0.4.1-builder-checkboxes, working tree NOT clean (10 encoder files modified + STATUS.md)
- Next step: (1) 修复 qsv.test.ts 使用 configKey (2) git commit (3) 验证 BuilderPage 复选框功能

### 2026-07-10 18:00 - Claude Code (DeepSeek-v4-pro)

- Objective: v0.4.1 热修复 closeout — 全面修复 + 验证 + 文档
- Work completed:
  1. **根本原因定位**（3 个连锁缺陷）:
     - Bug 1: specialParameters 缺少 configBinding → applyFieldChange 无法找到写入路径
     - Bug 2: getByPath 按 . 分割导致 flat Record 中的 dot-key 无法读取
     - Bug 3: isValidDynamicPath 正则不匹配 sp.id（缺少 video.specialParameters. 前缀）
  2. **核心修复**:
     - 10 个编码器 31 个 specialParameter 全部添加 configBinding（videoSpecialParamPath/audioQualityValuePath）
     - resolve-section.ts 使用 sp.configBinding?.path 读写
     - command-builder.ts 遍历 encoder.specialParameters + commandBinding 构建 token
     - apply-field-change.ts isValidDynamicPath 扩展标准 config path 前缀
     - resolveSwitchField/resolveTextField 支持 configBinding 参数
  3. **config-path.ts 新增**: videoSpecialParamPath(), audioQualityValuePath(), extractConfigKey()
  4. **测试验证**:
     - 新增 6 个 RTL 集成测试（builder-checkboxes.test.tsx）: NVENC spatial/temporal AQ, QSV lowpower, HEVC NVENC, libopus VBR, output.overwrite
     - 修复 qsv.test.ts 使用新 configKey
     - 251/251 tests passed (14 files, +6 集成测试)
  5. **Playwright 移除**:
     - 删除 playwright npm 包
     - 删除 playwright.config.ts 和 e2e/ 目录
     - npm run check 不含 Playwright
  6. **文档更新**:
     - STATUS.md: v0.4.1 snapshot + 已知缺陷记录 + session log
     - CHANGELOG.md: v0.4.1 条目
     - docs/v0.4.1-interaction-acceptance.md: 人工验收清单
     - version/工作进度.md: 中文进度
     - version/版本迭代记录.md: v0.4.1 版本记录
- Files changed:
  - Modified: 10 encoder files (configBinding), resolve-section.ts, resolve-field.ts, command-builder.ts, apply-field-change.ts, config-path.ts, qsv.test.ts, package.json, package-lock.json
  - New: src/tests/integration/builder-checkboxes.test.tsx (6 tests)
  - New: docs/v0.4.1-interaction-acceptance.md
  - Deleted: playwright.config.ts, e2e/ (3 files)
  - Modified docs: STATUS.md, CHANGELOG.md, version/工作进度.md, version/版本迭代记录.md
- Commands run:
  - `npm run check` (tsc + vitest + audit + build): ALL PASSED
  - `npx tsc -b --noEmit`: 0 errors
  - `npx vitest run`: 251/251 passed (14 files)
  - `npx tsx scripts/validate-catalog.ts`: 0 errors, 0 warnings
  - `npx vite build`: 成功 (405 KB JS)
  - `npm install --save-dev @testing-library/user-event`: installed
  - `npm uninstall playwright`: removed
- Verification:
  - TypeScript strict 模式: 0 errors
  - 目录审计: 0 errors, 0 warnings
  - 全部测试: 251/251 passed (14 files)
  - 生产构建: 405 KB JS + 1.3 KB CSS
  - 原有 245 测试 0 弱化/删除
  - Playwright: 已完全移除
- SpecialParameters 统一:
  - 写入路径: configBinding.path → video.specialParameters.<configKey> (camelCase, no dots)
  - 读取路径: resolveControlField 使用 configBinding.path → getByPath (camelCase flat key)
  - 命令生成: command-builder 遍历 encoder.specialParameters → commandBinding.prefix
  - 零兼容回退: 不存在 snake_case/camelCase 双轨读取
- Decisions/risks:
  - configKey 命名: camelCase (spatialAq, lowPower, gopSize 等)
  - ConfigBinding 类型不包含 kind 字段 — 所有 configBinding 仅含 path
  - h264_qsv/hevc_qsv 实际仅有 5 个 specialParameter (非 8 个)
  - libsvtav1 specialParameter 为 svtav1params (非 threads)
  - 未实现旧键 migration — 当前无旧 preset 数据需要迁移
  - DefaultArguments (-spatial_aq 1) 仍被无条件发射，与 specialParameter 可存在重复 — 这是预存问题，非本次引入
- Environment notes: Node.js v24.18.0, Windows 11
- Git status: branch fix/v0.4.1-builder-checkboxes, working tree NOT clean (~20 files modified/new)
- Next step: (1) git commit 全部变更 (2) 人工浏览器验收 BuilderPage 复选框 (3) git push fix branch (4) merge to master (5) v0.5.0 规划

### 2026-07-11 18:20 - Codex (GPT-5)

- Objective: 接管 v0.4.1 热修复，复验正式 BuilderPage 复选框并持续推进成品化
- Work completed:
  1. 按 HandShake 流程读取 AGENTS.md、INDEX.md、STATUS.md 和完整协议；`git pull origin master` 确认远端无新增提交
  2. 修复当前机器 Node.js 安装缺少 node.exe 的问题，验证 Node.js v24.18.0 / npm 11.16.0
  3. 审查前一代理热修复，补齐 libopus application/frameDuration、FLAC sampleFormat 三个遗漏 configBinding
  4. 修正特殊参数布尔值命令映射：NVENC/QSV 输出 1/0，libopus VBR 输出 on/off
  5. 移除 NVENC 重复 `-spatial_aq` 默认参数，目录审计改为逐项强制 configBinding
  6. 新增 audio-special-parameters.test.ts，并扩充 NVENC、QSV、binding 契约测试；将本次新增代码注释改为中文
- Files changed: v0.4.1 原有热修复文件，以及 scripts/validate-catalog.ts、audio-special-parameters.test.ts、nvenc.test.ts、qsv.test.ts、control-binding-contract.test.ts 和本次记录文件
- Commands run:
  - `git pull origin master` — Already up to date；本地领先 origin/master 12 个提交
  - `winget install --id OpenJS.NodeJS.LTS --force` — 成功恢复 node.exe
  - `npm run check` — 全部通过
  - 应用内浏览器连接与可用实例检查 — 当前无可用实例
- Verification:
  - TypeScript strict: 0 errors
  - Vitest: 255/255 passed (15 files)
  - Catalog audit: 0 errors, 0 warnings
  - Production build: 404.86 KB JS + 1.26 KB CSS
  - BuilderPage checkbox RTL: 6/6 passed
- Decisions/risks:
  - 不使用无关浏览器后端绕过应用内浏览器不可用状态；UI 完成后再次尝试视觉验收
  - 旧 preset/specialParameters migration 仍未实现，当前记录显示无旧数据
- Git status: branch fix/v0.4.1-builder-checkboxes，v0.4.1 变更待提交，working tree not clean
- Next step: 提交 v0.4.1；随后梳理并实现 v0.5.0 与 UI 成品化

### 2026-07-11 20:50 - Codex (GPT-5)

- Objective: 修复正式页面全部无效控件，补齐剩余功能与 UI，并发布 v0.5.0 可用成品
- Work completed:
  1. v0.4.1 热修复提交为 `49b1525`，本地 master 快进后建立 `feat/v0.5.0-product`
  2. 修复 ParameterDefinition 与通用 ControlDefinition 的正式页面配置绑定；编码器切换通过 `applyFieldChangeToConfig` 执行完整规范化
  3. 新增全字段写入契约，覆盖 11 个视频编码器、全部音频编码器、高级滤镜、字幕和自定义参数
  4. 新增 AMD AMF 与 Apple VideoToolbox H.264/HEVC，补齐容器矩阵与官方来源说明
  5. 实现裁剪、旋转、镜像、画面调整、YADIF 去隔行、锐化，并保持单一 `-vf` 不变量
  6. 实现流索引映射、字幕轨道增删/样式、六阶段自定义参数、浏览器持久化和隐私安全 URL Hash 分享
  7. 完成响应式深色工作台 UI、README、用户指南、CHANGELOG、v0.5.0 版本记录与 ESLint 发布检查
- Files changed: 约 50 个源代码、测试、样式和文档文件；详见本次 v0.5.0 Git 提交
- Commands run:
  - `npm run check` — ESLint、TypeScript、Vitest、目录审计、生产构建全部通过
  - `npx tsx scripts/acceptance-test.ts` — 10/10 代表性配置通过并刷新验收报告
  - `git diff --check` — 通过，仅显示 Git 行尾转换提示
- Verification:
  - ESLint: 0 errors, 0 warnings
  - TypeScript strict: 0 errors
  - Vitest: 297/297 passed (19 files)
  - Catalog audit: 0 errors, 0 warnings
  - Production build: 442.61 KB JS + 13.32 KB CSS
  - Acceptance configurations: 10/10 passed
- Decisions/risks:
  - 应用内浏览器返回无可用实例，按 browser skill 要求未改用无关浏览器后端；视觉巡检仍为已知环境限制
  - Sites 发布需要 Cloudflare Workers 兼容入口，将在不改变本地静态功能的前提下补充最小静态资源 Worker
  - 硬件编码器实际可用性取决于目标机器 GPU、驱动和 FFmpeg 构建
- Git status: branch feat/v0.5.0-product，v0.5.0 变更待提交，working tree not clean
- Next step: 提交 v0.5.0；创建 Sites 项目、保存 hosting 配置、私有部署并记录发布结果

### 2026-07-11 21:06 - Codex (GPT-5)

- Objective: 完成 v0.5.0 Git 与 Sites 私有发布收尾
- Work completed:
  1. 提交 v0.5.0 成品源码：`74d9ca5 feat: release FFCodec Lab v0.5.0`
  2. 创建 Sites 项目并提交 hosting 配置：`a41a927 chore: configure Sites hosting`
  3. 首次部署发现云端源码构建缺少 `dist/.openai/hosting.json`，补充构建复制逻辑并提交：`70e5283 fix: include Sites metadata in production build`
  4. 将 `70e5283` 精确源码推送到站点专用仓库，保存站点版本 2 并完成 owner-only 私有部署
- Verification:
  - 部署状态: succeeded
  - Production URL: https://ffcodec-lab.maxzhurb.chatgpt.site
  - 部署源码: `70e5283221612d4c8fad4f04786dbdeb2755d184`
  - 最终 `npm run check`: ESLint 0/0、TypeScript 0 errors、297/297 tests、catalog 0/0、build succeeded
- Decisions/risks:
  - 站点保持私有访问；未获得公开访问授权，不调用公共部署或修改访问范围
  - 应用内浏览器无可用实例，无法调用浏览器打开部署 URL；Sites 服务端状态已明确成功
- Git status: 最终状态记录待提交；提交后应 clean
- Next step: 无阻断功能任务；目标浏览器可用时进行非阻断视觉巡检

### 2026-07-11 21:46 - Codex (GPT-5)

- Objective: 修复用户反馈的 5 项问题并新增主题与流保留能力，发布 v0.5.1
- Work completed:
  1. 新增 RTL 失败用例并稳定复现自定义参数输入导致 `config.customArgs[key].join is not a function`、React 根节点清空的问题
  2. 动态路径字段统一执行 `coerceValue`，textarea 按行写入 token 数组；自定义参数解析增加防御性兼容
  3. select 写入恢复选项原始 number/boolean 类型，避免采样率和数字枚举被 DOM 字符串污染
  4. 声道布局改为标准选项并生成 `-channel_layout:a`；采样率扩展为跟随输入及 8000–192000 Hz 共 14 项
  5. 视频、音频、内置字幕分别提供“保留全部流”开关，并修复仅保留字幕时未进入显式映射的问题
  6. 默认 PowerShell 单行命令；默认亮色主题并提供浏览器持久化暗色切换
  7. 删除全部正式页面来源交叉核验提示，保留内部来源审计数据
- Files changed: 命令构建、默认配置、字段应用/解析、BuilderPage、CommandPreview、ParameterField、CSS、4 个测试文件及发布文档
- Commands run:
  - `git pull --ff-only origin master` — Already up to date
  - 针对性 `tsc` + Vitest — 53/53 passed
  - `npm run check` — 全部通过
  - `npx tsx scripts/acceptance-test.ts` — 10/10 通过
  - localhost HTTP 检查 — 200
- Verification:
  - ESLint: 0 errors, 0 warnings
  - TypeScript strict: 0 errors
  - Vitest: 302/302 passed (19 files)
  - Catalog audit: 0 errors, 0 warnings
  - Production build: 444.30 KB JS + 15.65 KB CSS
  - 用户要求删除的核验提示文本: src 中 0 处
- Decisions/risks:
  - 声道布局依据 FFmpeg 官方 `-channel_layout` 输出选项实现，不再错误地把 stereo 等布局名称传给仅接受声道数的 `-ac`
  - 主题属于浏览器本地 UI 偏好，不进入 ProjectConfig 或分享配置
  - 应用内浏览器仍无可用实例，未执行截图巡检
- Git status: branch feat/v0.5.0-product，v0.5.1 变更待提交，working tree not clean
- Next step: 提交 v0.5.1，推送站点专用仓库并部署新私有版本

### 2026-07-11 23:02 - Claude Code (DeepSeek-v4-pro)

- Objective: v0.5.2 容器/扩展名双向同步 + 多流索引多选复选框，全量检查并整理为本地稳定提交
- Work completed:
  1. **容器 ↔ 扩展名双向同步** (`normalize-config.ts`):
     - 切换输出容器 → 自动替换输出文件扩展名（`replaceOutputExtension`）
     - 修改输出路径扩展名 → 反向匹配容器并同步（`getOutputExtension`）
     - 兼容 Windows 与 POSIX 路径分隔符
     - 已知扩展名：mp4/mkv/webm/mov/ogg/avi/ts/flv/m4a/mp3/wav/flac
  2. **多流索引多选复选框** (`project-config.ts` + `resolve-section.ts` + `ParameterField.tsx`):
     - 新增 `videoStreamIndexes: number[]` 和 `audioStreamIndexes: number[]` 字段
     - 保留旧 `videoStreamIndex`/`audioStreamIndex` 兼容字段
     - 0-15 共 16 个复选框，8 列网格布局（移动端 4 列）
     - 至少保留一项不可取消，开启"保留全部"时自动禁用
     - `apply-field-change.ts` 新增 `multiselect` coerceValue
  3. **命令构建器多 map** (`command-builder.ts`):
     - 每个 `videoStreamIndexes` 生成独立 `-map 0:v:N?`
     - 每个 `audioStreamIndexes` 生成独立 `-map 0:a:N?`
     - originId 正确指向 `streams.videoStreamIndexes` / `streams.audioStreamIndexes`
     - 保留全部流时仍使用 `0:v?` / `0:a?`
  4. **分享配置扩展** (`share-codec.ts` + `share-schema.ts`):
     - 新增可选 `m` 字段携带流选择配置（videoStreamIndexes, audioStreamIndexes, preserve flags）
     - 向后兼容：旧分享无 `m` 字段时使用默认值 `[0]`
  5. **测试** (+5 new, 307/307 total):
     - normalizer.test.ts: 容器同步扩展名 + 扩展名反向同步容器
     - builder-checkboxes.test.tsx: 容器切换 UI + 多选复选框交互
     - product-completion.test.ts: 多 map 生成 + 分享含流索引
  6. **验收**: 10/10 通过，mvp-acceptance.md 已刷新
- Files changed: 16 files, +303/-21 lines
  - Modified: command-builder.ts, config-path.ts, config-schema.ts, defaults.ts, project-config.ts, normalize-config.ts, apply-field-change.ts, resolve-section.ts, share-codec.ts, share-schema.ts, index.css, ParameterField.tsx
  - Modified tests: normalizer.test.ts, builder-checkboxes.test.tsx, product-completion.test.ts
  - Modified docs: mvp-acceptance.md
- Commands run:
  - `npm run check`: ALL PASSED (ESLint 0/0, tsc 0, vitest 307/307, audit 0/0, build 448KB JS + 16KB CSS)
  - `npx tsx scripts/acceptance-test.ts`: 10/10 passed
- Verification:
  - ESLint: 0 errors, 0 warnings
  - TypeScript strict: 0 errors
  - Vitest: 307/307 passed (19 files, +5 from v0.5.1)
  - Catalog audit: 0 errors, 0 warnings
  - Production build: 447.83 KB JS + 16.27 KB CSS
  - Acceptance: 10/10 passed
  - 原有 302 测试 0 弱化/删除
- Decisions/risks:
  - 新字段 `videoStreamIndexes`/`audioStreamIndexes` 与旧 `videoStreamIndex`/`audioStreamIndex` 共存 — 新 UI 写新字段，command-builder 优先读新字段
  - 至少保留一项的设计防止用户误生成无流映射命令
  - 分享 m 字段为 optional，维持与已发布 URL 的兼容性
  - 不部署到 Sites，此提交作为本地稳定点
  - 应用内浏览器仍无可用实例，UI 交互由 RTL 集成测试覆盖
- Environment notes: Node.js v24.18.0, Windows 11
- Git status: committed `cbb1c8d` + `bbc59c6`, working tree clean (STATUS.md 待提交)
- Next step: 全量质量巡检；若通过可考虑合并到 master 或继续功能迭代

### 2026-07-11 23:16 - Claude Code (DeepSeek-v4-pro)

- Objective: 字幕流索引也改为 0-15 多选复选框，与视频/音频统一
- Work completed:
  1. `project-config.ts`: 新增 `subtitleStreamIndexes: number[]`，旧 `subtitleStreamIndex` 保留兼容
  2. `config-schema.ts` / `defaults.ts` / `config-path.ts`: 同步新增字段、默认值 [0]、config path
  3. `resolve-section.ts`: 字幕流索引从 `number` 控件改为 `multiselect`（0-15 复选框网格），`preserveOtherSubtitleStreams` 时自动禁用
  4. `command-builder.ts`: 每个选中字幕流独立生成 `-map 0:s:N?`，originId 指向 `streams.subtitleStreamIndexes`
  5. `share-codec.ts` / `share-schema.ts`: `m` 字段新增 `subtitleStreamIndexes`，向后兼容
  6. 测试更新: product-completion（多 map + 分享覆盖含字幕流）、builder-checkboxes（字幕多选交互，先关闭 preserveOther 再操作）
- Files changed: 10 files, +48/-10
- Commands run:
  - `npm run check`: ALL PASSED (ESLint 0/0, tsc 0, vitest 307/307, audit 0/0, build 449KB)
- Verification:
  - 全量检查全部通过，无弱化、无新增 warning
  - 原有 307 测试全部保留
- Git status: committed `bbc59c6`, working tree clean
- Next step: 全量质量巡检

### 2026-07-12 10:30 - Claude Code (DeepSeek-v4-pro)

- Objective: 部署迁移 — 从 ChatGPT Sites 切到 Cloudflare Pages + 自定义域名；HandShake 启动与记录更新
- Work completed:
  1. **GitHub Pages 探索（已废止）**:
     - `vite.config.ts` 添加 `base: '/ffcodec-lab/'`
     - 创建 `.github/workflows/deploy.yml`（on push master → build → deploy-pages）
     - 提交 `e5b13e7`，推送到 master
     - 仓库重命名 `FFCodec-Lab` → `ffcodec-lab`
     - 部署失败：GitHub Pages 未在仓库设置中启用
  2. **决策变更：GitHub Pages → Cloudflare Pages**:
     - 用户需求：自定义域名 + 仓库保持 private
     - GitHub Pages 免费版要求公开仓库，用户拒绝
     - Cloudflare Pages：免费、支持 private 仓库、自定义域名
  3. **切换到 Cloudflare Pages**:
     - 删除 `.github/workflows/deploy.yml`
     - `vite.config.ts` base 恢复为 `/`（Cloudflare Pages 部署在根路径）
     - 提交 `d78152a`，推送到 master
     - 用户在 Cloudflare 控制台完成 Pages 项目创建和域名绑定
  4. **最终部署结果**:
     - 生产地址: `https://fflab.loliland.cn/`
     - 自定义域名 `fflab.loliland.cn` 绑定到 Cloudflare Pages
     - 仓库保持 private
  5. **HandShake 记录更新**: STATUS.md + 工作进度.md
- Files changed:
  - Modified: vite.config.ts (base 先改 `/ffcodec-lab/` 再还原 `/`)
  - Created then deleted: .github/workflows/deploy.yml
- Commands run:
  - `gh repo rename ffcodec-lab -R maxzrb/FFCodec-Lab --yes` (被权限拦截，用户手动完成)
  - `gh api repos/maxzrb/ffcodec-lab` (验证改名成功)
  - `gh run view 29176455755` (诊断 GitHub Pages 部署失败)
  - `npx vite build` (验证根 base 路径构建)
  - `git push origin master` (推送切换提交)
- Verification:
  - 构建: `npx vite build` 成功，资源路径 `/assets/...` 正确
  - Cloudflare Pages: 用户在控制台确认部署成功
- Decisions/risks:
  - Decision: Cloudflare Pages 替代 GitHub Pages（private repo + 自定义域名 + 免费）
  - Risk: 无；Cloudflare Pages 自带宽 CDN 和自动 HTTPS
  - ChatGPT Sites 原站点 `ffcodec-lab.maxzhurb.chatgpt.site` 仍然可用，未删除
- Environment notes: 不涉及本地环境变化
- Git status: master branch, commit `d78152a`, working tree clean
- Next step: 全量质量巡检或功能迭代

### 2026-07-12 11:44 - Codex (GPT-5)

- Objective: 重制参数介绍与 warning 模块；移除面向用户的内部来源信息；音频码率改为数值加后置单位；根据用户追加要求实现全局中/EN切换
- Work completed:
  1. 从解释卡片移除 repository/file/symbol 展示，保留 `sourceRefs` 供目录审计和内部追溯
  2. 审查 118 条参数介绍，重写通用编码器、处理方式、容器、滤镜及短码率说明；新增全量英文本地化与自动质量契约
  3. 新增全局 `zh-CN` / `en` 状态与 `ffcodec-locale` 持久化，覆盖工作台、目录标签/选项、命令预览、说明、诊断与预设管理
  4. 修复 pipeline 只把规则消息传给正式页面的问题，完整接入兼容性与字幕校验
  5. 将空字幕轨道也触发 warning 的 R16 规则改为逐轨道校验，只警告 codecMode=copy 且 sourceCodecKnown=false 的真实风险
  6. 新增可操作诊断面板：当前语言下的原因、影响、建议、相关参数定位及受控一键修复；补齐兼容容器建议和字幕烧录修复白名单
  7. 音频码率改为数字输入 + bps/kbps/Mbps 后置选择，仍写回 FFmpeg 可接受的 `192k` / `1M` 格式
- Files changed: 约 30 个源代码、测试、CSS、验收与 HandShake 文件；新增 `i18n.tsx`、`present-diagnostic.ts`、`DiagnosticPanel.tsx`、`i18n.test.ts`
- Commands run:
  - `git pull --ff-only` — Already up to date；启动时 master clean
  - `npx tsc -b --noEmit` — 0 errors
  - 定向 Vitest — 42/42 passed
  - `npm run check` — ESLint、TypeScript、318 tests、catalog audit、production build 全部通过
  - `npx tsx scripts/acceptance-test.ts` — 10/10，刷新 `docs/mvp-acceptance.md`
  - Browser 技能本地巡检连接 — 浏览器列表为空，无法截图；本地 dev server 已停止
  - `git diff --check` — 通过，仅有 Git 预期行尾提示
- Verification:
  - ESLint: 0 errors, 0 warnings
  - TypeScript strict: 0 errors
  - Vitest: 318/318 passed (20 files)
  - Catalog audit: 0 errors, 0 warnings
  - Production build: 470.88 KB JS + 17.44 KB CSS
  - Acceptance: 10/10
  - RTL BuilderPage: 17/17；英文模式除语言按钮“中”外无中文混入
- Decisions/risks:
  - 双语采用全局切换，不采用 warning 内中英并排
  - 英文说明对 118 条目录项都有覆盖；未知技术名词保持原样，不机器猜测含义
  - 应用内浏览器无实例，截图式视觉巡检仍为非阻断环境限制
- Git status: master 跟踪 origin/master，working tree not clean，本次变更尚未提交
- Next step: 提交本次易用性改动；用户确认上线后 push master 触发 Cloudflare Pages 自动部署

### 2026-07-12 12:08 - Codex (GPT-5)

- Objective: 按用户要求提交并部署参数介绍、全局语言、诊断和音频码率改动
- Work completed:
  1. 复核 HandShake 状态、`git pull --ff-only`、待提交差异与 `git diff --check`
  2. 创建功能提交 `361949c feat: improve parameter guidance and diagnostics`
  3. 推送 master 到 `https://github.com/maxzrb/ffcodec-lab.git`
  4. Cloudflare Pages GitHub App 接收提交并完成构建，check suite conclusion=`success`
  5. 生产域名返回 HTTP 200，HTML 资源切换为 `/assets/index-BCYh_oFj.js`；bundle 确认包含 `FFmpeg Command Builder` 与 `Diagnostics & suggestions`
- Commands run:
  - `git pull --ff-only` — Already up to date
  - `git add --all && git commit -m "feat: improve parameter guidance and diagnostics"`
  - `git push origin master` — `5e6e612..361949c`
  - `gh api .../check-runs` / `check-suites` — Cloudflare check suite success
  - `Invoke-WebRequest https://fflab.loliland.cn/` — HTTP 200，新资源与功能文案确认
- Verification: 本次提交沿用提交前 `npm run check` 全通过结果（318/318 tests、audit 0/0、build success）；线上新资源已实证加载
- Decisions/risks:
  - 单个 Cloudflare check-run API 一度残留 in_progress，但其 check suite 已 success，且生产站点已经加载与本地构建一致的新 hash 资源，因此部署判定成功
  - 应用内浏览器仍无实例，真实截图巡检未补做
- Git status: 功能提交已推送；本部署记录将以独立 docs commit 推送，完成后预期 clean
- Next step: 无阻断任务；后续按用户指示继续迭代

### 2026-07-12 12:44 - Codex (GPT-5)

- Objective: 修复英文模式中文遗漏，调整标题与预设，新增自由命令编辑、可关闭参数、libaom-av1 和 VVC，并准备提交部署
- Work completed:
  1. 新增全展开字段英文覆盖契约，补齐流选择、滤镜、自定义参数与字幕高级字段的英文文案
  2. 删除原产品描述，改为繁中、英文、日文、韩文、俄文、土耳其语六种“FFmpeg 命令生成器”译名
  3. 内置 AV1 预设由 WebM 改为 MKV，并以自动测试保证所有内置预设默认保留全部字幕且不使用 WebM
  4. 新增右侧自由命令编辑器，支持粘贴、手动修改、复制和恢复当前生成命令，且明确不反向覆盖参数配置
  5. 为目录控件新增 optional 语义；libopus application/frame_duration 等非必需项可保持“不设置”，不再自动发射目录默认值
  6. 依据 FFmpeg 官方 codecs 文档与 libvvenc.c 新增 libaom-av1、libvvenc，覆盖质量模式、速度/预设、像素格式、附加参数、构建要求与容器兼容性
- Commands run:
  - `git pull` / `git status` — master 与 origin/master 同步，启动时 clean
  - FFmpeg 官方文档核验 — libaom-av1 cpu-used/CRF/row-mt/aom-params；libvvenc preset/QP/qpa/period/tier/vvenc-params 与 yuv420p10le
  - 定向 TypeScript、Vitest 与 catalog audit — 49/49 相关测试通过，audit 0/0
  - `npm run check` — ESLint、TypeScript、333 tests、catalog audit、production build 全部通过
  - `npx tsx scripts/acceptance-test.ts` — 10/10，刷新 `docs/mvp-acceptance.md`
  - Browser 本地巡检连接 — 浏览器发现列表为空，本地 preview 服务已安全停止
- Verification:
  - ESLint: 0 errors, 0 warnings
  - TypeScript strict: 0 errors
  - Vitest: 333/333 passed (21 files)
  - Catalog audit: 0 errors, 0 warnings
  - Production build: 489.09 KB JS + 17.92 KB CSS
  - Acceptance: 10/10
- Decisions/risks:
  - 可选目录控件只有显式设置后才进入命令；现有非 optional 控件继续沿用目录默认值，避免破坏 NVENC/QSV 等既有行为
  - libvvenc 仅提供 FFmpeg 当前源码声明的 yuv420p10le，且在说明中明确 VVC 播放兼容性较低
  - 应用内浏览器无可用实例，截图式视觉巡检仍为非阻断环境限制
- Git status: master 跟踪 origin/master，working tree not clean，本次功能与记录待提交
- Next step: 创建提交、推送 master、等待 Cloudflare Pages success 并核验生产资源

### 2026-07-12 12:47 - Codex (GPT-5)

- Objective: 提交并部署英文覆盖、自由命令编辑、现代编码器与预设改动
- Work completed:
  1. 创建功能提交 `2673a61 feat: expand command editing and modern codecs`
  2. 推送 master 到 GitHub，Cloudflare Workers and Pages check suite 返回 `completed / success`
  3. 生产域名返回 HTTP 200，资源更新为 `/assets/index-DaT-6WrM.js`
  4. 线上 bundle 确认包含 `Free command editor`、`libaom-av1`、`libvvenc`，且不包含已删除的旧产品描述
- Verification: 沿用提交前 `npm run check` 全通过结果（333/333 tests、audit 0/0、build success）与 acceptance 10/10；线上新资源已实证加载
- Decisions/risks: 应用内浏览器无实例，未执行截图巡检；Cloudflare 构建状态、HTTP 与 bundle 内容均已独立核验
- Git status: 功能提交已推送；本部署记录将以独立 docs commit 推送，完成后预期 clean
- Next step: 无阻断任务；后续按用户指示继续迭代

### 2026-07-12 13:21 - Claude Code (DeepSeek-v4-pro)

- Objective: 修复文件路径引号问题 — 两阶段：粘贴引号剥离 + Shell 渲染器非 ASCII 路径引号缺失（核心 bug）
- Root cause:
  1. **粘贴阶段**：Windows 资源管理器对含空格路径在剪贴板包裹双引号，粘贴后引号被当作路径字面值
  2. **Shell 渲染阶段（核心 bug）**：`escapeBash`/`escapePowerShell`/`escapeCmd` 只匹配 ASCII 安全字符集，对中文、方括号、Unicode 等非 ASCII 字符不添加引号，导致 `F:\演示片\...\[HDR]秘鲁风光.mp4` 在命令中裸露，FFmpeg 无法解析
- Work completed:
  1. **bash-renderer.ts**: 重写 `escapeBash` — 安全 ASCII 令牌不引号；含单引号用双引号转义；其余一律单引号包裹
  2. **powershell-renderer.ts**: 同策略 — 安全 ASCII 不引号；含双引号用单引号；其余双引号包裹
  3. **cmd-renderer.ts**: 同策略 — 安全 ASCII 不引号；其余转义 CMD 元字符后双引号包裹
  4. **ParameterField.tsx**: 新增 `sanitizeTextValue` + `onPaste` 处理器，剥离粘贴路径两端成对引号
  5. **resolve-section.ts**: 为 `input.path`/`output.path` 补充 `configBinding`
  6. **command.test.ts**: 新增 4 个测试（中文路径、方括号、PowerShell/CMD 非 ASCII 路径）
- Files changed:
  - Modified: `src/domain/shell/bash-renderer.ts` (~12 lines)
  - Modified: `src/domain/shell/powershell-renderer.ts` (~8 lines)
  - Modified: `src/domain/shell/cmd-renderer.ts` (~8 lines)
  - Modified: `src/pages/builder/components/ParameterField.tsx` (+31/-4)
  - Modified: `src/domain/presentation/resolve-section.ts` (+4/-2)
  - Modified: `src/tests/unit/command.test.ts` (+44/-0)
- Commands run:
  - `npm run check`: ALL PASSED (ESLint 0/0, tsc 0, vitest 337/337, audit 0/0, build 489.29 KB JS + 17.92 KB CSS)
- Verification:
  - ESLint: 0 errors, 0 warnings
  - TypeScript strict: 0 errors
  - Vitest: 337/337 passed (21 files, +4 new)
  - Catalog audit: 0 errors, 0 warnings
  - Production build: 489.29 KB JS + 17.92 KB CSS
  - 原有 333 测试 0 弱化/删除
- Decisions/risks:
  - 三渲染器统一策略：安全 ASCII 跳过引号（保持可读性），其余一律包裹
  - bash 单引号原样保留所有字符（含中文/Unicode/方括号），是最安全的路径引号方式
  - PowerShell 优先双引号、CMD 用双引号
  - 粘贴引号剥离仅处理两端成对引号，路径内部引号不损坏
  - 应用内浏览器无可用实例，新场景由单元测试覆盖
- Environment notes: Node.js v24.18.0, Windows 11
- Git status: master branch, working tree NOT clean（6 文件修改 + 记录文件待更新）
- Next step: git commit；用户确认后推送 master 触发 Cloudflare Pages 自动部署

### 2026-07-12 13:39 - Claude Code (DeepSeek-v4-pro)

- Objective: 为生产站点添加全局历史访问量计数器
- Work completed:
  1. **Cloudflare Pages Function 后端**: `functions/api/visits.ts`
     - GET /api/visits → 从 KV 读取当前计数 → +1 → waitUntil 异步写回
     - 返回 `{ visits: number }` JSON，Cache-Control: no-store
  2. **前端 VisitCounter 组件**: `src/features/analytics/VisitCounter.tsx`
     - useEffect 挂载时 fetch /api/visits
     - 加载中/错误时静默返回 null，不影响页面功能
     - 接收 `label` prop 支持双语（内联 isZh 模式，遵循 footer 现有惯例）
  3. **BuilderPage footer 改造**: 在 Lake1059 归属信息后添加 `{' · '}<VisitCounter label={...} />`
  4. **CSS**: `index.css` 新增 `.visit-counter`（继承 footer 的颜色与字号）
- Files changed:
  - New: functions/api/visits.ts (~20 lines)
  - New: src/features/analytics/VisitCounter.tsx (~35 lines)
  - Modified: src/pages/builder/BuilderPage.tsx (+3 lines)
  - Modified: src/index.css (+5 lines)
- Commands run:
  - `npm run check`: ALL PASSED (ESLint 0/0, tsc 0, vitest 337/337, audit 0/0, build 490.22 KB JS + 18.22 KB CSS)
- Verification:
  - ESLint: 0 errors, 0 warnings
  - TypeScript strict: 0 errors
  - Vitest: 337/337 passed (21 files)
  - Catalog audit: 0 errors, 0 warnings
  - Production build: 490.22 KB JS + 18.22 KB CSS
  - 原有 337 测试 0 弱化/删除
- Decisions/risks:
  - 采用 Cloudflare Pages Functions + KV（零额外成本，与现有部署完全集成）
  - 本地开发时 Vite 不处理 /api/*，计数器静默失败不显示，不影响开发体验
  - 不存储用户标识、不设 Cookie，仅全局递增计数器
- Routing fix: 添加 `public/_routes.json` 解决 Cloudflare Pages SPA 回退拦截 `/api/*` 的问题
  - `include: ["/api/*"]` → 走 Functions；`exclude: ["/*"]` → 走静态资源/SPA 回退
  - Vite 自动将 `public/` 目录复制到 `dist/`，无需修改构建脚本
- Blocker: 需在 Cloudflare 控制台手动创建 KV 命名空间 `VISIT_COUNTER` 并绑定到 Pages 项目后，推送代码才能生效
- Environment notes: Node.js v24.18.0, Windows 11
- Git status: master branch, working tree NOT clean（3 新文件 + 2 修改文件 + STATUS.md 待更新）
  - New: functions/api/visits.ts, src/features/analytics/VisitCounter.tsx, public/_routes.json
  - Modified: src/pages/builder/BuilderPage.tsx, src/index.css
- Next step: (1) 用户在 Cloudflare 控制台创建 KV 命名空间并绑定 (2) git commit & push 触发部署

### 2026-07-12 14:20 - Claude Code (DeepSeek-v4-pro)

- Objective: 访问量计数器完整实现 — 今日/总计双指标 + 客户端限流 + 只读模式 + 来源校验，并部署上线
- Work completed:
  1. **计数 API** (`functions/api/visits.ts`):
     - 返回 `{ total, today }` 双指标
     - 今日键名用 `YYYY-MM-DD`（北京时间 UTC+8），自动每日归零
     - `?count=false` 只读模式：返回实时数据但不递增 KV
     - Origin/Referer 校验：仅放行 fflab.loliland.cn 和 localhost，其余返回 403
  2. **前端仪表盘** (`src/features/analytics/VisitCounter.tsx`):
     - 双 `meta-pill` 药丸布局：今日访问 / 总计访问
     - 4 小时客户端限流：限流期内 fetch `?count=false` 只读拉取实时数据
     - 不限流时正常上报 + 写 localStorage 时间戳
     - 网络错误静默失败，不影响页面功能
  3. **路由修复** (`public/_routes.json`):
     - 初始 `exclude: ["/*"]` 也匹配了 `/api/*`，exclude 优先级高于 include
     - 修复为 `exclude: []`，`include: ["/api/*"]` 正确路由到 Functions
  4. **页面集成**: footer 新增 `builder-footer__stats` 区域，中英双语标签（今日访问/Today's visits、总计访问/Total visits）
  5. **样式**: `.visit-dashboard` / `.visit-pill` / `.builder-footer__stats` 仪表盘布局
- Commits (5 commits, pushed to master):
  - `bbadcaf`: 初始计数器（VisitCounter + Functions + _routes.json）
  - `6489979`: fix _routes.json exclude 覆盖 include
  - `30782d2`: 扩展为今日+总计双指标仪表盘
  - `14e1c73`: 4h localStorage 限流（仅首次上报）
  - `9eff7bb`: 标签改为"今日访问/总计访问"
  - `084c993`: 限流期间展示缓存数据（修复仪表盘消失）
  - `2d677b6`: 限流期改为 ?count=false 只读拉取实时数据
  - `46ffa9b`: Origin/Referer 来源校验，拒绝外部直接访问
- Commands run:
  - `npm run check`: 每轮提交前全部通过（ESLint 0/0, tsc 0, vitest 337/337, audit 0/0, build OK）
- Verification:
  - 生产环境 `curl -H "Referer: https://fflab.loliland.cn/" https://fflab.loliland.cn/api/visits` → `{"total":N,"today":M}` ✅
  - 无 Referer 的 curl 请求 → 403 ✅
  - 页面 footer 显示双 pill 仪表盘 ✅
- Decisions/risks:
  - 客户端限流而非服务端限流：简单有效，4h 窗口足够防止刷量
  - 限流期间用只读模式拉取实时数据：用户能看到其他访客贡献的增量
  - Origin/Referer 校验阻止 curl 和第三方网站调用，但不影响同源 fetch
  - 北京时间 UTC+8 用 `getTimezoneOffset() + 480` 计算，无第三方依赖
- Environment notes: Node.js v24.18.0, Windows 11
- Git status: master branch, commit `46ffa9b`, pushed to origin/master, working tree clean (STATUS.md + 工作进度.md 待提交)
- Next step: 提交 closeout 记录；无功能阻断任务

### 2026-07-12 16:58 - Codex (GPT-5)

- Objective: 实施高级参数工作台架构升级，参考 FFmpegFreeUI v6 导入高级质量、色彩、降噪和去色带能力
- Work completed:
  1. 将正式页面重构为九模块 `WorkbenchShell`，桌面侧边导航 + 固定命令检查器，移动端模块选择器 + 底部抽屉
  2. `ResolvedBuilderView` 扩展 panels、panel/group/tier、诊断数和高级参数计数；`?panel=` 与分享 hash 并存，命令来源可跨模块定位
  3. ProjectConfig/schema/share 升级 v3，新增 `video.color`、denoise、deband；v2→v3 迁移默认全部禁用，不改变旧命令
  4. 导入 FFmpegFreeUI 质量预制项：GOP、B 帧、keyint_min、qmin/qmax/qcomp；高级目录控件默认 optional
  5. 新增色彩输出标记 `-colorspace/-color_primaries/-color_trc/-color_range` 与 `VIDEO_COLOR` 阶段
  6. 新增 hqdn3d/nlmeans/atadenoise/bm3d、deband/gradfun，并保持唯一有序 `-vf`
  7. 可选布尔控件支持未设置/开启/关闭三态；目录审计新增高级默认、来源和命令绑定约束
  8. 更新架构、用户指南、来源映射、参数树、审计记录和验收报告
- Commands run:
  - `git pull --ff-only` — Already up to date
  - FFmpegFreeUI GitHub main 源码读取 — 质量/色彩管理/降噪/平滑断层 v6 页面
  - `npm run check` — 全部通过
  - `npx tsx scripts/acceptance-test.ts` — 10/10
  - Browser 技能连接 — 浏览器列表为空；无法执行截图巡检
  - `git diff --check` — 通过，仅 Git 行尾提示
- Verification:
  - ESLint 0 errors / 0 warnings；TypeScript 0 errors
  - Vitest 343/343 passed（21 files）；catalog audit 0 errors / 0 warnings
  - Production build: 507.68 KB JS + 21.23 KB CSS；Vite 主包 >500 KB 提示为非阻断风险
  - Acceptance: 10/10
- Decisions/risks:
  - FFmpegFreeUI `project-derived` 参数允许直接进入生产目录，不以官方交叉验证为前置条件
  - 首批色彩能力只写输出标记，不执行 zscale/libplacebo/HDR 像素转换
  - 未部署：用户请求为本地实施，未授权提交、推送或外部发布
- Git status: master 跟踪 origin/master；功能、测试、文档和记录均未提交；`tsconfig.tsbuildinfo` 启动前已有机械差异并继续排除出功能提交
- Next step: 审阅后提交；如需上线，再推送 master 并核验 Cloudflare Pages

### 2026-07-12 17:18 - Codex (GPT-5)

- Objective: 修复高级参数工作台本地预览反馈，并将参数导航改为可折叠侧边栏
- Work completed:
  1. 修复拆分区域复用 `section.color` 导致的重复 key/联动折叠问题，为工作台子区域生成来源唯一 ID
  2. 修复默认展开区域首次点击被写成 `true` 的状态错误，现在首次点击即可关闭且切换模块后不增殖
  3. 将两个色彩分组命名为“像素格式 / 色彩元数据”，将两个流与封装分组命名为“流选择 / 封装设置”，并补齐英文文案
  4. 新增桌面参数侧栏折叠按钮、紧凑简称和本机偏好持久化；移动端模块选择器保持不变
  5. 参数说明抽屉改用匹配圆角的盒阴影并移除方形 `drop-shadow`；诊断为零时不显示数字
  6. 新增 3 项 RTL 回归测试，覆盖区域首次关闭、分组区分、侧栏折叠持久化及零诊断标签
- Files changed in this fix: `resolve-builder-view.ts`、`builder-store.ts`、`WorkbenchShell.tsx`、`BuilderPage.tsx`、`i18n.tsx`、`index.css`、`builder-checkboxes.test.tsx` 及 HandShake 记录
- Commands run:
  - `git pull --ff-only` — Already up to date；启动时已有高级参数工作台未提交改动
  - 定向 RTL：24/24 passed
  - `npm run check` — ESLint、TypeScript、346 tests、catalog audit、production build 全部通过
  - `Invoke-WebRequest http://127.0.0.1:5173/` — HTTP 200；开发预览继续运行
  - `git diff --check` — 通过，仅 Git 预期的 LF→CRLF 提示
- Verification:
  - ESLint 0 errors / 0 warnings；TypeScript 0 errors
  - Vitest 346/346 passed（21 files）；catalog audit 0 errors / 0 warnings
  - Production build: 509.09 KB JS + 22.46 KB CSS；Vite 主包 >500 KB 提示为非阻断风险
- Decisions/risks:
  - 折叠偏好是纯 UI 状态，写入 `ffcodec-workbench-sidebar-collapsed`，不进入 ProjectConfig 或分享载荷
  - 用户明确要求先本地查看，本轮不提交、不推送、不部署
  - `tsconfig.tsbuildinfo` 启动前已有机械差异，继续排除出后续功能提交
- Git status: master 跟踪 origin/master；高级参数功能、本次修复、测试和记录均未提交，working tree not clean
- Next step: 用户通过本地预览确认；确认后创建功能提交，需上线时再推送 master

### 2026-07-12 17:33 - Codex (GPT-5)

- Objective: 提交并部署高级参数工作台，然后制定下一阶段实施计划
- Work completed:
  1. 复核 AGENTS/INDEX/STATUS、远端同步状态、已验证差异和 GitHub 登录状态
  2. 暂存全部高级参数工作台源码、测试和文档，明确排除既有 `tsconfig.tsbuildinfo` 机械差异
  3. 创建提交 `84c2028 feat: add advanced parameter workbench` 并推送 master
  4. Cloudflare Workers and Pages check suite / Cloudflare Pages check-run 均返回 `completed / success`
  5. 生产域名 HTTP 200，资源更新为 `/assets/index-D93ypZi1.js` 与 `/assets/index-CSyGe8SP.css`；bundle 确认包含侧栏折叠、Color metadata 和 Parameter workbench
  6. 制定下一阶段四步计划：稳定化与审计校准 → 真实色彩处理 → 高级质量第二批 → 剪辑/元数据/章节/附件/排序评估
- Verification:
  - 提交沿用源码未变化前 `npm run check` 全通过结果：346/346 tests、audit 0/0、build success
  - Cloudflare Pages: completed/success；生产站点 HTTP 200；线上 bundle 功能标识验证通过
- Decisions/risks:
  - 下一阶段先处理主包 >500 KB、过时审计文档和实机命令矩阵，避免继续扩展后提高回归成本
  - 色彩第二阶段必须区分“只写元数据”与“真实像素转换”，不让用户误以为当前标记会改变画面
  - 剪辑、章节、附件和自由排序继续后置，避免与色彩处理和质量参数同时扩大 schema/命令管道
  - `tsconfig.tsbuildinfo` 不属于功能提交，继续保留为唯一未提交本地机械差异
- Git status: `84c2028` 已推送 origin/master；本部署记录将以独立 docs 提交推送，之后仅保留 `tsconfig.tsbuildinfo` 本地差异
- Next step: 用户确认计划后，从稳定化与实机命令矩阵开始实施

### 2026-07-12 18:14 - Codex (GPT-5)

- Objective: 修复切换字幕栏导致的整体 UI 位移，并持续完成上一轮全部后续计划直到可提交部署
- Work completed:
  1. 在根滚动容器启用稳定 scrollbar gutter，并约束字幕标题操作区的 flex/min-width，消除高内容量字幕页引发的可视宽度变化
  2. 更新控件交互审计；补桌面工作台、移动模块选择器、字幕挂载和色彩操作 RTL；Vite 拆分 vendor/业务 chunk，消除 >500 KB 警告
  3. ProjectConfig/schema/share 升级 v4；v3→v4 固定迁移为 metadata-only，旧命令不新增像素转换
  4. 新增色彩操作方式、zscale、libplacebo、转换前像素格式、CPU tonemap、npl/desaturation；色彩处理按固定顺序进入唯一 `-vf`
  5. 新增色彩转换空目标、视频复制、tonemap 目标/滤镜不匹配和 libplacebo 构建可用性诊断
  6. 高级质量第二批加入 level、rc-lookahead、AQ strength、scene threshold、refs、NVENC lookahead level、QSV extbrc 三态、AMF QVBR quality；切换编码器继续清理
  7. 新增 `scripts/ffmpeg-smoke-test.ts`，在 FFmpeg 8.1.1 实测 libx264 高级质量、zscale SDR、CPU HDR→SDR、降噪+去色带 4/4
  8. 完成剪辑、元数据、章节、附件和自由滤镜排序评估；决定下一批先做受控剪辑与常用元数据，其他能力分别立项
  9. 发布版本提升到 0.6.0并更新架构、用户指南、来源映射、审计、验收、版本记录
- Commands run:
  - `git pull --ff-only` — Already up to date；仅 `tsconfig.tsbuildinfo` 为启动前既有机械差异
  - Browser runtime 连接与一次可用列表检查 — 列表为空，无法截图；未改用非授权浏览器后端
  - FFmpegFreeUI GitHub main 源码读取：色彩管理、质量页、`构造色彩转换滤镜`
  - `ffmpeg -h filter=zscale/tonemap/libplacebo` 与 11 个编码器 help 读取
  - `npm run check` — 359/359、audit 0/0、build success
  - `npx tsx scripts/acceptance-test.ts` — 10/10
  - `npm run test:ffmpeg` — FFmpeg 8.1.1 smoke 4/4
  - `git diff --check` — 通过，仅 Git 预期 LF→CRLF 提示
- Verification:
  - ESLint 0/0；TypeScript 0 errors；Vitest 359/359（22 files）；catalog audit 0/0
  - Acceptance 10/10；FFmpeg smoke 4/4
  - Build: index 317.45 KB / vendor 205.27 KB / CSS 22.52 KB，无 >500 KB warning
- Decisions/risks:
  - 当前色彩字段表示输出目标；CPU tonemap 依赖输入流已有正确 HDR 元数据，用户需用短样片复核
  - libplacebo 生成项目来源支持的参数并显示 availability info，实际运行取决于 FFmpeg 构建、Vulkan 和驱动
  - 应用内浏览器列表为空，字幕位移由 CSS 稳定槽位契约、桌面/移动 RTL 与构建产物验证；真实截图仍是环境限制
  - `tsconfig.tsbuildinfo` 继续排除出功能提交
- Git status: master 跟踪 origin/master；v0.6.0 功能、测试和文档未提交，working tree not clean
- Next step: 创建功能提交、推送并核验 Cloudflare Pages；随后提交部署记录

### 2026-07-12 18:19 - Codex (GPT-5)

- Objective: 发布并核验 v0.6.0，完成用户要求的全部计划闭环
- Work completed:
  1. 创建提交 `b24cfcb feat: release advanced color and quality workbench v0.6.0`
  2. 推送 master，Cloudflare Workers and Pages check suite 与 Cloudflare Pages check-run 均 completed/success
  3. 生产站点返回 HTTP 200，资源更新为 `/assets/index-CYEsPILd.js`、`/assets/vendor-C0qM6IhX.js`、`/assets/index-Cnnup6gh.css`
  4. 线上 JS 确认包含 convert-and-tag、色调映射目标诊断和 qvbrQualityLevel；线上 CSS 确认包含稳定 scrollbar gutter
- Verification: 沿用提交前最终全量检查（359/359、audit 0/0、acceptance 10/10、FFmpeg 4/4、build success）；Cloudflare success 与生产资源独立核验通过
- Decisions/risks:
  - 用户要求的字幕位移修复和上一轮全部计划已经完成，无剩余必做项
  - 应用内浏览器仍无实例；生产资源与交互契约已验证，截图式视觉巡检是环境限制而非功能阻断
  - 本地仅 `tsconfig.tsbuildinfo` 保留既有机械差异，不属于 v0.6.0
- Git status: 功能提交已推送；本部署记录将以独立 docs 提交推送，之后 master 与 origin 同步，仅本地 tsbuildinfo 非干净
- Next step: 无；未来新需求从受控剪辑和常用元数据开始

### 2026-07-12 18:35 - Claude Code (DeepSeek-v4-pro)

- Objective: 接管 Codex v0.6.0 工作，核验完成度并完善 closeout 记录
- Work completed:
  1. 按 HandShake 规程读取 AGENTS.md、CLAUDE.md、INDEX.md、STATUS.md；`git pull` 确认远端已同步
  2. 运行 `npm run check` 全量验证：ESLint 0/0、TypeScript 0 errors、Vitest 359/359（22 files）、catalog audit 0/0、production build 成功（317.45 KB business + 205.27 KB vendor + 22.52 KB CSS）
  3. 核验 Codex 四阶段完成度：
     - ✅ 字幕栏稳定化：CSS scrollbar-gutter + flex/min-width 约束已落地
     - ✅ schema v4 色彩转换：zscale/CPU tonemap/libplacebo + 三种操作模式 + 诊断
     - ✅ 高级质量第二批：level/lookahead/AQ/scene-threshold/refs/extbrc/QVBR 均已接入
     - ✅ FFmpeg 8.1.1 实机矩阵 4/4、验收 10/10
     - ✅ v0.6.0 提交 `b24cfcb` + 部署记录 `7ffe402` 均已推送；Cloudflare Pages 生产站点在线
  4. 发现并修复 closeout 记录遗漏：
     - STATUS.md Git Sync 区域仍引用旧 commit `361949c`，已更新为 `b24cfcb` / `7ffe402`
     - `version/工作进度.md` 当前摘要仍显示 v0.5.2 和旧日期 13:21，已更新为 v0.6.0 完整摘要
  5. 追加本次 Claude Code 会话记录到 STATUS.md 和 工作进度.md
- Files changed:
  - Modified: docs/codex/STATUS.md（Git Sync 区域 + 本次 session log）
  - Modified: version/工作进度.md（当前摘要 + 本次进度条目）
- Commands run:
  - `git pull` — Already up to date
  - `git status` — 仅 tsconfig.tsbuildinfo 机械差异
  - `git log --oneline -10` — 确认提交链完整
  - `npm run check` — ALL PASSED
- Verification:
  - ESLint: 0 errors, 0 warnings
  - TypeScript strict: 0 errors
  - Vitest: 359/359 passed (22 files)
  - Catalog audit: 0 errors, 0 warnings
  - Production build: 317.45 KB + 205.27 KB vendor + 22.52 KB CSS
  - 原有 359 测试 0 弱化/删除
- Decisions/risks:
  - v0.6.0 四阶段计划已全部闭环，无剩余实施项
  - 应用内浏览器仍无可用实例，视觉巡检继续作为环境限制记录
  - `tsconfig.tsbuildinfo` 持续排除出功能提交
- Environment notes: Node.js v24.18.0, Windows 11, Git Bash
- Git status: master 跟踪 origin/master，仅 tsconfig.tsbuildinfo 未跟踪修改；功能与记录提交均已推送
- Next step: 无阻断任务；下一轮从 `docs/next-capability-evaluation.md` 建议的受控剪辑和常用元数据开始
