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
