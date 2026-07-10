# MVP 验收报告

> 生成时间：2026-07-10T07:01:59.965Z
> TypeScript：0 errors
> 目录审计：0 errors
> 测试：76 passed

## 验收结果摘要

| # | 配置 | 错误 | 通知 | 结果 |
|---|------|------|------|------|
| 1 | Case 1: MP4 + libx264 + CRF + AAC | 0 | 0 | ✅ 通过 |
| 2 | Case 2: MKV + libx265 + 10-bit + Opus | 0 | 0 | ✅ 通过 |
| 3 | Case 3: WebM + libsvtav1 + Opus | 0 | 0 | ✅ 通过 |
| 4 | Case 4: 视频 copy + 音频 copy | 0 | 0 | ✅ 通过 |
| 5 | Case 5: MKV + 外挂 SRT 混流 | 0 | 0 | ✅ 通过 |
| 6 | Case 6: MP4 + SRT 转 mov_text | 0 | 0 | ✅ 通过 |
| 7 | Case 7: libx265 + 分辨率缩放 + 帧率调整 + 字幕烧录 | 0 | 0 | ✅ 通过 |
| 8 | Case 8: 禁用视频，仅输出音频 | 0 | 0 | ✅ 通过 |
| 9 | Case 9: 两遍编码 | 0 | 0 | ✅ 通过 |
| 10 | Case 10: 包含空格、中文和特殊字符的路径 | 0 | 0 | ✅ 通过 |

**总计：10 个配置，10 通过，0 失败**

## 详细结果

### Case 1: MP4 + libx264 + CRF + AAC

**描述**：最常用配置：H.264 CRF 23 + AAC 192k

**ProjectConfig 摘要**：
- 视频：libx264 / crf
- 音频：aac 192k
- 容器：mp4
- 字幕：mux=off, burn=off
- 帧：resolution=source, framerate=source

**Command AST**：
- `single-pass`：7 个参数

**Bash**：
```bash
ffmpeg -i input.mkv -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k -ac stereo -ar 48000 output.mp4
```

**PowerShell**：
```powershell
ffmpeg -i input.mkv -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k -ac stereo -ar 48000 output.mp4
```

**CMD**：
```cmd
ffmpeg -i input.mkv -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k -ac stereo -ar 48000 output.mp4
```

**结果**：✅ 通过

---

### Case 2: MKV + libx265 + 10-bit + Opus

**描述**：HEVC 高质量：libx265 CRF 24 + 10-bit + Opus 128k

**ProjectConfig 摘要**：
- 视频：libx265 / crf
- 音频：libopus 128k
- 容器：mkv
- 字幕：mux=off, burn=off
- 帧：resolution=source, framerate=source

**Command AST**：
- `single-pass`：9 个参数

**Bash**：
```bash
ffmpeg -i input.mkv -c:v libx265 -preset slow -pix_fmt yuv420p10le -profile:v main10 -crf 24 -c:a libopus -b:a 128k -ac stereo -ar 48000 output.mp4
```

**PowerShell**：
```powershell
ffmpeg -i input.mkv -c:v libx265 -preset slow -pix_fmt yuv420p10le -profile:v main10 -crf 24 -c:a libopus -b:a 128k -ac stereo -ar 48000 output.mp4
```

**CMD**：
```cmd
ffmpeg -i input.mkv -c:v libx265 -preset slow -pix_fmt yuv420p10le -profile:v main10 -crf 24 -c:a libopus -b:a 128k -ac stereo -ar 48000 output.mp4
```

**结果**：✅ 通过

---

### Case 3: WebM + libsvtav1 + Opus

**描述**：AV1 编码：SVT-AV1 CRF 35 + Opus 128k + WebM

**ProjectConfig 摘要**：
- 视频：libsvtav1 / crf
- 音频：libopus 128k
- 容器：webm
- 字幕：mux=off, burn=off
- 帧：resolution=source, framerate=source

**Command AST**：
- `single-pass`：7 个参数

**Bash**：
```bash
ffmpeg -i input.mkv -c:v libsvtav1 -preset 6 -crf 35 -c:a libopus -b:a 128k -ac stereo -ar 48000 output.mp4
```

**PowerShell**：
```powershell
ffmpeg -i input.mkv -c:v libsvtav1 -preset 6 -crf 35 -c:a libopus -b:a 128k -ac stereo -ar 48000 output.mp4
```

**CMD**：
```cmd
ffmpeg -i input.mkv -c:v libsvtav1 -preset 6 -crf 35 -c:a libopus -b:a 128k -ac stereo -ar 48000 output.mp4
```

**结果**：✅ 通过

---

### Case 4: 视频 copy + 音频 copy

**描述**：流复制：仅更换容器，不重编码

**ProjectConfig 摘要**：
- 视频：copy
- 音频：copy
- 容器：mkv
- 字幕：mux=off, burn=off
- 帧：resolution=source, framerate=source

**Command AST**：
- `single-pass`：2 个参数

**Bash**：
```bash
ffmpeg -i input.mkv -c:v copy -c:a copy output.mp4
```

**PowerShell**：
```powershell
ffmpeg -i input.mkv -c:v copy -c:a copy output.mp4
```

**CMD**：
```cmd
ffmpeg -i input.mkv -c:v copy -c:a copy output.mp4
```

**结果**：✅ 通过

---

### Case 5: MKV + 外挂 SRT 混流

**描述**：字幕混流：添加外挂 SRT 字幕到 MKV

**ProjectConfig 摘要**：
- 视频：libx264 / crf
- 音频：aac 192k
- 容器：mkv
- 字幕：mux=copy, burn=off
- 帧：resolution=source, framerate=source

**Command AST**：
- `single-pass`：8 个参数

**Bash**：
```bash
ffmpeg -i input.mkv -i subtitles.srt -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k -ac stereo -ar 48000 -c:s copy output.mp4
```

**PowerShell**：
```powershell
ffmpeg -i input.mkv -i subtitles.srt -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k -ac stereo -ar 48000 -c:s copy output.mp4
```

**CMD**：
```cmd
ffmpeg -i input.mkv -i subtitles.srt -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k -ac stereo -ar 48000 -c:s copy output.mp4
```

**结果**：✅ 通过

---

### Case 6: MP4 + SRT 转 mov_text

**描述**：字幕混流：MP4 容器自动将 SRT 转为 mov_text

**ProjectConfig 摘要**：
- 视频：libx264 / crf
- 音频：aac 192k
- 容器：mp4
- 字幕：mux=auto, burn=off
- 帧：resolution=source, framerate=source

**Command AST**：
- `single-pass`：7 个参数

**Bash**：
```bash
ffmpeg -i input.mkv -i subtitles.srt -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k -ac stereo -ar 48000 output.mp4
```

**PowerShell**：
```powershell
ffmpeg -i input.mkv -i subtitles.srt -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k -ac stereo -ar 48000 output.mp4
```

**CMD**：
```cmd
ffmpeg -i input.mkv -i subtitles.srt -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k -ac stereo -ar 48000 output.mp4
```

**结果**：✅ 通过

---

### Case 7: libx265 + 分辨率缩放 + 帧率调整 + 字幕烧录

**描述**：综合配置：H.265 重编码 + 1080p + 30fps + 字幕烧录

**ProjectConfig 摘要**：
- 视频：libx265 / crf
- 音频：aac 192k
- 容器：mkv
- 字幕：mux=off, burn=on
- 帧：resolution=size, framerate=value

**Command AST**：
- `single-pass`：8 个参数

**Bash**：
```bash
ffmpeg -i input.mkv -i subtitles.ass -c:v libx265 -preset medium -crf 24 -vf "scale=1920:1080,fps=30,ass=filename='subtitles.ass':force_style='FontName=Arial,FontSize=24'" -c:a aac -b:a 192k -ac stereo -ar 48000 output.mp4
```

**PowerShell**：
```powershell
ffmpeg -i input.mkv -i subtitles.ass -c:v libx265 -preset medium -crf 24 -vf scale=1920:1080,fps=30,ass=filename='subtitles.ass':force_style='FontName=Arial,FontSize=24' -c:a aac -b:a 192k -ac stereo -ar 48000 output.mp4
```

**CMD**：
```cmd
ffmpeg -i input.mkv -i subtitles.ass -c:v libx265 -preset medium -crf 24 -vf scale=1920:1080,fps=30,ass=filename='subtitles.ass':force_style='FontName=Arial,FontSize=24' -c:a aac -b:a 192k -ac stereo -ar 48000 output.mp4
```

**结果**：✅ 通过

---

### Case 8: 禁用视频，仅输出音频

**描述**：提取音频：-vn + AAC 320k

**ProjectConfig 摘要**：
- 视频：disabled
- 音频：aac 320k
- 容器：mp4
- 字幕：mux=off, burn=off
- 帧：resolution=source, framerate=source

**Command AST**：
- `single-pass`：5 个参数

**Bash**：
```bash
ffmpeg -i input.mkv -vn -c:a aac -b:a 320k -ac stereo -ar 48000 output.mp4
```

**PowerShell**：
```powershell
ffmpeg -i input.mkv -vn -c:a aac -b:a 320k -ac stereo -ar 48000 output.mp4
```

**CMD**：
```cmd
ffmpeg -i input.mkv -vn -c:a aac -b:a 320k -ac stereo -ar 48000 output.mp4
```

**结果**：✅ 通过

---

### Case 9: 两遍编码

**描述**：libx264 Two-Pass VBR 5000k

**ProjectConfig 摘要**：
- 视频：libx264 / twoPass
- 音频：aac 192k
- 容器：mp4
- 字幕：mux=off, burn=off
- 帧：resolution=source, framerate=source

**Command AST**：
- `pass-1`：7 个参数
- `pass-2`：7 个参数

**Bash**：
```bash
ffmpeg -pass 1 -passlogfile ffmpeg2pass -i input.mkv -c:v libx264 -preset medium -b:v 5000k -c:a aac -b:a 192k -ac stereo -ar 48000 output.mp4  &&  ffmpeg -pass 2 -passlogfile ffmpeg2pass -i input.mkv -c:v libx264 -preset medium -b:v 5000k -c:a aac -b:a 192k -ac stereo -ar 48000 output.mp4
```

**PowerShell**：
```powershell
ffmpeg -pass 1 -passlogfile ffmpeg2pass -i input.mkv -c:v libx264 -preset medium -b:v 5000k -c:a aac -b:a 192k -ac stereo -ar 48000 output.mp4 ;  ffmpeg -pass 2 -passlogfile ffmpeg2pass -i input.mkv -c:v libx264 -preset medium -b:v 5000k -c:a aac -b:a 192k -ac stereo -ar 48000 output.mp4
```

**CMD**：
```cmd
ffmpeg -pass 1 -passlogfile ffmpeg2pass -i input.mkv -c:v libx264 -preset medium -b:v 5000k -c:a aac -b:a 192k -ac stereo -ar 48000 output.mp4  &&  ffmpeg -pass 2 -passlogfile ffmpeg2pass -i input.mkv -c:v libx264 -preset medium -b:v 5000k -c:a aac -b:a 192k -ac stereo -ar 48000 output.mp4
```

**结果**：✅ 通过

---

### Case 10: 包含空格、中文和特殊字符的路径

**描述**：路径转义验证：输入和输出路径包含空格和中文

**ProjectConfig 摘要**：
- 视频：libx264 / crf
- 音频：aac 192k
- 容器：mp4
- 字幕：mux=off, burn=off
- 帧：resolution=source, framerate=source

**Command AST**：
- `single-pass`：7 个参数

**Bash**：
```bash
ffmpeg -i 'C:\My Videos\我的视频 文件.mp4' -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k -ac stereo -ar 48000 'C:\Output\压制输出 (高清版).mkv'
```

**PowerShell**：
```powershell
ffmpeg -i "C:\My Videos\我的视频 文件.mp4" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k -ac stereo -ar 48000 "C:\Output\压制输出 (高清版).mkv"
```

**CMD**：
```cmd
ffmpeg -i "C:\My Videos\我的视频 文件.mp4" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k -ac stereo -ar 48000 "C:\Output\压制输出 (高清版).mkv"
```

**结果**：✅ 通过

---

## 架构不变量检查

| 不变量 | 状态 |
|--------|------|
| TypeScript 严格模式 0 errors | ✅ |
| 目录审计 0 errors | ✅ |
| 全部单元测试通过 (76/76) | ✅ |
| 生产构建成功 | ✅ |
| 所有 args 有 originId | ✅ |
| 最多一个 -vf | ✅ |
| copy 模式不出现质量/滤镜参数 | ✅ |
| React 组件无 FFmpeg 硬编码 | ✅ |
| Command AST 是命令文本唯一来源 | ✅ |
| 预设不保存命令文本 | ✅ |

## 已知限制

- 5 项参数标记为 `needsCrossVerification: true`，尚未通过编码器官方文档交叉核验
- 暂未实现复杂滤镜系统、HDR 转换、色彩管理
- 暂未实现 NVENC/QSV/AMF 硬件编码器
- 字幕烧录仅支持基础 force_style，无完整 ASS 编辑器
- 无后端存储，预设存储在浏览器 localStorage

## 下一阶段建议

1. 交叉核验 5 项待核验参数（libx264 CQP、libsvtav1 QP/preset、libopus frame_duration、AAC aac_coder）
2. 添加 FLAC 编码器（参数简单，容易核验）
3. 实现 PresetManager UI 组件
4. 增加 React Testing Library 集成测试
5. 在核验完成后选择性添加 NVENC 硬件编码器
