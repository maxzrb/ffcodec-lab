# FFCodec Lab

<p align="center">
  <img src="assets/3aa0f017-d5bc-49bb-a252-50929c4f38b5.png" width="160" alt="FFCodec Lab 图标">
</p>

<p align="center">
  面向 Web 与 Windows Desktop 的 FFmpeg 编解码参数工作台、命令生成器和本地媒体处理工具。
</p>

FFCodec Lab 把主输入解码、视频与音频编码、画面滤镜、字幕、流映射、封装和自定义参数组织成一套可检查的工作流。Web 版可在 [fflab.loliland.cn](https://fflab.loliland.cn) 直接生成 Bash、PowerShell 或 CMD 命令；Desktop 版在同一套工作台之上增加本机 FFmpeg 探测、媒体信息、任务执行、进度、取消、历史和硬件监控。

> 字体声明：本软件使用 HarmonyOS Sans 字体，详见 [`packages/workbench/src/assets/fonts/LICENSE_HarmonyOS_Sans.txt`](packages/workbench/src/assets/fonts/LICENSE_HarmonyOS_Sans.txt)。

当前版本：`1.5.1（11）`

版本号采用“语义版本号（版本序号）”格式：小更新或小修复增加修订号，大更新或大修复增加次版本号，重构类型或破坏性变更增加主版本号；版本序号从 1 开始，每次正式发布递增。完整规则见 [VERSIONING.md](VERSIONING.md)。

## 下载

Windows 10/11 x64 用户请前往 [GitHub Releases](https://github.com/maxzrb/ffcodec-lab/releases)。当前版本提供三种 Desktop 包：

| 包 | 适用场景 | FFmpeg |
| --- | --- | --- |
| [Full 安装版](https://github.com/maxzrb/ffcodec-lab/releases/download/v1.5.1/FFCodec-Lab-Setup-Full-1.5.1.exe) | 安装后直接使用 | 内置 `ffmpeg`、`ffprobe`、`ffplay` |
| [Base 安装版](https://github.com/maxzrb/ffcodec-lab/releases/download/v1.5.1/FFCodec-Lab-Setup-Base-1.5.1.exe) | 已有 FFmpeg，或自行管理版本 | 不包含 |
| [Onedir 目录版](https://github.com/maxzrb/ffcodec-lab/releases/download/v1.5.1/FFCodec-Lab-Onedir-1.5.1.zip) | 免安装、解压即用 | 不包含 |

下载后可使用 [SHA256SUMS.txt](https://github.com/maxzrb/ffcodec-lab/releases/download/v1.5.1/SHA256SUMS.txt) 校验文件完整性。Base 和 Onedir 会自动搜索系统 PATH、同目录和常见目录中的 FFmpeg，也可以在设置中选择自定义文件夹。Full 包会严格确认候选程序的身份，避免把 `ffprobe.exe` 当作 FFmpeg 而显示 `unknown`。

> Windows 发布包目前未配置代码签名证书，首次下载或运行时可能出现 SmartScreen 提示。

## 主要能力

- 独立“解码”面板支持 `-hwaccel`、输入侧 `-threads`、`-hwaccel_output_format` 和硬件设备参数，并明确提示 FFmpeg 构建、GPU、驱动、输入格式和硬件帧滤镜链风险。
- 覆盖 `libx264`、`libx265`、SVT-AV1、libaom、VVenC、NVENC、QSV、AMF、VideoToolbox 等视频编码路径，以及 29 个音频编码器。
- 按视频、音频和字幕逐流选择编码或复制，支持保留全部流和精确的 FFmpeg `-map` 生成。
- 使用媒体探测读取格式、时长和流信息，可将探测结果联动到流选择和目标文件大小计算。
- 目标大小工具会扣除音频与封装开销，并按裁剪、缩放、旋转和显式帧率评估视频码率、bit/frame 与 bpppf。
- 双遍编码以同一任务串行执行，统一处理进度、取消、日志、历史和临时 passlog 清理。
- 预制菜🍜支持搜索、内置/用户分类、分页、导入导出，并提供兼容优先的上传材料预设。
- 提供缩放、帧率、裁剪、旋转、镜像、去隔行、锐化、降噪、去色带、色彩转换和字幕处理。
- 滤镜处理格式支持兼容协商、自动高精度和完整自定义：可控制 10/12/16-bit 或浮点工作精度、4:2:0/4:2:2/4:4:4、YUV/RGB、Alpha、最终降位抖动及不兼容滤镜策略；自动模式会尽量保持输入采样结构并阻止已知的静默 8-bit 降级。
- “自定义参数”提供独立的视频/音频滤镜折叠卡片；每行填写一个完整表达式并通过行顺序排序，分别与受控 CPU 滤镜合并为唯一 `-vf` / `-filter:a`，程序不修改或猜测未知滤镜语义。
- 检查器包含命令、编码总览和诊断三栏；移动竖屏页面保持自然纵向滚动。
- Desktop 切换 FFmpeg 后会重新核验 encoder、AAC 选项、NMR 和媒体探测工具状态，不沿用旧版本能力。

## Web 与 Desktop

### Web

- 在线地址：[https://fflab.loliland.cn](https://fflab.loliland.cn)。
- 浏览器中运行完整参数工作台和命令生成器。
- 配置保存在浏览器本地存储中。
- 不读取本机媒体，也不直接执行 FFmpeg。
- 支持 Bash、PowerShell 和 CMD 命令预览与复制。

### Desktop

- 自动探测系统 PATH、应用同目录、内置资源和用户指定的 FFmpeg。
- 使用 ffprobe 读取本地媒体信息，并执行结构化 FFmpeg 任务。
- 提供实时进度、ETA、取消、事件日志、任务历史、输出定位和硬件监控。
- 配置由 localStorage 与 INI 双写，可选择用户目录或便携目录模式。
- 页脚可直接打开 Web 版；Web 页脚仍保留 Desktop GitHub Releases 下载入口。

媒体探测和编码均在本机完成，输入文件不会上传。

## 本地开发

环境要求：Node.js 20+、pnpm 11（仓库固定为 `pnpm@11.15.1`）；Desktop 原生硬件监控需要 .NET 8 SDK+。

```powershell
corepack enable
pnpm install
pnpm dev:web
pnpm dev:desktop
```

## 构建

```powershell
# Web 静态文件
pnpm build:web

# Desktop renderer、preload、main 和原生监控模块
pnpm build:desktop

# Windows full、base、onedir 三种包
pnpm build:desktop:win
```

也可以分别构建：

```powershell
pnpm build:desktop:win:full
pnpm build:desktop:win:base
pnpm build:desktop:win:onedir
```

Full 构建需要仓库根目录的 `ffmpeg-full.7z` 和可调用的 `7z`。也可以通过 `FFCODEC_FFMPEG_ARCHIVE`、`SEVEN_ZIP` 指定路径。`ffmpeg-full.7z` 仅是本地构建输入，不应提交到 Git。产物位于 `release/desktop/`。

## 质量检查

```powershell
pnpm check
pnpm verify:filter-formats
```

`pnpm check` 执行全部 TypeScript 类型检查、Web/Desktop Vitest 测试和 ESLint。`pnpm verify:filter-formats` 优先调用 PATH 中的 FFmpeg，并在 Windows 仓库中交叉检查随附构建，实证验证高精度候选格式、采样/Alpha 保持、字幕、画面调整、降位抖动及已知 8-bit-only 滤镜。`v1.5.1` 发布门禁包括 Web/Desktop 全量测试、目录审计、双端 production build、两套 FFmpeg 高精度格式验证、Windows 三种包型构建、安装器内层资源检查、Onedir ZIP 完整性测试和 SHA-256 校验。

## 项目结构

```text
apps/web/       Web 宿主
apps/desktop/   Electron 宿主、FFmpeg 执行和原生监控
packages/catalog/       编码器与参数目录
packages/domain/        配置、规则、诊断和命令构建
packages/command-plan/  结构化执行计划
packages/platform-api/  Web/Desktop 平台能力边界
packages/workbench/     共享 React 参数工作台
scripts/                构建、审计和同步脚本
```

更多资料： [用户指南](docs/user-guide.md) · [架构说明](docs/architecture.md) · [编码器可用性](docs/encoder-availability.md) · [版本变化](CHANGELOG.md)

## 第三方组件

Desktop 可随发布包分发 FFmpeg、LibreHardwareMonitor、PawnIO 和其他运行组件。第三方许可与声明位于 `apps/desktop/native/licenses/`，并会随 Desktop 包复制到 `resources/licenses/third-party/`。
