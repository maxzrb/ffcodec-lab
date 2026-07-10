# Phase 4 Acceptance — v0.4.0

> 14 个人工验收案例，覆盖第四阶段全部核心功能。

---

## 案例 1：修复前失效的视频参数复选框

**类型**：控件交互

| 项目 | 内容 |
|------|------|
| 修改前值 | 无（v0.3.0 中部分复选框点击无效果） |
| 修改后值 | true/false 正常切换 |
| binding | 所有 quality mode controls 已完成 configBinding |
| AST 参数变化 | 复选框对应的参数正确出现/消失 |
| 最终命令变化 | 用户可观察到命令预览中的参数变化 |
| 验收结论 | ✅ PASS — 全部控件通过契约测试验证 |

---

## 案例 2：NVENC spatial AQ 开关

**类型**：控件交互

| 项目 | 内容 |
|------|------|
| ProjectConfig | h264_nvenc, defaultArguments 包含 `-spatial_aq 1` |
| 用户操作 | 点击 spatial AQ 复选框关闭 |
| ResolvedBuilderView | field.value = false, field.controlType = switch |
| 规范化通知 | 无（合法操作） |
| 配置诊断 | 无错误 |
| Command AST | `-spatial_aq` 参数不出现 |
| Bash 命令 | `ffmpeg -i input.mp4 -c:v h264_nvenc -preset p4 -rc vbr -cq 23 output.mp4` |
| 验收结论 | ✅ PASS |

---

## 案例 3：分辨率保持宽高比和禁止放大

**类型**：控件交互

| 项目 | 内容 |
|------|------|
| ProjectConfig | frame.resolution.mode = "source" |
| 用户操作 | 切换到 width 模式，设置宽度 1920 |
| ResolvedBuilderView | width 字段可见，height 隐藏 |
| 规范化通知 | 无 |
| Command AST | `-vf scale=1920:-2` |
| Bash 命令 | 包含 `-vf scale=1920:-2` |
| 验收结论 | ✅ PASS |

---

## 案例 4：字幕默认和强制轨道

**类型**：控件交互

| 项目 | 内容 |
|------|------|
| ProjectConfig | subtitle.tracks[0], disposition.default = false |
| 用户操作 | 开启 "默认轨道" |
| 修改后值 | disposition.default = true |
| binding | `subtitle.tracks.<id>.disposition.default` |
| AST 参数变化 | `-disposition:s:0 default` |
| 最终命令变化 | 命令中出现 `-disposition:s:0 default` |
| 验收结论 | ✅ PASS |

---

## 案例 5：字幕烧录样式复选框

**类型**：控件交互

| 项目 | 内容 |
|------|------|
| ProjectConfig | subtitle.burn.enabled = true |
| 用户操作 | 修改字幕字号为 36 |
| ResolvedBuilderView | subtitle.burn.style.fontSize = 36 |
| 规范化通知 | 无 |
| Command AST | `subtitles=...:FontSize=36` |
| 最终命令变化 | 烧录滤镜参数反映新字号 |
| 验收结论 | ✅ PASS |

---

## 案例 6：应用并保存用户预设

**类型**：PresetManager

| 项目 | 内容 |
|------|------|
| ProjectConfig 摘要 | libx264 CRF 23 + AAC 192k + MP4 |
| 用户操作 | 打开预设管理 → 选择 H.265 高质量 → 应用 → 另存为 "我的 HEVC 预设" |
| ResolvedBuilderView 摘要 | libx265 CRF 24 + Opus 128k + MKV |
| 规范化通知 | 无（内置预设配置合法） |
| Command AST | `-c:v libx265 -crf 24 -c:a libopus -b:a 128k` |
| Bash 命令 | `ffmpeg -i input.mp4 -c:v libx265 -preset medium -crf 24 -c:a libopus -b:a 128k output.mkv` |
| 验收结论 | ✅ PASS |

---

## 案例 7：MP4 + h264_qsv + ICQ + AAC

**类型**：QSV 命令生成

| 项目 | 内容 |
|------|------|
| ProjectConfig | video.encoderId=h264_qsv, mode=qsv-icq, qualityValue=23, audio.encoderId=aac, output.containerId=mp4 |
| 用户操作 | 选择 h264_qsv → 切换到 ICQ → 设置 quality 23 |
| ResolvedBuilderView | 显示 QSV ICQ 参数 |
| 规范化通知 | 无 |
| 配置诊断 | 无错误 |
| 环境可用性提示 | "QSV 可用性取决于 Intel GPU" |
| Command AST | `-c:v h264_qsv -global_quality 23 -look_ahead 1 -c:a aac` |
| Bash 命令 | `ffmpeg -i input.mp4 -c:v h264_qsv -global_quality 23 -look_ahead 1 -c:a aac -b:a 192k output.mp4` |
| 验收结论 | ✅ PASS |

---

## 案例 8：MP4 + h264_qsv + LA_ICQ

**类型**：QSV 命令生成

| 项目 | 内容 |
|------|------|
| ProjectConfig | mode=qsv-la-icq, qualityValue=20 |
| 用户操作 | 切换到 LA_ICQ → 设置 quality 20 |
| Command AST | `-c:v h264_qsv -global_quality 20 -look_ahead 1 -look_ahead_depth 40` |
| Bash 命令 | `ffmpeg -i input.mp4 -c:v h264_qsv -global_quality 20 -look_ahead 1 -look_ahead_depth 40 output.mp4` |
| 验收结论 | ✅ PASS — look_ahead_depth 从 modeArguments 输出默认值 40 |

---

## 案例 9：MKV + h264_qsv + CQP + Opus

**类型**：QSV 命令生成

| 项目 | 内容 |
|------|------|
| ProjectConfig | mode=qsv-cqp, qualityValue=18, container=mkv, audio=libopus |
| 用户操作 | 选择 MKV → h264_qsv CQP → Opus 128k |
| Command AST | `-c:v h264_qsv -qp 18 -c:a libopus -b:a 128k` |
| Bash 命令 | `ffmpeg -i input.mp4 -c:v h264_qsv -qp 18 -c:a libopus -b:a 128k output.mkv` |
| 验收结论 | ✅ PASS |

---

## 案例 10：MKV + hevc_qsv + VBR

**类型**：QSV 命令生成

| 项目 | 内容 |
|------|------|
| ProjectConfig | encoderId=hevc_qsv, mode=qsv-vbr, bitrate=8000k, maxRate=12000k, bufferSize=24000k |
| 用户操作 | 选择 hevc_qsv → VBR → 设置码率参数 |
| Command AST | `-c:v hevc_qsv -b:v 8000k -maxrate 12000k -bufsize 24000k` |
| Bash 命令 | `ffmpeg -i input.mp4 -c:v hevc_qsv -preset medium -b:v 8000k -maxrate 12000k -bufsize 24000k output.mkv` |
| 验收结论 | ✅ PASS |

---

## 案例 11：MP4 + hevc_qsv + CBR

**类型**：QSV 命令生成

| 项目 | 内容 |
|------|------|
| ProjectConfig | encoderId=hevc_qsv, mode=qsv-cbr, bitrate=5000k |
| 用户操作 | 选择 hevc_qsv → CBR → 设置码率 |
| Command AST | `-c:v hevc_qsv -b:v 5000k` |
| Bash 命令 | `ffmpeg -i input.mp4 -c:v hevc_qsv -preset medium -b:v 5000k output.mp4` |
| 验收结论 | ✅ PASS |

---

## 案例 12：QSV 模式切换清理旧参数

**类型**：Normalizer

| 项目 | 内容 |
|------|------|
| 初始状态 | h264_qsv, qsv-icq, global_quality=23 |
| 用户操作 | 切换到 h264_qsv CQP |
| 规范化通知 | "Rate control mode changed from qsv-icq to qsv-cqp" |
| 配置诊断 | 无（旧 global_quality 被清除） |
| Command AST | 只有 `-qp 23`，无 `-global_quality` |
| 验收结论 | ✅ PASS — 模式切换产生 NormalizationNotice，旧参数被正确清理 |

---

## 案例 13：保存、分享并恢复 QSV 配置

**类型**：PresetManager + Sharing

| 项目 | 内容 |
|------|------|
| 初始配置 | h264_qsv, ICQ, global_quality=23 |
| 操作 1 | 另存为 "QSV 日常" → 导出 JSON |
| 操作 2 | 恢复默认 → 确认命令变回 libx264 |
| 操作 3 | 应用 "QSV 日常" → 命令恢复 QSV ICQ |
| 操作 4 | 导入之前导出的 JSON → 应用 → 命令正确 |
| 验收结论 | ✅ PASS |

---

## 案例 14：非法 QSV 参数组合产生诊断和修复建议

**类型**：Diagnostics

| 项目 | 内容 |
|------|------|
| 配置 | h264_qsv, profile=high444, container=flv (不支持) |
| 用户操作 | 设置冲突配置 |
| 配置诊断 | 容器不兼容诊断 |
| 修复建议 | 建议切换到 MP4/MKV |
| 环境可用性提示 | QSV 可用性提示（不阻止复制） |
| Command AST | 仍然生成（availability warning 不阻止） |
| 验收结论 | ✅ PASS — 诊断产生，复制按钮可用 |

---

## 验收总结

| # | 案例 | 结果 |
|---|------|------|
| 1 | 视频参数复选框修复 | ✅ |
| 2 | NVENC spatial AQ 开关 | ✅ |
| 3 | 分辨率参数 | ✅ |
| 4 | 字幕默认和强制轨道 | ✅ |
| 5 | 字幕烧录样式 | ✅ |
| 6 | 预设应用和保存 | ✅ |
| 7 | MP4 + h264_qsv + ICQ + AAC | ✅ |
| 8 | MP4 + h264_qsv + LA_ICQ | ✅ |
| 9 | MKV + h264_qsv + CQP + Opus | ✅ |
| 10 | MKV + hevc_qsv + VBR | ✅ |
| 11 | MP4 + hevc_qsv + CBR | ✅ |
| 12 | QSV 模式切换清理 | ✅ |
| 13 | QSV 配置保存分享恢复 | ✅ |
| 14 | 非法参数诊断 | ✅ |

**全部 14 案例通过。**
