# FFCodec Lab

<p align="center">
  <img src="assets/3aa0f017-d5bc-49bb-a252-50929c4f38b5.png" width="160" alt="FFCodec Lab 图标">
</p>

<p align="center">
  面向 Web 与 Windows Desktop 的 FFmpeg 参数工作台、命令生成器和本地编码工具。
</p>

FFCodec Lab 将视频编码、音频编码、画面处理、字幕、流映射、封装和自定义参数组织成可检查的工作流。Web 版专注于生成 Bash、PowerShell 或 CMD 命令；Desktop 版在同一套参数工作台之上增加 FFmpeg/ffprobe 检测、本地任务执行、进度、取消、历史记录和硬件监控。

当前版本：`v1.2.0`

## 下载

Windows 10/11 x64 用户可从 [v1.2.0 Release](https://github.com/maxzrb/ffcodec-lab/releases/tag/v1.2.0) 下载：

| 版本 | 适用场景 | FFmpeg |
| --- | --- | --- |
| [全量安装版](https://github.com/maxzrb/ffcodec-lab/releases/download/v1.2.0/FFCodec-Lab-Setup-Full-1.2.0.exe) | 希望安装后直接使用 | 已内置 |
| [基础安装版](https://github.com/maxzrb/ffcodec-lab/releases/download/v1.2.0/FFCodec-Lab-Setup-Base-1.2.0.exe) | 已有 FFmpeg，或希望自行管理版本 | 不包含 |
| [onedir 目录版](https://github.com/maxzrb/ffcodec-lab/releases/download/v1.2.0/FFCodec-Lab-Onedir-1.2.0.zip) | 不安装，解压后直接运行 | 不包含 |

基础安装版和 onedir 会自动搜索可用 FFmpeg，也可在设置中选择 FFmpeg 所在文件夹。发布文件校验值见 [SHA256SUMS.txt](https://github.com/maxzrb/ffcodec-lab/releases/download/v1.2.0/SHA256SUMS.txt)。

> 当前 Windows 发布包未配置代码签名证书，首次下载或运行时可能出现 SmartScreen 提示。

## v1.2.0 重点功能

- 支持 libx264、libx265、SVT-AV1、libaom-AV1、VVenC、NVENC、QSV、AMF、VideoToolbox 等视频编码路径，以及 29 个音频 encoder 选项。
- 按视频、音频和字幕逐流选择 encode/copy，支持“保留全部流”和精确的 FFmpeg `-map` 生成。
- Desktop 使用 ffprobe 探测媒体格式、时长和流信息，可默认联动流选择，并将探测时长用于目标文件大小计算。
- 目标文件大小工具根据时长、目标 MiB、封装预留和音频预算计算视频码率，并支持完整的双遍编码。
- Desktop 将 pass 1/pass 2 作为同一任务串行执行，统一处理进度、取消、日志、历史和临时 passlog 清理。
- 预设管理支持搜索、内置/用户分类和分页，并提供兼容优先的“上传材料专用”预设。
- 支持画面缩放、帧率、裁剪、旋转、镜像、去隔行、锐化、降噪、去色带、色彩转换和字幕处理。
- 提供配置诊断、参数来源解释、三种 Shell 命令预览、自由命令编辑和 JSON 预设导入导出。
- Desktop 支持 FFmpeg 多版本候选切换、编码历史、日志查看、输出定位和 LibreHardwareMonitor 性能监控。

## Web 与 Desktop

### Web

- 在浏览器中运行参数工作台和命令生成器。
- 配置保存在浏览器本地存储中。
- 不读取本机媒体，也不直接执行 FFmpeg。
- 适合生成、检查和复制跨平台命令。

### Desktop

- 自动检测同目录、系统 PATH 和用户指定的 FFmpeg。
- 使用 ffprobe 读取本地媒体信息，并直接执行结构化 FFmpeg 任务。
- 提供实时进度、ETA、取消、事件日志、任务历史和输出定位。
- 用户配置由 localStorage 与 INI 文件同步保存，可选择用户目录或便携目录模式。

媒体探测和编码均在本机完成，编码流程不会上传输入文件。

## 本地开发

### 环境要求

- Node.js 20 或更高版本
- pnpm 11（仓库固定为 `pnpm@11.15.1`）
- Desktop 原生监控模块需要 .NET 8 SDK 或更高版本

安装依赖：

```powershell
corepack enable
pnpm install
```

启动 Web：

```powershell
pnpm dev:web
```

启动 Desktop：

```powershell
pnpm dev:desktop
```

## 构建

构建 Web 静态文件：

```powershell
pnpm build:web
```

构建 Desktop renderer、preload、main 和原生监控模块：

```powershell
pnpm build:desktop
```

构建全部 Windows 发布包：

```powershell
pnpm build:desktop:win
```

也可以分别构建：

```powershell
pnpm build:desktop:win:full
pnpm build:desktop:win:base
pnpm build:desktop:win:onedir
```

全量版构建需要仓库根目录存在 `ffmpeg-full.7z`，并需要可调用的 `7z`；也可通过 `FFCODEC_FFMPEG_ARCHIVE` 和 `SEVEN_ZIP` 环境变量指定其他位置。基础版和 onedir 不需要 FFmpeg 归档。

Windows 产物输出到：

```text
release/desktop/full/
release/desktop/base/
release/desktop/onedir/win-unpacked/
```

## 质量检查

```powershell
pnpm check
```

该命令执行全部 TypeScript 类型检查、Web/Desktop Vitest 测试和 ESLint。`v1.2.0` 发布门禁覆盖 Web 545 项测试和 Desktop 26 项测试；双端生产构建及 Windows 三种包型均已验证。

## 项目结构

```text
apps/
  web/                 Web 宿主
  desktop/             Electron 宿主、FFmpeg 执行和原生监控
packages/
  catalog/             编码器与参数目录
  domain/              配置、规则、诊断和命令构建
  command-plan/        结构化执行计划
  platform-api/        Web/Desktop 平台能力边界
  workbench/           共享 React 参数工作台
scripts/               构建、审计和同步脚本
```

更多资料：

- [用户指南](docs/user-guide.md)
- [架构说明](docs/architecture.md)
- [编码器可用性](docs/encoder-availability.md)
- [版本变化](CHANGELOG.md)

## 第三方组件

Desktop 可随发布包分发 FFmpeg、LibreHardwareMonitor、PawnIO 和其他运行组件。第三方许可与声明位于 `apps/desktop/native/licenses/`，并会随 Desktop 包复制到 `resources/licenses/third-party/`。
