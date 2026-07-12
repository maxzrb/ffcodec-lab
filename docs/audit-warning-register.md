# Audit Warning Register

> 创建于：v0.4.0 Phase 4 — Section 4
> 审计标准：0 errors, 0 unregistered warnings
> 最新审计结果：0 errors, 0 warnings (全部 5 条 warning 已于 Section 5 修复)

---

## Warning 清单

| # | ID | 编码器 | 状态 | 目标版本 |
|---|-----|--------|------|----------|
| 1 | `W001-libx264-configbinding` | libx264 | ✅ RESOLVED (v0.4.0) | v0.4.0 |
| 2 | `W002-libx265-configbinding` | libx265 | ✅ RESOLVED (v0.4.0) | v0.4.0 |
| 3 | `W003-libsvtav1-configbinding` | libsvtav1 | ✅ RESOLVED (v0.4.0) | v0.4.0 |
| 4 | `W004-aac-configbinding` | aac | ✅ RESOLVED (v0.4.0) | v0.4.0 |
| 5 | `W005-libopus-configbinding` | libopus | ✅ RESOLVED (v0.4.0) | v0.4.0 |

---

## 详细记录

### W001 — libx264 缺少 configBinding

```yaml
id: W001-libx264-configbinding
message: 'Encoder "libx264" has no controls with configBinding (legacy fallback in use)'
affectedIds:
  - libx264
  - libx264 的 controls[] 中所有 command-bound control
reason: |
  第三阶段引入 configBinding 模型供 NVENC 和 FLAC 使用，但 libx264 的 controls
  尚未迁移。当前通过 Command Builder 中的旧 getControlValue 回退逻辑读取值，
  使用基于 control ID 的模式匹配推断配置路径。
introducedVersion: v0.3.0 (configBinding 模型引入时遗留)
resolutionPlan: |
  在第四阶段 Section 5 中完成为 libx264 所有 command-bound control 添加
  configBinding，并删除旧模式匹配回退逻辑。
targetVersion: v0.4.0
sourceRefs:
  - file: src/data/encoders/video/libx264.ts
    note: encoder definition with controls array
  - file: src/domain/command/command-builder.ts
    note: legacy getControlValue fallback
  - file: scripts/validate-catalog.ts
    note: checkConfigBinding() audit rule
```

### W002 — libx265 缺少 configBinding

```yaml
id: W002-libx265-configbinding
message: 'Encoder "libx265" has no controls with configBinding (legacy fallback in use)'
affectedIds:
  - libx265
  - libx265 的 controls[] 中所有 command-bound control
reason: |
  同 W001。libx265 的 controls 尚未迁移到 configBinding 模型。
introducedVersion: v0.3.0
resolutionPlan: |
  在第四阶段 Section 5 中完成为 libx265 所有 command-bound control 添加
  configBinding。
targetVersion: v0.4.0
sourceRefs:
  - file: src/data/encoders/video/libx265.ts
    note: encoder definition with controls array
  - file: src/domain/command/command-builder.ts
    note: legacy getControlValue fallback
```

### W003 — libsvtav1 缺少 configBinding

```yaml
id: W003-libsvtav1-configbinding
message: 'Encoder "libsvtav1" has no controls with configBinding (legacy fallback in use)'
affectedIds:
  - libsvtav1
  - libsvtav1 的 controls[] 中所有 command-bound control
reason: |
  同 W001。libsvtav1 的 controls 尚未迁移到 configBinding 模型。
introducedVersion: v0.3.0
resolutionPlan: |
  在第四阶段 Section 5 中完成为 libsvtav1 所有 command-bound control 添加
  configBinding。
targetVersion: v0.4.0
sourceRefs:
  - file: src/data/encoders/video/libsvtav1.ts
    note: encoder definition with controls array
  - file: src/domain/command/command-builder.ts
    note: legacy getControlValue fallback
```

### W004 — AAC 缺少 configBinding

```yaml
id: W004-aac-configbinding
message: 'Encoder "aac" has no controls with configBinding (legacy fallback in use)'
affectedIds:
  - aac
  - aac 的 controls[] 中所有 command-bound control
reason: |
  同 W001。AAC 音频编码器的 controls 尚未迁移到 configBinding 模型。
introducedVersion: v0.3.0
resolutionPlan: |
  在第四阶段 Section 5 中完成为 aac 所有 command-bound control 添加
  configBinding。
targetVersion: v0.4.0
sourceRefs:
  - file: src/data/encoders/audio/aac.ts
    note: encoder definition with controls array
  - file: src/domain/command/command-builder.ts
    note: legacy getControlValue fallback
```

### W005 — libopus 缺少 configBinding

```yaml
id: W005-libopus-configbinding
message: 'Encoder "libopus" has no controls with configBinding (legacy fallback in use)'
affectedIds:
  - libopus
  - libopus 的 controls[] 中所有 command-bound control
reason: |
  同 W001。libopus 音频编码器的 controls 尚未迁移到 configBinding 模型。
introducedVersion: v0.3.0
resolutionPlan: |
  在第四阶段 Section 5 中完成为 libopus 所有 command-bound control 添加
  configBinding。
targetVersion: v0.4.0
sourceRefs:
  - file: src/data/encoders/audio/libopus.ts
    note: encoder definition with controls array
  - file: src/domain/command/command-builder.ts
    note: legacy getControlValue fallback
```

---

## 治理规则

1. **登记要求**：每条 warning 必须有稳定 ID、影响对象、保留原因、解决计划、目标版本。
2. **禁止无限期标记**：所有 warning 必须在指定目标版本内修复，不得跨版本无限期遗留。
3. **禁止关闭审计规则**：不得通过修改审计脚本来消除 warning 输出。
4. **可修复即修复**：如果 warning 在当前阶段可以修复，应直接修复而非仅登记。
5. **新 warning 必须登记**：任何新增的预期 warning 必须在本文档中登记后方可合入。

---

## 版本历史

### 2026-07-12 — 高级参数审计扩展

- 带 `tier: advanced` 的编码器控件必须是 optional，禁止目录默认值自动进入命令。
- 高级控件必须具有控件级 FFmpegFreeUI 来源、合法 `configBinding` 和显式命令前缀。
- `project-derived` 不再因缺少官方交叉验证产生阻断或 warning。
- schema v4 色彩处理控件必须绑定 `video.color.*`；转换仍只能进入统一 `filter.chain`，不得创建第二个 `-vf`。
- 第二批质量控件继续要求 optional、控件级来源、合法 configBinding/commandBinding；默认配置不得发射 level、AQ、前瞻、场景切换、参考帧、extbrc 或 QVBR 参数。

| 版本 | 日期 | 变更 |
|------|------|------|
| v0.4.0-dev | 2026-07-10 | 初始创建，登记 5 条 configBinding 遗留 warning |
| v0.4.0-dev | 2026-07-10 | Section 5 全量迁移完成：5 条 warning 全部修复，旧 getControlValue 回退逻辑删除，审计升级为 error |
