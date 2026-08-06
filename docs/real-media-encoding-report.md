# FFCodec Lab 真实媒体压制验证报告

验证时间：2026-08-06
验证设备：NVIDIA GeForce RTX 3060 Laptop GPU（6 GB，驱动 610.88）+ AMD Radeon 集成显卡

## 结论

本轮不是只检查命令文本，而是把 `ProjectConfig` 依次送入规范化、诊断、命令 AST 和 `ExecutionPlan`，再用真实 FFmpeg 执行。每个成功输出都经过 ffprobe 流结构、编码、尺寸、像素格式、色彩标签等断言，并以 FFmpeg `-xerror` 完整解码全部音视频流。

三套 FFmpeg 的最终单次矩阵共 115 项，其中 7 项产品安全审计只执行一次；本机最终实测结果为：

- PASS：100
- SKIP：15（RTX 3060 不支持 AV1 NVENC；当前设备 QSV 不可用；AMD 图形设备不支持 AV1 AMF）
- FAIL：0

跨设备复核：在 AMD Radeon RX 6600、无 NVIDIA 驱动的机器上，CUDA/NVENC 扩展场景会先检查所需编码器、设备会话与 CUDA 滤镜；不可用项记为 SKIP，不再误报产品 FAIL。PATH 8.1.2 与 Full 候选的默认矩阵为 PASS 43/79、SKIP 36、FAIL 0。

测试构建：

- FFmpeg `8.1.2-full_build-www.gyan.dev`
- FFmpeg `9.0-full_build-www.gyan.dev`
- Full 候选 `git-2026-08-06-fc02470c62`

## 输入素材

| 文件 | 实际结构 | 主要用途 |
|---|---|---|
| `TSU_1920x1080.mp4` | HEVC Main、1920×1080、约 60 fps、无音频 | HEVC 解码、H.264/HEVC/AV1 转码、视频-only |
| `TheaterSquare_1280x720.mp4` | H.264 High、1280×720、约 60 fps、无音频 | 单视频、多遍、滤镜、字幕烧录、8-bit CUDA 链 |
| `rough_cut_30s.mkv` | H.264 + DTS-HD MA 5.1 + AC-3 stereo + 4×PGS | 多音轨、响度/重采样、PGS、remux、元数据 |
| `00006.MKV` | 实际为 MPEG-TS；4K60 HDR10 HEVC Main10 + 1080p60 HDR10 HEVC Main10 + TrueHD Atmos 7.1 + AC-3 5.1 + E-AC-3 Atmos 7.1 | 10-bit 硬解、HDR 标签、CUDA/D3D11、4K60 压力、2V+3A 复杂封装 |

脚本只读取 `assets`。短夹具和编码输出全部位于系统临时目录，默认结束后自动清理；原始素材未修改、未暂存、未提交。

## 覆盖范围

每套 FFmpeg 执行 23 个真实媒体场景：

1. libx264/libx265/SVT-AV1 单流转码、CRF、GOP、B 帧、缩放、降帧和 10-bit。
2. Windows 绝对路径外挂 ASS 字幕烧录。
3. 传统 libx264 双遍与目标大小双遍。
4. 第二音轨提取、AAC 重采样/单声道。
5. 视频转码、双音频处理、四条 PGS 保留。
6. 完整 remux、元数据与章节路径。
7. `2V + 2A + 4S` 逐流 encode/copy、全快照和显式流选择。
8. 高精度 CPU 多滤镜、zscale/libplacebo 色彩转换与标签验证。
9. CUDA 硬解 HDR10 → `p010le` 下载 → 10-bit CPU 多滤镜 → HEVC NVENC。
10. D3D11VA 指定 RTX 3060 适配器 → `p010le` 下载 → CPU 高精度链 → HEVC NVENC。
11. 10-bit CUDA 设备帧双级 `scale_cuda` 零拷贝链。
12. 8-bit NV12 `scale_cuda + bilateral_cuda + colorspace_cuda` 多滤镜链。
13. CPU crop/hflip → `hwupload_cuda` → `scale_cuda` → H.264 NVENC。
14. 原始 4K60 HDR10 取 10 秒，CUDA 双级 4K 处理后使用 HEVC NVENC `fullres`，保持 3840×2160、10-bit 与 HDR10 标签。
15. 新素材 2V+3A：4K 视频转码、1080p 视频复制，并保留 TrueHD/AC-3/E-AC-3 三音轨。

硬件矩阵每套共 13 项：

- `h264_nvenc`：`disabled/qres/fullres`
- `hevc_nvenc`：`disabled/qres/fullres`
- `av1_nvenc`
- `h264_qsv/hevc_qsv/av1_qsv`
- `h264_amf/hevc_amf/av1_amf`

其中要求重点验证的 NVENC 交叉矩阵为：

`2 编码器 × 3 multipass × 3 FFmpeg 构建 = 18/18 PASS`

每一项都断言产品生成的 `-multipass`（显式流时为 `-multipass:v:N`）、实际输出编码、非空产物与完整解码。NVENC multipass 始终是单次 FFmpeg 调用内的编码器分析，不等同传统 `-pass 1/-pass 2`。

七项产品安全审计覆盖：

- 缺源色彩标签时阻止必败的 zscale 转换。
- 阻止 PGS 位图字幕转文本字幕编码。
- 阻止多视频编码任务使用当前没有逐流 passlog 语义的传统双遍。
- preserve-all 配置部分字幕时保留全局 `-c:s copy` 兜底。
- 硬件帧进入 CPU 高精度链但缺少匹配媒体探针时阻止执行。
- 硬件帧仍在 GPU 时强制软件 `-pix_fmt`，阻止不可能的自动格式转换。
- 兼容模式下受控 CPU 滤镜直接连接 d3d11/cuda 硬件帧时阻止执行。

## 本轮发现并修复的问题

1. 原高精度解析器在 D3D11 硬件帧后直接生成 `hwdownload,format=yuv420p10le`，三套 FFmpeg 实测均失败。硬件帧必须先按实际底层半平面格式下载：8-bit 4:2:0 为 `nv12`，10-bit 4:2:0 为 `p010le`，12-bit 4:2:0 为 `p012le`；随后才能转为 CPU 工作格式。解析器现基于路径绑定的 ffprobe 摘要生成两段格式边界。
2. `-hwaccel_output_format` 缺少 `cuda`，无法表达 NVDEC/CUDA filter/NVENC 设备帧链；配置、schema、分享 schema 和 UI 已补齐。
3. 缺少探针或多条参与编码的视频流无法归一到同一硬件下载格式时，旧逻辑会生成高概率失败的命令；现提前阻止。
4. CUDA/D3D11 硬件帧链同时发射 `-pix_fmt p010le/yuv420p` 会触发无法实现的 `auto_scale`；现提前阻止，并引导纯 GPU 链使用 `pixelFormat=auto`。
5. 兼容模式下受控 CPU 滤镜不会自动下载硬件帧，旧逻辑只有 warning；现对明确的受控 CPU 滤镜组合报 error，纯自定义 GPU 链仍保留风险确认路径。

此前真实媒体矩阵已修复的问题仍全部回归通过：Windows 字幕路径转义、ASS `force_style`、无依据 zscale dither、探针色彩标签、PGS→文本转码、preserve-all 字幕映射/兜底、多视频传统双遍等。

## RTX 3060 与 CUDA/D3D11 实测边界

- D3D11VA 适配器 0 为 `1002:1638 AMD Radeon(TM) Graphics`；它能硬解，但后续 NVENC 会报 `OpenEncodeSessionEx failed: no encode device`。
- D3D11VA 适配器 1 为 `10de:2520 NVIDIA GeForce RTX 3060 Laptop GPU`；同一产品链成功。因此混合显卡设备选择不是装饰参数，`-hwaccel_device 1` 在本机是必要配置。
- `bilateral_cuda` 与 `colorspace_cuda` 在本轮三套构建的 10-bit `p010le` 链上不可用；8-bit `nv12` 链通过。
- `bilateral_cuda` 接在 640×360 `scale_cuda` 后会让 NVENC 产物变为 640×384，并改变 SAR；改用 32 像素对齐高度 352 后输出稳定。该行为属于 FFmpeg CUDA 自定义滤镜边界，产品不能从任意原始表达式可靠推导其尺寸副作用。
- RTX 3060 Laptop 不提供 AV1 NVENC；H.264/HEVC NVENC 均通过。机器的 AMD 图形设备还能完成 H.264/HEVC AMF，但不支持 AV1 AMF。
- QSV 在当前设备上无法创建 MFX session，按环境不可用跳过。

## 其他环境限制

- CUDA/NVENC 扩展场景按 FFmpeg 构建和当前设备动态预检；缺少 NVIDIA、指定 D3D11 adapter 或所需 CUDA 滤镜时记为 SKIP。SKIP 只表示当前环境无法执行，不可用来声称硬件能力已通过。
- Gyan FFmpeg 8.1.2 在同一进程混用 libx264 与 libx265 两个输出编码器时曾出现原生访问冲突；两编码器单独及两个独立 libx264 快照均稳定。
- 当前设备最初只有 .NET 运行时、没有 .NET 8 SDK；真实媒体、Web/Desktop TypeScript、Vitest 和现有硬件监控 helper IPC 均可执行，但正式完整门禁必须安装 SDK 后重编译 helper。
- 本轮素材仍没有附件流；附件映射由既有命令单测覆盖。

## 复现命令

若 pnpm 已加入 PATH：

```powershell
pnpm verify:real-media -- --ffmpeg "C:\path\ffmpeg-8\bin\ffmpeg.exe" --ffmpeg "C:\path\ffmpeg-9\bin\ffmpeg.exe"
```

当前设备只通过 Corepack 提供 pnpm，可直接运行：

```powershell
cd "D:\FFCodec Lab\apps\web"
corepack pnpm exec tsx ../../scripts/verify-real-media-encoding.ts `
  --ffmpeg "C:\path\ffmpeg-8\bin\ffmpeg.exe" `
  --ffmpeg "C:\path\ffmpeg-9\bin\ffmpeg.exe"
```

默认测试结束后删除全部临时输出；添加 `--keep` 可保留产物并打印目录。
