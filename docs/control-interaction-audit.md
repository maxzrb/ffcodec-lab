# Control Interaction Audit

> 创建于：v0.4.0 Phase 4 — Section 7
> 目的：记录 BuilderPage 中全部业务控件的交互链路审计结果
> 最终目标：不存在可点击但无效果的业务控件

---

## 审计范围

BuilderPage 中全部业务控件，包括视频编码参数、音频参数、字幕、画面、封装等所有 section 下的控件。

---

## 交互链路标准

每个业务控件必须满足：

```text
用户操作
→ ProjectConfig 更新（通过 applyFieldChange → configBinding）
→ Store 产生新状态（不可变更新）
→ normalization
→ rule evaluation
→ ResolvedBuilderView
→ Command AST
→ Shell renderer
→ 命令预览和解释面板更新
```

---

## 架构验证结果

| 检查项 | 状态 |
|--------|------|
| 所有 command-bound control 具有 configBinding | ✅ 已完成（Section 5） |
| 旧 getControlValue 回退已删除 | ✅ 已完成 |
| mapFieldIdToConfigPath 硬编码映射已删除 | ✅ 已完成（Section 8） |
| apply-field-change.ts 统一入口已创建 | ✅ 已完成 |
| React 不解析 ConfigPath | ✅ applyFieldChange 处理 |
| 复选框使用 checked 受控模式 | ✅ ParameterField.tsx |
| 复选框读取 e.target.checked | ✅ ParameterField.tsx |
| 无 defaultChecked 用法 | ✅ 全局搜索确认 |
| 布尔值使用 ?? 而非 \|\| | ✅ resolve-field.ts |
| Store 不可变更新 | ✅ JSON round-trip clone |
| Normalizer 所有清除产生通知 | ✅ normalize-config.ts |

---

## 控件清单

### Section: 输入与输出 (section.input)

| Control ID | Type | Binding | 已验证 |
|------------|------|---------|--------|
| `input.path` | text | 直接路径 | ✅ |
| `output.path` | text | 直接路径 | ✅ |
| `output.overwrite` | switch | 直接路径 | ✅ |

### Section: 视频编码 (section.video)

| Control ID | Type | Binding | 已验证 |
|------------|------|---------|--------|
| `video.mode` | select | 直接路径 | ✅ |
| `video.encoderId` | select | 直接路径 | ✅ |
| `video.preset` | select | 直接路径 | ✅ |
| `video.profile` | select | 直接路径 | ✅ |
| `video.tune` | select | 直接路径 | ✅ |
| `video.pixelFormat` | select | 直接路径 | ✅ |
| `video.rateControl.mode` | select | 直接路径 | ✅ |
| `video.rateControl.qualityValue` | number | configBinding (编码器控件) | ✅ |
| `video.rateControl.bitrate` | text | configBinding (编码器控件) | ✅ |
| `video.rateControl.maxRate` | text | configBinding (编码器控件) | ✅ |
| `video.rateControl.bufferSize` | text | configBinding (编码器控件) | ✅ |
| NVENC spatial AQ | switch | specialParameters (动态) | ⚠️ 见下方 |
| NVENC temporal AQ | switch | specialParameters (动态) | ⚠️ 见下方 |
| NVENC look-ahead | number | specialParameters (动态) | ⚠️ 见下方 |

### Section: 画面参数 (section.frame)

| Control ID | Type | Binding | 已验证 |
|------------|------|---------|--------|
| `frame.resolution.mode` | select | 直接路径 | ✅ |
| `frame.resolution.width` | number | 直接路径 | ✅ |
| `frame.resolution.height` | number | 直接路径 | ✅ |
| `frame.frameRate.mode` | select | 直接路径 | ✅ |
| `frame.frameRate.value` | number | 直接路径 | ✅ |

### Section: 音频参数 (section.audio)

| Control ID | Type | Binding | 已验证 |
|------------|------|---------|--------|
| `audio.mode` | select | 直接路径 | ✅ |
| `audio.encoderId` | select | 直接路径 | ✅ |
| `audio.bitrate` | text/select | 直接路径 | ✅ |
| `audio.channelLayout` | text | 直接路径 | ✅ |
| `audio.sampleRate` | select | 直接路径 | ✅ |

### Section: 字幕 (section.subtitle)

| Control ID | Type | Binding | 已验证 |
|------------|------|---------|--------|
| 字幕轨道动态字段 | 多种 | track-aware 动态路径 | ✅ |
| `subtitle.burn.enabled` | switch | 直接路径 | ✅ |
| 字幕烧录样式字段 | text/number | 直接路径 | ✅ |

### Section: 封装设置 (section.container)

| Control ID | Type | Binding | 已验证 |
|------------|------|---------|--------|
| `output.containerId` | select | 直接路径 | ✅ |

---

## 已知问题和解决方案

### ⚠️ 特殊参数 (specialParameters) 写入路径

**问题**：NVENC 的 spatial AQ、temporal AQ、look-ahead 等特殊参数通过 `video.specialParameters` 对象写入，路径为动态字符串（如 `video.specialParameters.h264_nvenc.spatialaq`）。

**当前状态**：resolve-section.ts 中 specialParameters 字段使用 `video.specialParameters.${sp.id}` 作为 configPath，BuilderPage 通过 `applyFieldChange` 的 `isValidDynamicPath` 识别此模式。

**命令构建器**：command-builder.ts 遍历 `config.video.specialParameters` 对象的 entries，直接输出 key-value 对到命令中。

**风险**：specialParameters 的 key 使用下划线格式（如 `spatial_aq`），但 config 中的 key 来自 `sp.id`（如 `h264_nvenc.spatialaq`）。写入路径和读取路径不一致。

**解决方案**：需要统一 specialParameters 的写入和读取路径。建议在 Store 或 Command Builder 中统一 key 格式。标记为待修复（v0.4.0）。

### ⚠️ 视频编码器切换后 specialParameters 清理

**问题**：normalizer 在编码器切换时清除 `video.specialParameters`（设为 `{}`），但 store 的 `setByPath` 通过 JSON round-trip 处理。如果 specialParameters 在写入时使用了错误的 key 格式，normalizer 清除可能不完整。

**当前状态**：Normalizer 产生正确通知，清除逻辑正常。

---

## 复选框专项审计

### ParameterField switch 控件审计

```tsx
// src/pages/builder/components/ParameterField.tsx:147-158
case 'switch':
  return (
    <label>
      <input
        type="checkbox"
        checked={Boolean(field.value)}       // ✅ 受控组件
        onChange={(e) => onChange(e.target.checked)}  // ✅ 读取 .checked
        disabled={disabled}
      />
    </label>
  )
```

| 检查项 | 结果 |
|--------|------|
| 使用 checked 而非 defaultChecked | ✅ |
| 使用 e.target.checked 而非 e.target.value | ✅ |
| 不存在同时使用 checked 和 defaultChecked | ✅ |
| 不存在 DOM 内部状态作为业务事实来源 | ✅ |
| Boolean(field.value) 正确处理 false/undefined/null | ✅ |

### false 值处理审计

| 文件 | 模式 | 结果 |
|------|------|------|
| resolve-field.ts:46 | `readConfigValue(config, configPath) ?? ctrl.defaultValue` | ✅ `??` 正确 |
| resolve-field.ts:79 | `readConfigValue(config, configPath) ?? param.defaultValue` | ✅ `??` 正确 |
| ParameterField.tsx:152 | `Boolean(field.value)` | ✅ 显式转换 |
| normalize-config.ts | 直接比较值 | ✅ 无 `\|\|` 模式 |
| command-builder.ts | 直接读取值 | ✅ 无 `\|\|` 模式 |

### Store 不可变更新审计

| 操作 | 方法 | 结果 |
|------|------|------|
| setConfigValue | JSON round-trip clone | ✅ 新引用 |
| applyConfigPatch | 展开运算符 | ✅ 新引用 |
| toggleSection | 展开运算符 | ✅ 新引用 |
| resetSection | 展开运算符 | ✅ 新引用 |
| setEncoderCache | 展开运算符 | ✅ 新引用 |

### Normalization 通知审计

| 清除操作 | 是否产生通知 | 结果 |
|----------|-------------|------|
| preset 无效 → 默认值 | ✅ normalization notice | ✅ |
| profile 无效 → 默认值 | ✅ normalization notice | ✅ |
| tune 无效 → 默认值 | ✅ normalization notice | ✅ |
| pixelFormat 无效 → 默认值 | ✅ normalization notice | ✅ |
| rateControl mode 无效 → 默认值 | ✅ normalization notice | ✅ |
| qualityValue 超出范围 → 默认值 | ✅ normalization notice | ✅ |
| specialParameters 编码器切换 → 清空 | ✅ normalization notice | ✅ |

---

## 审计结论

1. **复选框和开关控件**：实现正确，无 bug。
2. **configBinding 迁移**：全部 22 个 quality mode controls 已完成迁移，旧回退已删除。
3. **架构收口**：`mapFieldIdToConfigPath` 硬编码映射已删除，替换为 `applyFieldChange`。
4. **specialParameters**：写入路径和命令读取路径存在不一致风险，需要统一。
5. **未实现控件**：当前无未实现但可点击的控件。

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v0.4.0-dev | 2026-07-10 | 初始创建，完成全量审计 |
