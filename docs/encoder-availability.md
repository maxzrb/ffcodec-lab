# 编码器可用性说明

> FFCodec Lab 是纯前端 FFmpeg 命令生成器。本文档说明静态可判断的编码器可用性信息，并明确区分哪些信息 FFCodec 无法确认。

---

## 可用性层级

FFCodec 只能静态判断以下层级中的部分信息：

| 层级 | 含义 | FFCodec 可判断？ |
|------|------|-----------------|
| 1. 配置逻辑有效 | 参数组合在编码器能力范围内 | ✅ 是（通过 catalog + rules） |
| 2. 命令语法有效 | 生成的 FFmpeg 命令语法正确 | ✅ 是（通过 Command AST + renderer） |
| 3. 编码器存在于部分 FFmpeg 构建 | 编码器在 FFmpeg 官方源码中存在 | ✅ 是（通过 version/compile flag 标注） |
| 4. 用户本机 FFmpeg 包含该编码器 | FFmpeg --enable-xxx 编译 | ❌ 否（未调用 ffmpeg） |
| 5. 用户本机硬件/驱动支持 | GPU、驱动、运行时就绪 | ❌ 否（未检测硬件） |

FFCodec 始终只生成命令，**不确认用户本机实际可用**。

---

## 视频编码器

| 编码器 | 类型 | 编译要求 | 硬件要求 | FFmpeg 最低版本 |
|--------|------|----------|----------|----------------|
| libx264 | 软件 | --enable-libx264 | 无 | FFmpeg 0.6 |
| libx265 | 软件 | --enable-libx265 | 无 | FFmpeg 2.0 |
| libsvtav1 | 软件 | --enable-libsvtav1 | 无 | FFmpeg 4.0 |
| h264_nvenc | NVIDIA 硬件 | --enable-nvenc | Kepler (GK104)+ | FFmpeg 3.4 |
| hevc_nvenc | NVIDIA 硬件 | --enable-nvenc | Maxwell GM206+ | FFmpeg 3.4 |
| h264_qsv | Intel 硬件 | --enable-libmfx | Sandy Bridge+ | FFmpeg 3.3 |
| hevc_qsv | Intel 硬件 | --enable-libmfx | Broadwell+ | FFmpeg 3.4 |

### 硬件编码器能力矩阵

| 特性 | h264_nvenc | hevc_nvenc | h264_qsv | hevc_qsv |
|------|-----------|-----------|----------|----------|
| 10-bit | ✅ | ✅ | p010le | ✅ |
| B 帧 | Maxwell GM206+ | Maxwell GM206+ | Sandy Bridge+ | Skylake+ |
| Look-ahead | ✅ | ✅ | Haswell+ | Haswell+ |
| 无损 | ✅ | ✅ | ❌ | ❌ |
| 低功耗 | ❌ | ❌ | Broadwell+ | Broadwell+ |

### 如何确认本机可用性

```bash
# 检查 FFmpeg 包含哪些编码器
ffmpeg -encoders 2>/dev/null | grep -E "x264|x265|svtav1|nvenc|qsv"

# 检查 QSV 运行时（Linux）
vainfo 2>/dev/null | grep -i intel

# 检查 NVIDIA 驱动（Linux/Windows）
nvidia-smi
```

---

## 音频编码器

| 编码器 | 类型 | 编译要求 | 说明 |
|--------|------|----------|------|
| aac | 软件 | 无（内置） | FFmpeg 原生 AAC |
| libopus | 软件 | --enable-libopus | Opus 编解码 |
| flac | 软件 | 无（内置） | 无损压缩 |

---

## 容器兼容性速查

| 容器 | H.264 | H.265 | AV1 | AAC | Opus | FLAC |
|------|-------|-------|-----|-----|------|------|
| MP4 | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| MKV | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| WebM | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| MOV | ✅ | ✅ | ✅ | ✅ | ⚠️ | ❌ |
| FLV | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |

⚠️ = supported-with-caveat

---

## 环境可用性提示规则

1. **hardware-dependent 编码器**：UI 显示提示但不阻止复制命令
2. **build-dependent 编码器**：UI 显示编译提示
3. **配置错误**（参数冲突/缺失）：阻止复制命令
4. **环境可用性提示**：仅作为 info/warning 显示，不阻止操作

FFCodec 不会声称检测了用户硬件。
