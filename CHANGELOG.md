# Changelog

## v0.8.0 (2026-07-19)

### 双遍编码修复

- 第一遍改为视频分析专用的 null 输出，不再编码音频、字幕或写入真实成品。
- Bash/CMD 继续使用成功条件连接；PowerShell 改用兼容 Windows PowerShell 5.1 与 PowerShell 7 的 `$LASTEXITCODE` 判断。
- 加强命令单元测试，并新增真实 FFmpeg 双遍烟测。

### 目标文件大小工具

- 左侧导航新增「实用工具」，首个功能可按目标 MiB、完整时长、封装预留和音频预算派生视频平均码率。
- 使用 libx264/libx265 双遍编码近似目标大小；支持多条显式音轨的码率预算和手动音频总预算。
- 工具启用时临时接管质量控制，不改写原设置；关闭后恢复原 CRF/码率模式。
- 对视频复制、不支持双遍的编码器、多视频流、未知音频预算和冲突自定义参数提供阻断诊断。
- 配置与隐私安全分享载荷升级至 schema v6，旧配置默认关闭工具并保持原命令不变。

### 验证

- ESLint、TypeScript、371 项 Vitest、目录审计 0/0、10/10 代表性命令验收、FFmpeg 8.1.1 实机烟测 5/5 和生产构建全部通过。

## v0.5.1 (2026-07-11)

### 稳定性修复

- 修复自定义参数 textarea 绕过类型转换后把数组写成字符串、导致正式页面整体崩溃的问题。
- 动态字段与显式绑定字段现在统一执行类型转换；数值下拉框会恢复 number 类型。
- 移除正式页面全部“尚未交叉核验”提示，不改变内部来源审计数据。

### 音频与流选择

- 声道布局改为包含跟随输入、mono、stereo、2.1、3.0、quad、5.1、5.1(side)、7.1 的下拉框，并生成 `-channel_layout:a`。
- 采样率扩展为跟随输入及 8000–192000 Hz 共 14 个选项。
- 视频、音频和内置字幕均可独立选择“保留全部流”或仅保留指定索引；修复仅选择保留字幕时不触发显式映射的问题。

### 显示偏好

- 默认启用亮色模式，提供可持久化的暗色模式切换。
- 新配置默认使用 PowerShell，并以单行方式显示命令。
- 自动化测试增至 302 项，目录审计保持 0 错误、0 警告。

## v0.5.0 (2026-07-11)

### 成品化与正式页面交互修复

- 修复所有特殊参数以及预设、档次、场景优化、像素格式等正式页面控件的统一写入绑定。
- 编码器切换后执行完整规范化，清理旧编码器残留参数并自动选择有效质量模式。
- 新增覆盖全部编码器和高级功能的正式页面字段写入契约测试。

### 功能扩展

- 新增 AMD AMF 与 Apple VideoToolbox H.264/HEVC 编码器，视频编码器总数增至 11 个。
- 新增裁剪、旋转、镜像、画面调整、YADIF 去隔行和锐化滤镜，统一生成单一 `-vf` 链。
- 完善字幕轨道增删、外挂流索引、听障标记与常用 ASS 样式。
- 新增显式流映射、六阶段自定义参数、浏览器持久化和隐私安全 URL Hash 分享。

### UI 与发布质量

- 正式页面重构为响应式深色工作台，统一卡片、开关、命令预览、弹窗和移动端布局。
- 新增 README，更新用户指南和验收报告；移除默认 Vite 占位资源。
- 补齐 ESLint 配置并纳入 `npm run check`。
- 验收结果：297 项测试通过，目录审计 0 错误/0 警告，10/10 代表性配置通过，生产构建成功。

### 已知限制

- 硬件编码器实际可用性依赖本机 GPU、驱动和 FFmpeg 构建。
- 尚未提供 HDR 色调映射、完整色彩管理和时间轴式 ASS 编辑器。
- 当前环境无可用应用内浏览器实例，视觉结果已由代码审查、响应式样式和组件测试覆盖，仍建议在目标浏览器进行一次人工巡检。

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
