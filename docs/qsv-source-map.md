# QSV 编码器来源映射

> 记录 h264_qsv 和 hevc_qsv 编码器的参数来源和核验状态。

---

## 编码器定义来源

| 参数类别 | 主要来源 | 核验状态 |
|----------|---------|---------|
| 编码器存在性 | FFmpeg libavcodec/qsvenc_h264.c, qsvenc_hevc.c | cross-verified |
| 质量模式 (CQP/ICQ/LA_ICQ/VBR/CBR) | Intel Media Driver README + FFmpeg 源码 | cross-verified |
| Preset 值 (veryfast-veryslow) | FFmpeg libavcodec/qsvenc.c | cross-verified |
| Profile 值 | FFmpeg libavcodec/qsvenc.c | cross-verified |
| 像素格式 | FFmpeg libavcodec/qsvenc.c | cross-verified |
| async_depth | FFmpeg libavcodec/qsvenc.c | cross-verified |
| low_power | FFmpeg libavcodec/qsvenc.c | cross-verified |
| B 帧 | Intel Media Driver README | cross-verified |
| GOP / refs | FFmpeg libavcodec/qsvenc.c | cross-verified |
| 硬件代际需求 | Intel ark.intel.com + Media Driver README | cross-verified |

---

## 参数引用来源

### FFmpeg 源码

| 文件 | URL | 说明 |
|------|-----|------|
| libavcodec/qsvenc_h264.c | https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_h264.c | h264_qsv 编码器参数定义 |
| libavcodec/qsvenc_hevc.c | https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc_hevc.c | hevc_qsv 编码器参数定义 |
| libavcodec/qsvenc.c | https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c | QSV 通用编码参数 |

### Intel 官方

| 资源 | URL | 说明 |
|------|-----|------|
| Intel Media Driver | https://github.com/intel/media-driver | QSV 运行时驱动 |
| Intel Media SDK | https://github.com/Intel-Media-SDK/MediaSDK | QSV 开发 SDK |

---

## QSV 质量模式详解

### CQP (恒定 QP)

```bash
# 命令语法
ffmpeg -i input -c:v h264_qsv -qp 23 output.mp4

# 参数
-qp <0-51>  # 量化参数，0=无损 51=最大压缩

# 适用编码器: h264_qsv, hevc_qsv
# 不产生 -rc 标志（与 NVENC 不同）
```

### ICQ (智能恒定质量)

```bash
# 命令语法
ffmpeg -i input -c:v h264_qsv -global_quality 23 -look_ahead 1 output.mp4

# 参数
-global_quality <1-51>  # 全局质量
-look_ahead 1            # 启用前瞻（必需）

# 适用编码器: h264_qsv, hevc_qsv
# 硬件要求: Haswell+
# 来源: Intel Media Driver README — ICQ mode
```

### LA_ICQ (前瞻智能恒定质量)

```bash
# 命令语法
ffmpeg -i input -c:v h264_qsv -global_quality 23 -look_ahead 1 -look_ahead_depth 40 output.mp4

# 参数
-global_quality <1-51>   # 全局质量
-look_ahead 1             # 启用前瞻（必需）
-look_ahead_depth <10-100> # 前瞻深度，默认 40

# 硬件要求: Haswell+
# 注意: look_ahead_depth 通过 modeArguments 作为固定默认值输出
```

### VBR / CBR

```bash
# VBR
ffmpeg -i input -c:v h264_qsv -b:v 5000k -maxrate 8000k -bufsize 16000k output.mp4

# CBR
ffmpeg -i input -c:v h264_qsv -b:v 5000k output.mp4

# 参数
-b:v <bitrate>    # 目标码率
-maxrate <rate>   # 最大码率
-bufsize <size>   # 缓冲区大小
```

### Look-ahead VBR

```bash
ffmpeg -i input -c:v h264_qsv -b:v 5000k -maxrate 8000k -look_ahead 1 -look_ahead_depth 40 output.mp4
```

---

## QSV 与 NVENC 参数对比

| 参数 | QSV | NVENC |
|------|-----|-------|
| CQP 参数 | `-qp N` | `-rc constqp -qp N` |
| 质量模式参数 | `-global_quality N` | `-rc vbr -cq N` |
| 前瞻参数 | `-look_ahead 1` | `-rc-lookahead N` |
| 前瞻深度 | `-look_ahead_depth N` | 无独立参数 |
| Preset 值 | veryfast-veryslow | p1-p7 |
| 空间 AQ | 无 | `-spatial_aq 1` |
| 时间 AQ | 无 | `-temporal_aq 1` |
| GPU 选择 | 无独立参数（使用 iHD 环境变量） | `-gpu N` |
| 编码器名称 | h264_qsv / hevc_qsv | h264_nvenc / hevc_nvenc |

---

## 硬件代际对照

| Intel 代际 | 代号 | H.264 QSV | HEVC QSV | 10-bit HEVC | B 帧 | Look-ahead | Low Power |
|-----------|------|-----------|----------|-------------|------|------------|-----------|
| 2nd Gen | Sandy Bridge | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| 3rd Gen | Ivy Bridge | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| 4th Gen | Haswell | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| 5th Gen | Broadwell | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 6th Gen | Skylake | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 7-14th Gen | Kaby Lake+ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 未核验参数

当前 QSV 编码器中所有参数均已通过 cross-verified 状态。以下为版本相关的注意事项：

| 参数 | 状态 | 说明 |
|------|------|------|
| AVBR 模式 | 未加入 | 官方文档描述不充分，暂不加入 |
| VCM 模式 | 未加入 | 仅部分驱动支持 |
| MFX 特有参数 | 未加入 | 依赖 libmfx 版本 |

---

## 参考文档

- FFmpeg QSV Wiki: https://trac.ffmpeg.org/wiki/Hardware/QuickSync
- Intel Media Driver: https://github.com/intel/media-driver
- FFmpeg qsvenc.c 源码: https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/qsvenc.c
