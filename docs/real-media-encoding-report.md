# FFCodec Lab 真实媒体压制验证报告

验证时间：2026-08-06

## 结论

本轮不是只检查命令文本，而是把 `ProjectConfig` 依次送入规范化、诊断、命令 AST 和 `ExecutionPlan`，随后用真实 FFmpeg 执行。每个成功输出都经过 ffprobe 流结构断言，并用 FFmpeg `-xerror` 完整解码全部音视频流。

三套 FFmpeg 最终结果合计：

- PASS：58
- SKIP：21（本机没有 NVIDIA/Intel 编码设备，AMD RX 6600 不支持 AV1 AMF）
- FAIL：0

测试构建：

- FFmpeg `8.1.2-full_build-www.gyan.dev`
- FFmpeg `9.0-full_build-www.gyan.dev`
- Full 候选 `git-2026-08-06-fc02470c62`

## 输入素材

| 文件 | 实际结构 | 主要用途 |
|---|---|---|
| `TSU_1920x1080.mp4` | HEVC Main、1920×1080、约 60 fps、无音频 | HEVC 解码、H.264/HEVC/AV1 转码、视频-only |
| `TheaterSquare_1280x720.mp4` | H.264 High、1280×720、约 60 fps、无音频 | 单视频、多遍、滤镜、字幕烧录、无色彩标签输入 |
| `rough_cut_30s.mkv` | H.264 + DTS-HD MA 5.1 + AC-3 stereo + 4×PGS | 多音轨、响度/重采样、PGS、remux、元数据 |

测试脚本会在系统临时目录生成三秒短夹具，并把前两段视频与 rough_cut 的音轨/字幕组合成 `2V + 2A + 4S` 多流夹具；不修改或提交原始素材。

## 覆盖范围

每套 FFmpeg 执行以下 16 个 CPU/通用场景：

1. HEVC 输入转 libx264，包含 CRF、GOP、B 帧、缩放、降帧、调整和自定义滤镜。
2. H.264 输入转 libx265 Main10，验证 10-bit 输出。
3. H.264 输入转 SVT-AV1。
4. Windows 绝对路径外挂 ASS 字幕烧录。
5. 传统 libx264 双遍码率编码，验证两条 ExecutionPlan。
6. 从第二音轨提取 AAC，重采样到 44.1 kHz 并转单声道。
7. 视频转码、两条音频统一 AAC、四条 PGS 原样保留。
8. 视频/音频/字幕全流 copy remux，并验证全局及流级元数据。
9. `2V + 2A + 4S` 中逐流混合 encode/copy、视频/音频独立滤镜。
10. 两条视频和两条音频分别使用不同冻结快照。
11. 显式选择第二视频、第二音频和第三字幕流。
12. 目标文件大小工具驱动的双遍编码。
13. 高精度滤镜链：裁剪、锐化、降噪、去色带、调整和色彩标签。
14. 源色彩标签完整时执行 zscale 转换。
15. 源色彩标签缺失时执行 libplacebo 转换。
16. preserve-all 同时配置单条字幕，验证不重复 map 且其余 PGS 由全局 copy 兜底。

另有四项产品安全审计：

- 已探测到源色彩标签缺失时阻止必败的 zscale 转换。
- 阻止 PGS 等位图字幕转 mov_text/SRT/ASS 等文本字幕编码。
- 阻止多视频编码任务使用当前没有逐流 passlog 语义的传统双遍。
- preserve-all 配置部分字幕时仍生成全局 `-c:s copy`，且逐流覆写排在其后。

硬件矩阵逐套探测并尝试 9 种编码器：三种 NVENC、三种 QSV、三种 AMF。本机实际通过 `h264_amf` 与 `hevc_amf`；NVENC/QSV 因设备不存在跳过，`av1_amf` 因 RX 6600 不支持而跳过。

## 测试发现并修复的问题

1. Windows 外挂字幕路径未按 filtergraph 语法转义，`C:\...` 会被错误解析；现转换为 `C\:/...`。
2. `ass` 滤镜不支持 `force_style`，旧命令会直接失败；现只为 `subtitles` 滤镜生成样式覆写。
3. 自动高精度但缺少输入探针时无条件插入 zscale 抖动；对无色彩标签输入可能触发 zimg `no path between colorspaces`。现仅在能证明发生降位时插入抖动。
4. ffprobe 摘要此前只保存像素格式和尺寸，无法保护 zscale；现同时保存 range、matrix、primaries、transfer，并在已知缺失时阻止转换。
5. PGS 位图字幕转文本编码没有诊断；现提前阻止。
6. preserve-all 配置部分字幕时，既会漏掉其他 PGS 的 copy 兜底，又会重复 map 已配置字幕；两项均已修复。
7. 显式多视频流传统双遍没有安全语义；现提前阻止。

## 已知环境限制

- 当前机器没有 NVIDIA 或 Intel 编码设备，因此 NVENC/QSV 只能验证注册项和初始化失败路径，不能声称真实硬件编码通过。
- AMD RX 6600 可完成 H.264/HEVC AMF，但不支持 AV1 AMF。
- 在 FFmpeg 8.1.2 Gyan 构建中，同一进程同时运行 libx264 与 libx265 两个输出编码器会发生原生访问冲突；两条 libx264 的不同逐流快照稳定通过，单独 libx264/libx265 也都通过。这是特定 FFmpeg/外部编码库组合限制，不是 FFCodec 参数作用域错误。
- 三段素材没有附件、章节和真实 HDR；附件/章节只通过现有自定义参数路径和命令单测覆盖，未作为本轮真实素材成功项计数。

## 复现命令

默认使用 PATH FFmpeg 和 assets 中的 Full 候选：

```powershell
pnpm verify:real-media
```

显式指定多个构建：

```powershell
pnpm verify:real-media -- --ffmpeg "C:\path\ffmpeg-8\bin\ffmpeg.exe" --ffmpeg "C:\path\ffmpeg-9\bin\ffmpeg.exe"
```

默认测试结束后删除全部临时输出；添加 `--keep` 可保留产物并打印目录。
