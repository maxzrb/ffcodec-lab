# Source Map — FFmpegFreeUI → 本项目模块映射

> 映射依据：Lake1059/FFmpegFreeUI 主分支 v6 系列源码，快照日期 2026-07-10
> 本项目仓库：FFCodec Lab (`d:\pyprogram\FFCodec Lab`)

## 数据源模块映射

| FFmpegFreeUI 源文件 | 本项目模块 | 说明 |
|---|---|---|
| `src/databases/video-encoders.json` | `src/data/encoders/video/` | 视频编码器能力定义（libx264, libx265, libsvtav1, …） |
| `src/databases/audio-encoders.json` | `src/data/encoders/audio/` | 音频编码器能力定义（AAC, libopus, …） |
| `src/databases/containers.json` | `src/data/containers/` | 容器兼容性矩阵 |
| `src/databases/subtitle-codecs.json` | `src/data/parameters/` | 字幕编码器映射 |
| `src/panels/video-encoder.js` | `src/data/parameters/` | 视频编码器选择参数定义 |
| `src/panels/audio-encoder.js` | `src/data/parameters/` | 音频编码器选择参数定义 |
| `src/panels/output-settings.js` | `src/data/parameters/` | 容器、覆盖参数定义 |
| `src/panels/video-quality.js` | `src/data/encoders/video/` | 质量控制模式选项（CRF 范围、VBR 参数） |

## 参数结构映射

| FFmpegFreeUI 参数概念 | 本项目结构 |
|---|---|
| 参数导航树（独立模块页面） | `ResolvedWorkspaceView.panels` + `uiPlacement` |
| 参数能力树（编码器→子参数） | `EncoderDefinition.{preset,profile,tune,pixelFormat,qualityModes}` |
| 依赖规则图（跨分支联动） | `RuleDefinition.when/effects` + `RuleExpression` AST |
| 参数解释文本 | `ExplanationDefinition`（独立数据层） |
| 来源引用 | `SourceRef`（每个参数必含） |
| 编码器数据库附加信息 | `EncoderDefinition.capabilities/availabilityNote` |

## 规则映射

| FFmpegFreeUI 联动逻辑 | 本项目规则ID |
|---|---|
| 视频 copy → 隐藏质量控制/分辨率/帧率/烧录 | `R01.video.copy.disable` |
| 视频 -vn → 隐藏全部视频参数 | `R02.video.disabled.hide` |
| 音频 copy → 隐藏音频码率/质量 | `R03.audio.copy.disable` |
| 音频 -an → 隐藏全部音频参数 | `R04.audio.disabled.hide` |
| 编码器变化 → 清除无效参数 | `R05.encoder.change.clear` |
| 质量模式切换 → 清除其他模式值 | `R06.quality.mode.exclusive` |
| 分辨率/帧率修改 vs copy 冲突 | `R07.resolution.vs.copy` |
| 烧录字幕 vs copy 冲突 | `R08.burn.vs.copy` |
| MP4/MOV 字幕 auto → mov_text | `R12.mp4.subtitle.movtext` |
| WebM 字幕 auto → webvtt | `R13.webm.subtitle.webvtt` |
| 显式不兼容组合 → error | `R15.incompatible.combo` |

## 2026-07-12 高级参数增量映射

| FFmpegFreeUI v6 源文件 | 本项目能力 |
|---|---|
| `Form_v6_参数面板_质量.vb` | GOP、B 帧、最小关键帧间隔、qmin/qmax/qcomp 目录控件 |
| `Form_v6_参数面板_色彩管理.vb` | 输出色彩范围、矩阵、原色、传输特性 |
| `Form_v6_参数面板_降噪.vb` | hqdn3d、nlmeans、atadenoise、bm3d 参数与范围 |
| `Form_v6_参数面板_平滑断层.vb` | deband、gradfun 参数与范围 |

这些条目标记为 `sourceAuthority: ffmpegfreeui` 和 `verificationLevel: project-derived`，可以进入生产目录，不以官方交叉验证作为构建前置条件。

## 暂未映射的 3FUI 功能（第二轮以后）

| 3FUI 功能 | 原因 |
|---|---|
| 图片编码器数据库 | 首版只覆盖视频压制 |
| 硬件编码器 (NVENC/QSV/AMF) | 架构已支持，数据待补充（需核验） |
| zscale/libplacebo 转换与 HDR 色调映射 | 首批只实现输出色彩标记，像素转换后续专项完成 |
| 视频帧服务器 (AviSynth/VapourSynth) | 首版暂缓 |
| 降噪/锐化/超分/插帧滤镜 | 首版暂缓 |
| filter_complex | 首版不支持 |
| 章节/附件 | 首版暂缓 |
| 批处理/任务队列 | 首版不支持 |
| 完全自写命令模式 | 首版仅支持受控插槽自定义参数 |

## 参数核验结论（2026-07-10 核验）

| 参数 | 编码器 | 核验结论 | 来源 | 版本差异 |
|---|---|---|---|---|
| libx264 CQP 范围 0~69 | libx264 | ✅ 已确认 | `x264.h` — `i_qp_constant` 范围 0-69 | 无 |
| libsvtav1 QP 范围 0~63 | libsvtav1 | ✅ 已确认 | SVT-AV1 v1.x 文档 — `qp` 范围 0-63 | SVT-AV1 v3.x 待核验 |
| libsvtav1 preset 0~13 | libsvtav1 | ✅ 已确认 | SVT-AV1 v1.x 文档 — preset 0-13 | **重要**：v2.x 已重构为 0-9，v3.x 已进一步调整 |
| libopus frame_duration | libopus | ✅ 已修正 | FFmpeg `libopusenc.c` — 仅暴露 2.5/5/10/20/40/60ms | 原 3FUI 建模为连续范围错误，已改为六值枚举 |
| AAC aac_coder 选项 | aac | ✅ 已确认 | FFmpeg `aacenc.c` — 支持 twoloop/fast/anmr | `anmr` 标记为实验性，新增到选项列表 |

## 来源优先级（用于后续核验）

1. FFmpegFreeUI 当前源码 — 继承产品结构、参数选项和联动逻辑
2. FFmpeg 官方 encoder help / filters 文档 — 核对实际参数语义
3. 编码器官方文档 — 核对范围和版本差异
4. 人工经验值 — 仅标记为"经验建议"，不冒充参数规范
