# Changelog

## v0.4.1 (2026-07-10)

### 热修复：正式 BuilderPage 复选框交互

- **specialParameters configBinding 全量覆盖**：为 10 个编码器的 31 个 specialParameter 添加 configBinding（videoSpecialParamPath / audioQualityValuePath）
- **统一读写路径**：resolve-section.ts 使用 configBinding.path 读写；command-builder.ts 遍历 encoder.specialParameters + commandBinding 生成 token
- **根本原因**：specialParameters 缺少 configBinding → applyFieldChange 静默拒绝写入；getByPath 无法读取 flat Record 中的 dot-key
- **apply-field-change 回退扩展**：isValidDynamicPath 兼容标准 config path 前缀
- **resolveSwitchField/resolveTextField**：支持 configBinding 参数
- **config-path.ts**：新增 videoSpecialParamPath(), audioQualityValuePath(), extractConfigKey()

### Playwright 移除

- Playwright 不再属于项目依赖、默认检查或发布阻断项
- 删除 playwright.config.ts、e2e/ 目录、npm playwright 包
- 迁移为 Vitest + React Testing Library 集成测试

### 测试

- **集成测试**：新增 6 个 RTL 测试（builder-checkboxes.test.tsx），覆盖 NVENC/QSV/libopus checkbox 交互
- **特殊参数命令测试**：新增 libopus、FLAC、NVENC 与 QSV 的稳定配置键和布尔值映射测试
- **总计**：255/255 测试通过（15 文件，+10 vs v0.4.0）
- **修正**：qsv.test.ts 使用新 configKey

### 补充修正

- 补齐 libopus application/frameDuration 与 FLAC sampleFormat 的 configBinding
- NVENC/QSV 布尔参数输出 1/0，libopus VBR 输出 on/off
- 移除 NVENC defaultArguments 与 specialParameter 产生的重复 `-spatial_aq`
- 目录审计升级为逐项检查所有质量控件和特殊参数的 configBinding

### 已知限制

- 旧 preset/specialParameters 无迁移路径 — 当前无旧数据

---

## v0.4.0 (2026-07-10)

### 架构收口

- **configBinding 全量迁移**：22 个 controls 完成 configBinding，旧 `getControlValue` 模式匹配回退逻辑已删除
- **统一字段变更入口**：新增 `apply-field-change.ts`，React 组件不再解析 ConfigPath
- **目录审计**：0 errors, 0 warnings（5 条 V0.3.0 遗留 warning 全部修复）
- **审计升级**：缺少 configBinding 从 warning 升级为 error

### 交互完整性

- **全量控件审计**：`docs/control-interaction-audit.md` 记录全部业务控件
- **交互调试面板**：`?debugInteractions=1` 启用，追踪每次操作的完整链路
- **控件契约测试**：56 个自动化测试覆盖 binding 完整性/类型兼容/值往返
- **复选框专项**：确认使用 `checked`/`e.target.checked`/`??` — 全部正确

### PresetManager UI

- **预设管理界面**：查看/应用/创建/另存为/覆盖/重命名/删除
- **JSON 导入导出**：Zod 验证 + migration + 非法整体拒绝
- **5 个内置预设**：H.264 日常/H.265 高质量/AV1 节省空间/视频流复制/仅提取音频
- **预设摘要**：catalog-driven，零硬编码

### Intel QSV 编码器

- **h264_qsv**：6 种质量模式 (CQP/ICQ/LA_ICQ/VBR/CBR/LA_VBR)
- **hevc_qsv**：6 种质量模式 + HEVC 专用特性
- **与 NVENC 完全独立**：独立 preset/profile/pixelFormat 值，独立质量模式 ID
- **可用性说明**：细粒度硬件代际需求 (Sandy Bridge/Broadwell/Haswell/Skylake)
- **环境提示不阻止复制**：hardware-dependent 编码器仅提示

### 测试

- **单元测试**：245 个（+108 vs v0.3.0）
- **控件契约测试**：56 个
- **QSV 测试**：28 个
- **E2E 测试**：18 个 Playwright 场景（代码就绪）

### 文档

- `docs/control-interaction-audit.md` — 控件审计清单
- `docs/audit-warning-register.md` — Warning 登记和治理
- `docs/phase4-acceptance.md` — 14 个人工验收案例
- `docs/user-guide.md` — 用户指南
- `docs/encoder-availability.md` — 编码器可用性矩阵
- `docs/qsv-source-map.md` — QSV 来源映射和参数详解
- `CHANGELOG.md` — 本文件

### 架构不变

- Domain Layer 零 React 依赖
- 所有命令通过 Command AST
- 所有参数携带 originId
- 预设/分享不存储命令文本
- React 中无 FFmpeg 业务硬编码
- 零 `as any` / `@ts-ignore`

---

## v0.3.0 (2026-07-10)

- NVENC 编码器 (h264_nvenc + hevc_nvenc)
- FLAC 无损音频
- 多字幕轨道 (SubtitleTrackConfig[] + -c:s:N + -disposition:s:N)
- 配置迁移模块 (migrateConfig)
- 诊断修复建议 (buildFixSuggestions + applyFix)
- 可分享配置 (ShareableProjectConfig + URL hash)
- 目录审计扩展 (11 新检查)
- 137 单元测试

---

## v0.2.0 (2026-07-10)

- 正式 BuilderPage (参数区域 + 命令预览)
- 字段解析层 (ResolvedField/ResolvedSection/ResolvedBuilderView)
- 解释系统 (ExplanationPanel)
- 命令预览 (Bash/PowerShell/CMD + token 点击定位)
- 预设服务 (CRUD + import/export + migration)
- 76 单元测试
- 10/10 验收配置通过

---

## v0.1.0 (2026-07-10)

- 首轮开发
- 项目骨架: Vite 5 + React 18 + TS strict + Zustand + Zod + Vitest
- Domain Layer (18 文件): ProjectConfig, Catalog, RuleExpression, Command AST
- Data Layer (10 文件): libx264/libx265/libsvtav1 + AAC/libopus + 容器兼容矩阵
- 33 单元测试
- DevVerificationPage
