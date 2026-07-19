# Architecture — FFmpeg 命令生成器

## 分层架构

```text
UI Layer (React)
├─ pages/builder/        → 页面布局、模块导航
├─ components/           → 通用参数控件、解释面板、命令预览
└─ store/                → Zustand store (仅状态，不含业务逻辑)

Application Layer
├─ store/pipeline.ts     → usePipeline hook: 串联 config → normalize → rules → validate → command → render
├─ features/presets/     → 预设管理
└─ features/persistence/ → 本地持久化

Domain Layer (Pure TypeScript, 无 React/Zustand 依赖)
├─ domain/config/        → ProjectConfig 类型、默认值、Zod schema
├─ domain/catalog/       → 目录类型、加载器、索引
├─ domain/rules/         → 规则 AST、求值器
├─ domain/normalization/ → 编码器切换规范化
├─ domain/validation/    → 兼容性校验
├─ domain/tools/         → 实用工具的纯计算与交互约束
├─ domain/filters/       → 视频滤镜构建器
├─ domain/command/       → Command AST、命令构建器
└─ domain/shell/         → Bash/PowerShell/CMD 渲染器

Data Layer (纯数据，无逻辑)
├─ data/parameters/      → 参数定义
├─ data/encoders/video/  → 视频编码器目录
├─ data/encoders/audio/  → 音频编码器目录
├─ data/containers/      → 容器兼容性定义
├─ data/rules/           → 内置规则
└─ data/explanations/    → 参数解释
```

## 数据流

```text
用户操作
  │
  ▼
update ProjectConfig (Zustand store)
  │
  ▼
normalizeConfig(prev, next, catalog)   ← 编码器切换时清除无效值
  │
  ▼
evaluateRules(rules, ctx)             ← 计算 fieldStates, messages, suggestions
  │
  ▼
validateCompatibility(config, catalog) ← 容器 ↔ 编码器兼容性检查
  │
  ▼
buildCommandPlan(config, catalog, msgs) ← 构建 Command AST
  │
  ▼
render{Bash|PowerShell|Cmd}(plan)     ← 渲染最终命令文本
  │
  ▼
UI 展示: 命令预览、解释、错误、警告
```

## 不可违反的依赖方向

- **Domain Layer** 不得依赖 React、Zustand 或浏览器 API
- **Data Layer** 不得导入 Domain 层逻辑模块（只能被导入）
- **UI Layer** 不得保存 FFmpeg 业务知识（CRF 范围、preset 列表等）
- **组件** 不得硬编码 FFmpeg 参数名或兼容性判断
- **命令文本** 只能由 Command AST → Shell Renderer 产生

## 关键设计决策

### ProjectConfig 是唯一事实来源
- 命令文本是派生结果，不作为主状态
- UI 不解析命令反向维护表单
- 每个生成参数必须带 `originId`，可追溯到控件或规则

### 编码器能力驱动
- `EncoderDefinition` 是用户选择编码器后所有可见选项的来源
- 无全局 CRF 范围 — 每个编码器的每种质量模式独立定义
- preset/profile/tune/pix_fmt 选项只存在于编码器定义中

### 规则引擎纯声明式
- 规则使用受控 AST：`{ op: 'eq', path: 'video.mode', value: 'copy' }`
- 不在 JSON 中嵌入 JavaScript 字符串表达式
- 规则效果通过统一接口影响 UI 状态

### 字幕架构分离
- 字幕混流 (`SubtitleMuxConfig`) — map/codec，不触发视频重编码
- 字幕烧录 (`SubtitleBurnConfig`) — 视频滤镜，要求重编码
- 两者独立配置，互不干扰

### 命令构建分层
- `CommandPlan` (AST) → `flattenInvocation` → `render{Bash|PowerShell|Cmd}`
- 每个 Arg 有 phase 用于排序
- Shell renderer 只负责转义，不参与参数选择

### 目标大小与双遍编码（schema v6）

- `tools.targetSize` 保存用户约束，不保存派生视频码率；计算集中在 `domain/tools/target-size.ts`。
- 计算使用目标 MiB、完整时长、封装预留和音频总预算，派生的 `-b:v` 只在命令构建阶段产生。
- 工具启用时只在呈现层暂时禁用原质量字段，不改写 `video.rateControl`，因此关闭后可无损恢复原设置。
- 目标大小只接受已验证支持双遍的编码器、单一显式视频流和可确定的音频预算；冲突自定义参数由诊断阻断。
- 所有双遍命令第一遍仅保留视频分析参数，固定输出 `-an -sn -f null -`；第二遍才包含完整输出。Shell 渲染器以成功条件连接两遍，避免第一遍失败后继续执行。

## 文件清单

| 文件路径 | 用途 |
|---|---|
| `src/domain/config/project-config.ts` | ProjectConfig 类型定义 |
| `src/domain/config/defaults.ts` | 默认配置工厂函数 |
| `src/domain/config/config-schema.ts` | Zod 验证 schema |
| `src/domain/catalog/catalog-types.ts` | 目录类型定义 |
| `src/domain/catalog/catalog-loader.ts` | 目录组装函数 |
| `src/domain/catalog/catalog-index.ts` | 快速查找索引类 |
| `src/domain/rules/rule-types.ts` | 规则表达式和效果类型 |
| `src/domain/rules/rule-evaluator.ts` | 规则求值器 |
| `src/domain/rules/rule-index.ts` | 规则注册和查询 |
| `src/domain/normalization/normalize-config.ts` | 配置规范化器 |
| `src/domain/validation/compatibility-validator.ts` | 容器兼容性校验 |
| `src/domain/validation/validate-config.ts` | 完整验证管道 |
| `src/domain/tools/target-size.ts` | 目标大小码率计算与冲突诊断 |
| `src/domain/filters/video-filter-builder.ts` | 视频滤镜链构建器 |
| `src/domain/command/command-ast.ts` | Command AST 类型和排序 |
| `src/domain/command/command-builder.ts` | 从 Config 构建 CommandPlan |
| `src/domain/command/argument-order.ts` | 参数排序和扁平化 |
| `src/domain/shell/bash-renderer.ts` | Bash/Zsh 渲染器 |
| `src/domain/shell/powershell-renderer.ts` | PowerShell 渲染器 |
| `src/domain/shell/cmd-renderer.ts` | Windows CMD 渲染器 |
| `src/store/builder-store.ts` | Zustand store |
| `src/store/pipeline.ts` | React 管道 hook |
| `src/data/encoders/video/libx264.ts` | libx264 编码器数据 |
| `src/data/encoders/video/libx265.ts` | libx265 编码器数据 |
| `src/data/encoders/video/libsvtav1.ts` | libsvtav1 编码器数据 |
| `src/data/encoders/audio/aac.ts` | AAC 编码器数据 |
| `src/data/encoders/audio/libopus.ts` | libopus 编码器数据 |
| `src/data/containers/index.ts` | MP4/MKV/WebM/MOV 容器数据 |
| `src/data/explanations/index.ts` | 参数解释数据 |
| `src/data/parameters/index.ts` | 共享参数定义 |
| `src/data/rules/index.ts` | 内置规则定义 |
| `scripts/validate-catalog.ts` | 目录审计脚本 |

## 模块化高级参数工作台（schema v4）

正式页面采用 `WorkbenchShell`，由左侧模块导航、单一活动参数页和右侧命令检查器组成。活动模块写入 `?panel=`，分享配置继续使用 URL hash；两者互不占用。移动端使用模块选择器和可折叠命令抽屉。

`ResolvedWorkspaceView.panels` 是 UI 的导航来源，原有 `sections` 保留为兼容视图。字段通过 `panelId`、`groupId` 和 `tier` 描述展示位置，命令生成仍只依赖 `ProjectConfig`、目录和 Command AST。

schema v3 新增基础高级质量、色彩标记、降噪和去色带。schema v4 在保持旧命令不变的前提下继续新增：

- `video.color.operation`：区分仅写元数据、转换并写标记、仅转换；v3 迁移后固定为仅写元数据。
- `video.color.filter`：zscale CPU 路径与 libplacebo GPU 路径；实际转换进入唯一有序 `-vf`。
- `video.color.toneMap`：zscale + tonemap 的 CPU HDR→SDR 路径，或 libplacebo 的扩展算法。
- `frame.filters.denoise`：hqdn3d、nlmeans、atadenoise、bm3d。
- `frame.filters.deband`：deband、gradfun。
- 编码器高级质量项继续存入 `video.specialParameters`，由目录中的 `configBinding` 与 `commandBinding` 控制。

视频编码器的结构化 `specialParameters` 会被解析成独立的 `section.video-advanced`，并固定放在视频编码工作台。没有 `dictionary.key` 的自由字典文本框留在 `section.video` 底部。展示层把全部私有控件视为可选项，因此目录 `defaultValue` 只描述编码器默认行为；命令层只读取 `ProjectConfig.video.specialParameters` 中的显式值。这个约束适用于全部视频编码器，避免默认命令被私有参数填满。

`CommandBinding.dictionary` 用于 `-svtav1-params` 一类 `key=value` 字典参数。带 `dictionary.key` 的结构化控件和不带 key 的原始文本根字段按 prefix、phase、separator 分组，最终只生成一个参数；同组字段在 `parameter-dictionary.ts` 中双向同步。新增其他字典式编码器参数时应复用该绑定，不应在命令构建器里加入编码器名称分支。

`ResolvedWorkspacePanel.stateNotice` 描述复制流或禁用输出时的面板状态。视频复制会覆盖视频、质量、色彩与滤镜工作台，音频复制或禁用会覆盖音频工作台；即使面板没有字段也必须显示原因和返回路径。

滤镜顺序保持：反交错 → 裁剪 → 缩放 → 旋转/翻转 → 降噪 → 去色带 → 色彩处理 → 基础调色 → 锐化 → 帧率 → 字幕 → 自定义。所有启用项最终仍只形成一个 `-vf`。

生产构建通过 Vite `manualChunks` 将第三方运行时拆为 vendor chunk，业务主包不再超过 500 KB。

高级项统一为显式启用语义：未设置值不进入命令；可选布尔控件提供未设置、开启、关闭三态。v2→v3 迁移只增加禁用结构，不改变旧命令。
