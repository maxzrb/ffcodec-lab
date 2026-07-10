# Codex 项目指令集：FFmpeg 压制命令生成器

## 1. 你的角色

你是本项目的主开发代理。你的任务是设计并实现一个纯前端的 FFmpeg 压制命令生成网页。

本项目只生成 FFmpeg 命令，不上传媒体文件，不调用本机 FFmpeg，不执行转码，不建立后端服务。产品重点不是堆积参数，而是准确表达参数之间的父子关系、依赖关系、冲突关系和封装兼容关系，并为每个参数提供可追溯的解释。

参数结构和业务逻辑优先参考：

- https://github.com/Lake1059/FFmpegFreeUI
- 项目内的 `docs/FFmpegFreeUI_参数树与网页首版裁剪方案.md`

FFmpegFreeUI 用于提供参数组织、选项和联动逻辑的主要参考。不得仅凭模型记忆补全 FFmpeg 参数。缺少来源时，将能力标记为 `unknown` 或暂不实现，不允许猜测。

---

## 2. 产品定义

实现一个具有以下能力的 FFmpeg 命令生成器：

1. 用户可以在同一条命令中组合视频编码、质量控制、分辨率、帧率、音频、字幕和封装参数。
2. 选择父级参数后，子级选项动态变化。例如选择 `libsvtav1` 后，质量模式、质量范围、preset、profile 和像素格式从该编码器能力定义中加载。
3. 参数之间存在跨分支联动。例如视频流复制时禁止修改分辨率和烧录字幕。
4. 每个参数都有简要解释、详细解释、影响范围、禁用原因、命令映射和来源信息。
5. 实时生成 Bash、PowerShell 和 Windows CMD 命令。
6. 命令中的参数片段可以追溯到对应的界面控件。
7. 输出容器与视频、音频、字幕编码之间进行兼容性校验。

产品不是在线转码器，也不是通用 FFmpeg 全功能 GUI。第一版只覆盖压制命令所需的核心参数。

---

## 3. 第一版范围

### 3.1 必须实现

- 输入和输出占位路径
- Shell 类型：Bash/Zsh、PowerShell、Windows CMD
- 输出容器：MP4、MKV、WebM、MOV
- 视频流：重新编码、`copy`、`-vn`
- 视频编码器目录和编码器专属参数
- 质量模式：CRF、VBR、CQP、CBR；二次编码可在基础架构完成后加入
- preset、profile、tune/usage、像素格式
- 分辨率：保持原始、指定宽高、只指定宽度、只指定高度、常用预设
- 帧率：保持原始、常用值、自定义
- 音频：编码、`copy`、`-an`、码率、声道、采样率、编码器质量参数
- 字幕流处理：保留、复制、转码、外挂字幕混流
- 字幕烧录：外挂或内嵌来源、基本样式、颜色、描边、位置、边距、`force_style`
- 参数解释与来源展示
- 冲突、错误、警告和建议
- 实时命令预览与复制
- 保存和恢复本地配置

### 3.2 暂不实现

- 调用或检测本机 FFmpeg
- 文件上传、文件探测和媒体信息读取
- 后端服务、账号和云同步
- 节点式滤镜编辑器
- 裁剪、插帧、降噪、锐化、超分、色调映射等专业滤镜
- `filter_complex`
- 批处理和任务队列
- 自动检测硬件编码器是否存在
- 完全自由的命令解析和反向导入

分辨率、帧率和烧录字幕虽然在 FFmpeg 中属于滤镜，但第一版只把它们作为三个受控的基础画面功能，不向用户暴露通用滤镜系统。

---

## 4. 不可破坏的架构原则

### 4.1 配置状态是唯一事实来源

界面状态必须保存为结构化的 `ProjectConfig`。命令文本只是由配置推导出的结果，不得把命令字符串作为主状态，也不得通过解析当前命令反向维护表单。

数据流固定为：

```text
用户操作
→ 更新 ProjectConfig
→ 规范化当前配置
→ 执行依赖规则
→ 执行兼容性校验
→ 构建 Command AST
→ Shell Renderer 输出命令
→ UI 展示解释、错误和命令
```

### 4.2 页面组件不得保存 FFmpeg 业务知识

React 组件只负责展示和触发动作。以下内容禁止硬编码在组件中：

- CRF 范围
- preset 列表
- profile 列表
- 编码器支持的质量模式
- 容器兼容矩阵
- 参数禁用条件
- 参数解释
- FFmpeg 参数名

这些内容必须来自参数目录、编码器目录、容器目录和规则定义。

### 4.3 禁止直接拼接完整命令字符串

所有命令先构建为结构化 AST/token，再交给 Shell Renderer 转义和渲染。禁止在组件或业务模块中使用类似：

```ts
command += ` -crf ${value}`
```

### 4.4 禁止静默修正用户选择

当父级改变导致子级值失效时：

1. 若旧值在新能力范围内，保留旧值。
2. 若旧值无效，恢复为新节点的默认值。
3. 记录一条可展示的 `normalizationNotice`，说明改动原因。
4. 不得偷偷夹取数值、替换编码器或改变容器。

兼容性建议默认只提示，不自动更改。只有用户选择 `auto` 时才允许自动解析具体参数。

### 4.5 未验证参数不得进入正式目录

每个参数节点必须带来源。没有来源的参数只能进入实验目录，并标记：

```ts
status: 'unverified'
```

正式目录中的参数必须满足：

```text
有参数名
有适用编码器或模块
有选项或范围
有默认值或明确说明无默认值
有来源文件
有简要解释
```

---

## 5. 技术栈

采用以下技术栈，除非现有仓库已经确定了等价方案：

- React
- TypeScript，开启严格模式
- Vite
- Zustand：保存 `ProjectConfig` 和用户交互状态
- Zod：验证目录数据、配置数据和本地存储数据
- Vitest：单元测试和快照测试
- React Testing Library：关键交互测试
- ESLint + Prettier

不使用后端框架。应用必须可以构建为纯静态网站。

不要把 Zustand 当作业务引擎。规则求值、规范化、校验和命令构建必须是无副作用的纯函数，放在独立核心模块中。

---

## 6. 总体分层

```text
UI Layer
├─ 页面布局
├─ 通用参数控件
├─ 参数解释面板
├─ 错误与警告面板
└─ 命令预览

Application Layer
├─ 用户动作
├─ 配置更新
├─ 预设与本地存储
└─ 页面级组合逻辑

Domain Layer
├─ ProjectConfig
├─ Parameter Catalog
├─ Encoder Catalog
├─ Container Catalog
├─ Rule Engine
├─ Normalizer
├─ Validator
├─ Filter Builder
├─ Command AST Builder
└─ Shell Renderers

Data Layer
├─ 参数定义
├─ 编码器定义
├─ 音频编码器定义
├─ 容器兼容定义
├─ 依赖规则
├─ 参数解释
└─ 来源映射
```

Domain Layer 不得依赖 React、Zustand 或浏览器 API。

---

## 7. 推荐目录结构

```text
src/
├─ app/
│  ├─ App.tsx
│  ├─ routes.tsx
│  └─ providers/
│
├─ pages/
│  └─ builder/
│     ├─ BuilderPage.tsx
│     ├─ BuilderLayout.tsx
│     └─ sections/
│        ├─ InputOutputSection.tsx
│        ├─ StreamSection.tsx
│        ├─ VideoEncoderSection.tsx
│        ├─ VideoQualitySection.tsx
│        ├─ FrameSection.tsx
│        ├─ AudioSection.tsx
│        ├─ SubtitleSection.tsx
│        ├─ ContainerSection.tsx
│        └─ CustomArgsSection.tsx
│
├─ components/
│  ├─ parameters/
│  │  ├─ ParameterField.tsx
│  │  ├─ SelectField.tsx
│  │  ├─ NumberField.tsx
│  │  ├─ SwitchField.tsx
│  │  ├─ TextField.tsx
│  │  └─ ColorField.tsx
│  ├─ explanation/
│  ├─ validation/
│  └─ command-preview/
│
├─ domain/
│  ├─ config/
│  │  ├─ project-config.ts
│  │  ├─ defaults.ts
│  │  └─ config-schema.ts
│  ├─ catalog/
│  │  ├─ catalog-types.ts
│  │  ├─ catalog-loader.ts
│  │  └─ catalog-index.ts
│  ├─ rules/
│  │  ├─ rule-types.ts
│  │  ├─ rule-evaluator.ts
│  │  ├─ rule-effects.ts
│  │  └─ rule-index.ts
│  ├─ normalization/
│  │  ├─ normalize-config.ts
│  │  └─ normalization-types.ts
│  ├─ validation/
│  │  ├─ validate-config.ts
│  │  ├─ compatibility-validator.ts
│  │  └─ validation-types.ts
│  ├─ filters/
│  │  ├─ video-filter-types.ts
│  │  ├─ video-filter-builder.ts
│  │  └─ subtitle-filter-builder.ts
│  ├─ command/
│  │  ├─ command-ast.ts
│  │  ├─ command-builder.ts
│  │  ├─ argument-order.ts
│  │  └─ emitters/
│  └─ shell/
│     ├─ shell-types.ts
│     ├─ bash-renderer.ts
│     ├─ powershell-renderer.ts
│     └─ cmd-renderer.ts
│
├─ data/
│  ├─ parameters/
│  ├─ encoders/video/
│  ├─ encoders/audio/
│  ├─ containers/
│  ├─ rules/
│  ├─ explanations/
│  └─ source-map/
│
├─ store/
│  ├─ builder-store.ts
│  ├─ builder-actions.ts
│  └─ selectors.ts
│
├─ features/
│  ├─ presets/
│  ├─ persistence/
│  └─ share-config/
│
├─ utils/
└─ tests/

docs/
├─ architecture.md
├─ source-map.md
├─ parameter-audit.md
├─ compatibility-policy.md
└─ FFmpegFreeUI_参数树与网页首版裁剪方案.md

scripts/
├─ validate-catalog.ts
├─ audit-sources.ts
└─ generate-catalog-report.ts
```

目录名称可以因现有项目略作调整，但 Domain Layer、Data Layer、UI Layer 必须保持解耦。

---

## 8. 核心配置模型

`ProjectConfig` 是用户当前方案的唯一事实来源。

```ts
export interface ProjectConfig {
  schemaVersion: number
  shell: ShellKind
  input: InputConfig
  output: OutputConfig
  streams: StreamSelectionConfig
  video: VideoConfig
  frame: FrameConfig
  audio: AudioConfig
  subtitle: SubtitleConfig
  customArgs: CustomArgsConfig
}

export type ShellKind = 'bash' | 'powershell' | 'cmd'

export interface InputConfig {
  path: string
  additionalInputs: AdditionalInputConfig[]
}

export interface OutputConfig {
  path: string
  containerId: string
  overwrite: boolean
}

export interface VideoConfig {
  mode: 'encode' | 'copy' | 'disabled'
  encoderId?: string
  rateControl?: RateControlConfig
  preset?: string | number
  profile?: string
  tune?: string
  pixelFormat?: string
  gpuIndex?: number
  threads?: number
  specialParameters: Record<string, unknown>
}

export interface RateControlConfig {
  mode: 'crf' | 'vbr' | 'cqp' | 'cbr' | 'twoPass'
  qualityValue?: number
  bitrate?: string
  minRate?: string
  maxRate?: string
  bufferSize?: string
  additionalValues: Record<string, unknown>
}

export interface FrameConfig {
  resolution:
    | { mode: 'source' }
    | { mode: 'size'; width: number; height: number; keepAspect: boolean }
    | { mode: 'width'; width: number }
    | { mode: 'height'; height: number }
  frameRate:
    | { mode: 'source' }
    | { mode: 'value'; value: number }
}

export interface AudioConfig {
  mode: 'encode' | 'copy' | 'disabled'
  encoderId?: string
  bitrate?: string
  channelLayout?: string
  sampleRate?: number
  sampleFormat?: string
  qualityValues: Record<string, unknown>
}

export interface SubtitleConfig {
  mux: SubtitleMuxConfig
  burn: SubtitleBurnConfig
}

export interface SubtitleMuxConfig {
  enabled: boolean
  source: 'internal' | 'external'
  streamSelector?: string
  externalPath?: string
  codecMode: 'auto' | 'copy' | 'mov_text' | 'webvtt' | 'srt' | 'ass' | 'ssa'
  preserveOtherStreams: boolean
}

export interface SubtitleBurnConfig {
  enabled: boolean
  source: 'internal' | 'external'
  streamIndex?: number
  externalPath?: string
  filterKind: 'subtitles' | 'ass'
  style: SubtitleStyleConfig
  customForceStyle?: string
  customFilter?: string
}
```

不要在状态中保存以下派生值：

- 当前可选 preset
- 当前 CRF 最大值
- 当前控件是否禁用
- 当前命令文本
- 当前容器建议字幕编码

这些内容必须由目录和规则实时推导。

---

## 9. 参数目录模型

页面参数节点与编码器能力节点分离。

```ts
export interface ParameterDefinition {
  id: string
  label: string
  group: string
  control: 'select' | 'number' | 'text' | 'switch' | 'multiselect' | 'color'
  commandBinding?: CommandBinding
  defaultValue?: unknown
  optionsSource?: OptionSource
  rangeSource?: RangeSource
  explanationId: string
  sourceRefs: SourceRef[]
  status: 'verified' | 'experimental' | 'unverified'
}

export interface EncoderDefinition {
  id: string
  label: string
  ffmpegName: string
  mediaType: 'video' | 'audio' | 'image'
  family: string
  implementation: 'software' | 'nvidia' | 'intel' | 'amd' | 'other'
  availabilityNote?: string

  capabilities: {
    copy?: boolean
    disabled?: boolean
    supportsTwoPass?: boolean
    supportsLossless?: boolean
    supportedContainers?: string[]
  }

  preset?: ControlDefinition
  profile?: ControlDefinition
  tune?: ControlDefinition
  pixelFormat?: ControlDefinition
  qualityModes: RateControlModeDefinition[]
  specialParameters: ControlDefinition[]
  requiredArguments: ArgumentTemplate[]
  defaultArguments: ArgumentTemplate[]

  explanationId: string
  sourceRefs: SourceRef[]
  status: 'verified' | 'experimental' | 'unverified'
}
```

质量范围必须属于具体编码器和具体质量模式：

```ts
export interface RateControlModeDefinition {
  id: 'crf' | 'vbr' | 'cqp' | 'cbr' | 'twoPass'
  label: string
  controls: ControlDefinition[]
  emitterId: string
  recommendedValues?: RecommendedValue[]
  explanationId: string
  sourceRefs: SourceRef[]
}
```

禁止建立全局 `crfMin = 0`、`crfMax = 51`。

---

## 10. 来源模型和防止参数幻觉

所有正式参数必须包含来源：

```ts
export interface SourceRef {
  repository: string
  branch?: string
  snapshotDate: string
  file: string
  symbol?: string
  url?: string
  sourceType: 'ffmpegfreeui' | 'ffmpeg-official' | 'encoder-official' | 'manual-note'
  note?: string
}
```

执行以下规则：

1. FFmpegFreeUI 源码用于提取参数结构、编码器选项和联动关系。
2. FFmpeg 官方文档或编码器官方文档用于二次核验参数语义和范围。
3. 人工经验值必须标为“经验建议”，不得标为规范默认值。
4. 找不到来源时，不实现该项；在 `docs/parameter-audit.md` 中记录缺口。
5. 不得因为某个编码器与另一个编码器相似，就复制其参数范围。
6. 不得把 FFmpegFreeUI 当前源码中的值描述成所有 FFmpeg 版本永远固定的值。
7. 外部库和硬件编码器必须显示“可用性取决于本机 FFmpeg 构建、硬件和驱动”。

新增或修改目录数据时，必须同时更新来源字段和审计报告。

---

## 11. 规则引擎

### 11.1 规则类型

规则引擎必须支持：

- `visible`：是否显示控件
- `enabled`：是否可编辑
- `required`：是否必须填写
- `conflict`：组合是否非法
- `warning`：组合可以生成但有风险
- `suggestion`：推荐替换或补充参数
- `normalize`：父级变化后清除无效子值
- `resolveAuto`：用户选择 `auto` 时解析具体值

### 11.2 声明式表达式

不要在 JSON 中嵌入 JavaScript 字符串表达式。使用受控规则 AST：

```ts
export type RuleExpression =
  | { op: 'eq'; path: string; value: unknown }
  | { op: 'neq'; path: string; value: unknown }
  | { op: 'in'; path: string; values: unknown[] }
  | { op: 'notIn'; path: string; values: unknown[] }
  | { op: 'exists'; path: string }
  | { op: 'all'; rules: RuleExpression[] }
  | { op: 'any'; rules: RuleExpression[] }
  | { op: 'not'; rule: RuleExpression }
  | { op: 'capability'; key: string; value?: unknown }
```

规则效果：

```ts
export interface RuleDefinition {
  id: string
  priority: number
  when: RuleExpression
  effects: RuleEffect[]
  sourceRefs: SourceRef[]
}

export type RuleEffect =
  | { type: 'hide'; target: string; reasonId: string }
  | { type: 'disable'; target: string; reasonId: string }
  | { type: 'require'; target: string; reasonId: string }
  | { type: 'error'; messageId: string; targets: string[] }
  | { type: 'warning'; messageId: string; targets: string[] }
  | { type: 'suggest'; messageId: string; patch?: Partial<ProjectConfig> }
  | { type: 'clearInvalid'; target: string }
  | { type: 'resolveAuto'; target: string; resolverId: string }
```

### 11.3 第一版必须覆盖的规则

至少实现以下规则：

```text
R01 视频模式为 copy
→ 禁用质量控制、preset、profile、tune、像素格式、分辨率、帧率和烧录字幕

R02 视频模式为 disabled
→ 隐藏全部视频参数和烧录字幕

R03 音频模式为 copy
→ 禁用码率、质量、采样率、采样格式、声道和响度设置

R04 音频模式为 disabled
→ 隐藏全部音频参数

R05 编码器改变
→ 重新加载质量模式、范围、preset、profile、tune、像素格式和专用参数
→ 保留仍然有效的值，清除无效值

R06 质量模式改变
→ 只显示该质量模式需要的控件
→ 清除其他质量模式遗留值

R07 修改分辨率或帧率
→ 要求视频重新编码
→ 与视频 copy 冲突

R08 开启字幕烧录
→ 要求视频重新编码
→ 与视频 copy 冲突

R09 字幕混流
→ 不要求视频重新编码
→ 只生成输入、map 和字幕编码参数

R10 输出容器为 MP4/MOV 系
→ 字幕 auto 优先解析为 mov_text

R11 输出容器为 WebM
→ 字幕 auto 优先解析为 webvtt

R12 输出容器为 MKV
→ 字幕 auto 优先保留原编码或 copy

R13 像素格式改变
→ 校验编码器能力
→ 校验 profile 和色深关系

R14 自定义字幕滤镜不为空
→ 覆盖字幕样式面板生成的字幕滤镜

R15 显式选择不兼容编码组合
→ 产生 error，不得静默替换
```

规则求值输出统一结构：

```ts
export interface EvaluationResult {
  fieldStates: Record<string, FieldState>
  messages: ValidationMessage[]
  suggestions: Suggestion[]
  normalizationNotices: NormalizationNotice[]
  resolvedValues: Record<string, unknown>
}
```

---

## 12. 规范化与状态迁移

规则引擎只描述条件和效果；规范化器负责产生新的合法配置。

规范化必须是纯函数：

```ts
normalizeConfig(
  previous: ProjectConfig,
  next: ProjectConfig,
  catalog: Catalog
): NormalizationResult
```

编码器切换时执行：

1. 读取新编码器能力。
2. 若原质量模式仍受支持，则保留。
3. 若质量模式不受支持，则使用编码器定义的默认模式。
4. 若质量值在新范围内，则保留。
5. 若质量值不在新范围内，则使用新模式默认值，并生成说明。
6. preset、profile、tune、像素格式按相同原则处理。
7. 清除旧编码器专用参数。

不得保留已经不生效的隐藏值，否则再次生成命令时可能带入陈旧参数。

可以为每个编码器保存临时的“上次有效值”，用户切换回来时恢复，但该缓存只能属于 UI 会话状态，不属于命令配置。

---

## 13. 兼容性模型

容器兼容关系独立于编码器定义：

```ts
export type CompatibilityLevel =
  | 'supported'
  | 'supported-with-caveat'
  | 'transcode-recommended'
  | 'unsupported'
  | 'unknown'

export interface ContainerDefinition {
  id: string
  label: string
  extension: string
  videoCodecs: Record<string, CompatibilityLevel>
  audioCodecs: Record<string, CompatibilityLevel>
  subtitleCodecs: Record<string, CompatibilityLevel>
  autoSubtitleResolverId?: string
  muxerArguments: ArgumentTemplate[]
  sourceRefs: SourceRef[]
}
```

校验规则：

- `unsupported`：错误，命令不可标记为有效。
- `supported-with-caveat`：警告。
- `transcode-recommended`：建议。
- `unknown`：显示未知，不声称支持或不支持。

命令仍可以预览，但存在 error 时复制按钮应显示明显警告。不要完全隐藏命令，方便用户理解冲突来自哪里。

---

## 14. 字幕架构

字幕必须保留两个独立分支。

### 14.1 字幕混流

负责：

- 内嵌字幕流选择
- 外挂字幕作为额外输入
- `-map`
- `-c:s`
- 字幕容器兼容转换
- 保留其他字幕流

字幕混流不能进入视频滤镜链，也不能触发视频重编码。

### 14.2 字幕烧录

负责：

- 外挂字幕或内嵌字幕来源
- `subtitles` 或 `ass` 视频滤镜
- 字体、字号、粗体、斜体、描边、阴影、颜色、位置、边距
- `force_style`
- 自定义字幕滤镜覆盖

字幕烧录必须进入视频滤镜链，并要求视频重新编码。

### 14.3 字幕样式模型

```ts
export interface SubtitleStyleConfig {
  fontName?: string
  fontSize?: number
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikeOut?: boolean
  primaryColor?: string
  secondaryColor?: string
  outlineColor?: string
  backColor?: string
  borderStyle?: 1 | 3
  outline?: number
  shadow?: number
  alignment?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  marginL?: number
  marginR?: number
  marginV?: number
  spacing?: number
}
```

颜色数据在状态中使用统一的 RGBA 表示，字幕 emitter 再转换为 libass 需要的格式。不要让 UI 直接操作 FFmpeg/libass 转义字符串。

---

## 15. 基础视频滤镜构建器

第一版不建立通用滤镜系统，但内部仍需使用一个受控的 `VideoFilterSpec[]`，以便组合分辨率、帧率和字幕烧录。

```ts
export type VideoFilterSpec =
  | ScaleFilterSpec
  | FrameRateFilterSpec
  | SubtitleBurnFilterSpec
  | CustomVideoFilterSpec
```

固定顺序：

```text
scale
→ frame rate
→ subtitle burn
→ custom tail filter
```

若没有滤镜，不生成 `-vf`。若有多个基础滤镜，合并为单个 `-vf` 参数，不允许重复生成多个互相覆盖的 `-vf`。

第一版不得生成 `filter_complex`。遇到必须使用 `filter_complex` 的组合时，产生“不支持”的错误，而不是尝试猜测命令。

分辨率转换示例只由 emitter 负责：

```text
保持原始 → 不生成 scale
只指定宽度 → scale=<width>:-2
只指定高度 → scale=-2:<height>
指定宽高并保持比例 → 使用受控的保持比例表达式
```

具体表达式必须在测试中固定，不得散落在组件中。

---

## 16. Command AST

### 16.1 AST 结构

```ts
export interface CommandPlan {
  invocations: CommandInvocation[]
  messages: ValidationMessage[]
}

export interface CommandInvocation {
  executable: 'ffmpeg'
  globalArgs: CommandArg[]
  inputs: InputSpec[]
  output: OutputSpec
  purpose: 'single-pass' | 'pass-1' | 'pass-2'
}

export interface InputSpec {
  id: string
  argsBeforeInput: CommandArg[]
  path: string
  originId: string
}

export interface OutputSpec {
  maps: CommandArg[]
  codecArgs: CommandArg[]
  qualityArgs: CommandArg[]
  filterArgs: CommandArg[]
  audioArgs: CommandArg[]
  subtitleArgs: CommandArg[]
  muxerArgs: CommandArg[]
  customArgs: CommandArg[]
  path: string
}

export interface CommandArg {
  id: string
  originId: string
  phase: ArgumentPhase
  tokens: string[]
  explanationId?: string
  unsafe?: boolean
}
```

`originId` 必须指向参数控件、规则或自动解析器。UI 使用它实现：

- 点击命令片段定位控件
- 悬停显示参数解释
- 展示某个参数由自动规则生成

### 16.2 参数顺序

定义统一的 `ArgumentPhase`，由 command builder 排序：

```text
GLOBAL
PRE_INPUT
INPUT
MAP
VIDEO_CODEC
VIDEO_PROFILE
VIDEO_RATE_CONTROL
VIDEO_FILTER
AUDIO_CODEC
AUDIO_QUALITY
SUBTITLE
METADATA
MUXER
CUSTOM_OUTPUT
OUTPUT
```

不要依赖对象遍历顺序。

### 16.3 自定义参数

自定义参数允许放在受控插槽：

- 命令开头
- 输入前
- 视频参数区
- 音频参数区
- 输出前
- 命令末尾

自定义参数必须标记 `unsafe: true`，并显示：

- 系统不会验证其语义
- 可能覆盖前面生成的参数
- Shell 转义只能保证文本安全，不能保证 FFmpeg 逻辑正确

第一版不解析自定义参数，也不尝试去重。

---

## 17. Shell Renderer

每种 Shell 使用独立 renderer：

```ts
renderBash(plan: CommandPlan): RenderedCommand
renderPowerShell(plan: CommandPlan): RenderedCommand
renderCmd(plan: CommandPlan): RenderedCommand
```

renderer 负责：

- 路径和普通 token 的安全转义
- 空格和特殊字符
- 多行展示
- 行续接符
- 多命令连接方式
- 两次编码时的多条命令

renderer 不负责业务参数选择。

输出同时包含：

```ts
export interface RenderedCommand {
  text: string
  segments: RenderedSegment[]
}

export interface RenderedSegment {
  text: string
  originId: string
  argumentId: string
}
```

不要用正则从最终字符串中反推 segment。

---

## 18. 参数解释系统

参数解释独立存储：

```ts
export interface ExplanationDefinition {
  id: string
  title: string
  short: string
  detail?: string
  commandExample?: string
  effects?: {
    quality?: 0 | 1 | 2 | 3 | 4 | 5
    fileSize?: 0 | 1 | 2 | 3 | 4 | 5
    speed?: 0 | 1 | 2 | 3 | 4 | 5
    compatibility?: 0 | 1 | 2 | 3 | 4 | 5
  }
  warnings?: string[]
  sourceRefs: SourceRef[]
}
```

解释分为三层：

1. 控件旁的一句话说明。
2. 展开面板中的详细说明。
3. 当前编码器或容器上下文说明。

例如 CRF 解释必须读取当前编码器的范围和默认值，不能只显示全局固定文案。

禁用控件必须显示具体原因，不得只显示灰色状态。

---

## 19. UI 组织

建议采用三栏或两栏加固定底部预览：

```text
左侧：模块导航
中间：当前模块参数
右侧：解释、错误、警告
底部固定：命令预览
```

参数区按以下模块组织：

1. 输入与输出
2. 流选择
3. 视频编码
4. 视频质量
5. 画面帧
6. 音频
7. 字幕
8. 封装兼容
9. 自定义参数

每个控件统一显示：

- 名称
- 当前值
- 简短解释
- 来源或“查看来源”入口
- 推荐值标签
- 禁用原因
- 关联警告

复杂模块如字幕可以使用专用组件，但仍必须调用 Domain Layer，不得自行生成 FFmpeg 字符串。

---

## 20. 数据提取工作流

不要立即把 FFmpegFreeUI 全部参数抄进网页。按以下流程执行：

### 阶段 A：建立来源地图

阅读 FFmpegFreeUI 源码，建立：

```text
源码文件
→ 对应模块
→ 参数或编码器定义
→ 当前网页数据文件
```

写入 `docs/source-map.md`。

### 阶段 B：手工整理核心目录

先整理：

- `libx264`
- `libx265`
- `libsvtav1`
- `h264_nvenc`
- `hevc_nvenc`
- 原生 AAC
- libopus
- FLAC
- MP4、MKV、WebM、MOV
- 字幕 copy、mov_text、webvtt、srt、ass、ssa

若首轮开发需要缩小范围，可以先完成前三个软件视频编码器和 AAC/libopus，但架构必须支持后续加入硬件编码器。

### 阶段 C：目录审计

`scripts/validate-catalog.ts` 必须检测：

- ID 重复
- 缺失来源
- 默认值不在范围内
- select 默认值不在 options 中
- 规则引用不存在的字段或节点
- emitterId 不存在
- 编码器没有任何质量模式
- 容器兼容条目引用不存在的编码器族
- 解释 ID 不存在

目录审计失败时，构建或测试必须失败。

---

## 21. 状态管理规则

Zustand store 只负责：

- 保存 `ProjectConfig`
- 保存当前展开模块和选中解释项
- 保存每个编码器上次有效的 UI 临时值
- 调用纯函数生成派生结果

不要在 store 中手写几十个互相依赖的 setter。使用统一动作：

```ts
setConfigValue(path, value)
applyConfigPatch(patch)
resetSection(sectionId)
loadPreset(preset)
```

每次配置变化后，调用：

```text
normalize
→ evaluate rules
→ validate
→ build command
→ render shell
```

可通过 memoization 优化，但不得为了性能把派生结果变成第二份不可控状态。

---

## 22. 错误、警告与建议

统一消息结构：

```ts
export interface ValidationMessage {
  id: string
  severity: 'error' | 'warning' | 'info'
  messageId: string
  fieldIds: string[]
  sourceRuleId?: string
  details?: Record<string, unknown>
}
```

规则：

- `error`：组合逻辑无效或无法可靠生成。
- `warning`：命令可能执行，但存在兼容性、质量或行为风险。
- `info`：自动解析、默认值变化和经验建议。

不得使用模糊文案，如“参数可能有问题”。必须说明：

```text
当前无法修改分辨率，因为视频模式为 copy。分辨率变化需要重新编码视频。
```

---

## 23. 测试要求

### 23.1 规则引擎测试

至少覆盖：

- 视频 copy 后分辨率、帧率和字幕烧录被禁用
- 视频 disabled 后视频区域隐藏
- 音频 copy 后音频质量参数被禁用
- 编码器切换后无效 preset 和 CRF 被重置
- CRF、CBR、CQP 控件互斥
- 字幕混流不触发视频重编码
- 字幕烧录触发视频重编码要求
- MP4 字幕 auto 解析为 mov_text
- WebM 字幕 auto 解析为 webvtt
- 显式不兼容组合产生 error

### 23.2 命令生成测试

使用 golden/snapshot 测试固定：

1. libx264 + CRF + AAC + MP4
2. libx265 + 指定高度 + AAC + MKV
3. libsvtav1 + 帧率 + Opus + WebM
4. 视频 copy + 音频 copy
5. 禁用音频
6. 外挂字幕混流到 MP4
7. 外挂字幕烧录并缩放
8. 内嵌字幕烧录
9. Bash、PowerShell 和 CMD 转义
10. 输入和输出路径含空格、中文、引号相关字符

### 23.3 数据目录测试

所有数据文件必须通过 Zod schema 和目录审计脚本。

### 23.4 不变量测试

确保：

- 一个输出最多生成一个 `-vf`
- `-c:v copy` 时不生成视频滤镜和视频质量参数
- `-vn` 时不生成任何视频参数
- `-an` 时不生成音频参数
- 每个生成参数都有 `originId`
- 每个正式目录节点都有来源
- error 不会被 suggestion 自动掩盖

---

## 24. 开发阶段

不要一开始就实现完整 UI。严格按以下顺序推进。

### 阶段 1：项目骨架

- 建立目录结构
- 配置 TypeScript 严格模式、Zod、Vitest
- 创建 `ProjectConfig`
- 创建最小目录 schema
- 写 `docs/architecture.md`

验收：项目可构建，核心类型无 React 依赖。

### 阶段 2：最小参数目录

- 加入 libx264、libx265、libsvtav1
- 加入 AAC、libopus
- 加入 MP4、MKV、WebM、MOV
- 每项带来源
- 完成目录审计脚本

验收：目录验证和审计测试通过。

### 阶段 3：规则、规范化和校验

- 实现规则 AST
- 实现规则求值器
- 实现编码器切换规范化
- 实现兼容性校验
- 完成核心规则测试

验收：不依赖 UI 即可输入配置并得到字段状态和消息。

### 阶段 4：Command AST 和 Shell Renderer

- 实现命令 AST
- 实现 emitters
- 实现基础视频滤镜构建器
- 实现 Bash、PowerShell、CMD renderer
- 完成命令快照测试

验收：通过测试代码可以稳定生成命令，业务模块中没有完整字符串拼接。

### 阶段 5：基础 UI

- 实现模块导航
- 实现通用参数控件
- 实现视频、质量、画面、音频和容器模块
- 实现命令预览和错误展示

验收：父子参数动态变化，命令实时更新。

### 阶段 6：字幕

- 实现字幕混流
- 实现字幕烧录
- 实现字幕样式 emitter
- 实现字幕与容器联动
- 补齐字幕测试

验收：混流和烧录逻辑完全分离，烧录能与分辨率合并为单个 `-vf`。

### 阶段 7：解释和可追溯性

- 参数解释抽屉
- 禁用原因
- 点击命令片段定位控件
- 显示来源
- 目录审计报告页面或开发工具

验收：每个生成参数都能追溯到控件或自动规则。

### 阶段 8：预设和本地持久化

- 本地保存配置
- schemaVersion 和迁移
- 导入导出 JSON
- 可选的 URL 分享配置

验收：旧配置损坏或版本不匹配时不会导致页面崩溃。

---

## 25. Codex 工作纪律

1. 开始编码前先阅读现有仓库和项目文档，不得假设目录为空。
2. 每次改动先说明涉及的层级和不变量。
3. 不得为了快速实现把参数判断写进 React 组件。
4. 不得用大段 `switch (encoderId)` 代替编码器目录。
5. 不得用大段 `if` 链代替规则引擎；少量 emitter 内部实现除外。
6. 新增参数时必须同时增加来源和测试。
7. 找不到参数依据时停止新增该参数，记录 TODO，不得猜测。
8. 不要重写已经稳定的模块来解决局部 UI 问题。
9. 对公共类型和复杂规则写简洁注释，避免注释复述代码。
10. 每完成一个阶段，运行类型检查、测试、目录审计和生产构建。
11. 不得宣称某编码器在用户机器上一定可用。
12. 不得把“推荐值”写成绝对最佳值。
13. 不得自动执行或下载 FFmpeg。
14. 不得引入后端，除非收到新的明确需求。

---

## 26. 第一轮具体任务

收到本指令后，先不要批量制作参数页面。按以下顺序完成第一轮工作：

1. 检查现有仓库结构和依赖。
2. 阅读 `docs/FFmpegFreeUI_参数树与网页首版裁剪方案.md`。
3. 阅读 FFmpegFreeUI 中与视频编码器数据库、音频编码器数据库、参数面板、流控制、预设管理和命令生成有关的源码。
4. 输出一份 `docs/source-map.md`，列出源码模块与本项目模块的映射。
5. 输出 `docs/architecture.md`，具体确认本项目的分层、数据流和目录。
6. 建立 Domain Layer 的类型、Zod schema 和最小测试。
7. 建立 libx264、libx265、libsvtav1、AAC、libopus、MP4、MKV、WebM、MOV 的最小目录数据。
8. 建立 `scripts/validate-catalog.ts`。
9. 暂不制作复杂 UI，仅提供一个开发页面，能够选择编码器、质量模式和容器，并显示规范化结果和目录信息。
10. 完成后汇报：新增文件、架构决策、尚未核验的参数、测试结果和下一阶段计划。

第一轮不允许直接制作一个表面完整但底层仍靠组件判断的页面。

---

## 27. 首版验收标准

首版可以认为达到可用状态，必须同时满足：

- 同一命令可组合编码、分辨率、帧率、音频和字幕。
- 不同编码器显示不同质量范围和子参数。
- 视频 copy 与画面修改、字幕烧录之间的冲突能够解释。
- 字幕混流和字幕烧录生成不同结构的命令。
- 容器兼容错误、警告和建议能够区分。
- Bash、PowerShell 和 CMD 命令转义有测试。
- 所有正式参数都有来源。
- UI 中不存在编码器参数的大量硬编码判断。
- 命令通过 AST 生成，参数片段可以追溯。
- 目录数据可以在不修改页面组件的情况下新增编码器。
- 规则引擎和命令引擎可以脱离 React 独立测试。

以上条件未达到前，不要扩展降噪、锐化、插帧、超分和复杂滤镜。
