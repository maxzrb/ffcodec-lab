# FFCodec Lab

FFCodec Lab 是一个纯前端 FFmpeg 命令生成器。它把编码器、质量控制、画面滤镜、音频、字幕、封装与自定义参数组合为可审计的 Bash、PowerShell 或 CMD 命令；应用本身不会上传媒体文件，也不会直接执行 FFmpeg。

## 本地使用

需要 Node.js 20 或更高版本：

```powershell
npm install
npm run dev
```

打开终端显示的本地地址即可使用。生成发布文件：

```powershell
npm run check
```

成功后，静态成品位于 `dist/`，可通过 `npm run preview` 本地预览，也可部署到任意静态站点服务。

## 功能

- 13 个视频编码器：libx264、libx265、SVT-AV1、libaom-AV1、VVenC，以及 NVIDIA NVENC、Intel QSV、AMD AMF、Apple VideoToolbox。
- AAC、Opus、FLAC 音频编码，支持 MP4、MKV、WebM、MOV 等容器组合校验。
- 裁剪、旋转、镜像、画面调整、去隔行、锐化、缩放、帧率和字幕烧录滤镜链。
- 多字幕轨道、常用 ASS 样式、流索引映射和六阶段高级自定义参数。
- 浏览器本地持久化、预设导入导出、隐私安全的 URL Hash 配置分享。
- Bash、PowerShell、CMD 命令预览，参数来源解释和错误诊断。
- 左侧“实用工具”提供目标文件大小计算：根据完整时长、目标 MiB 和音频预算派生视频码率并生成可靠的双遍命令。
- 默认亮色并支持持久化暗色主题；默认显示 PowerShell 单行命令。

详细操作见 [用户指南](docs/user-guide.md)，发布变化见 [CHANGELOG](CHANGELOG.md)。

## 质量检查

`npm run check` 会依次执行 ESLint、TypeScript 严格类型检查、Vitest、目录与来源审计以及生产构建。
