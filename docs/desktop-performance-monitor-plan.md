# Desktop 性能监控实施计划

更新时间：2026-07-22

## 1. 目标与边界

在 Windows Desktop 中集成 LibreHardwareMonitor：

- 命令检查器下方增加性能摘要卡片。
- CPU、GPU 使用率使用两个汽车速度表/转速表风格的大型圆形仪表。
- 内存使用率使用油量表风格的小型仪表。
- 点击摘要进入 Desktop 专属性能详情页。
- 详情页左侧显示选中 CPU 的总使用率与各逻辑核心时间序列；右上显示选中 GPU；右下显示内存与硬盘。
- 监控不可用、权限不足或辅助进程崩溃时不影响 FFmpeg 配置、编码和历史日志。

首版边界：仅 Windows Desktop；Web 不加载、不显示、不打包硬件监控代码。首版只读，不提供风扇、功耗上限、频率等控制能力。

## 2. 官方核验与采用版本

- 官方仓库：<https://github.com/LibreHardwareMonitor/LibreHardwareMonitor>
- 稳定 NuGet：`LibreHardwareMonitorLib 0.9.6`，支持 .NET 8 / .NET Standard 2.0。
- 可读取 CPU、NVIDIA/AMD/Intel GPU、内存、HDD/SSD/NVMe 等硬件。
- 部分传感器需要管理员权限；不能把“所有机器都能读取温度/功耗”作为产品承诺。
- 许可证为 MPL-2.0，项目还包含单独的第三方许可证。分发时必须携带对应许可证和 notices。首版不修改 LibreHardwareMonitor 源文件，只通过官方 NuGet 引用。
- 不使用非官方 `librehardwaremonitor.com` 网站或二进制。

正式实现前固定 NuGet 版本并记录包哈希；预发行版 `0.9.7-pre*` 不进入首版生产构建。

## 3. 推荐架构

```text
LibreHardwareMonitorLib
          │
          ▼
.NET 8 Windows helper（只读采集、归一化）
          │ JSON Lines / stdio
          ▼
Electron main（生命周期、校验、缓存、节流）
          │ typed IPC
          ▼
preload → Desktop renderer（仪表盘与详情页）
```

### 3.1 .NET 辅助进程

新增建议目录：`apps/desktop/native/FFCodec.HardwareMonitor/`。

- 引用固定版 `LibreHardwareMonitorLib 0.9.6`。
- 使用 `Computer` 开启 CPU、GPU、Memory、Storage；首版不开 Mainboard、Controller、Network。
- 通过 visitor 调用 `hardware.Update()`，递归读取子硬件与传感器。
- stdout 只输出单行 JSON 协议；诊断写 stderr，禁止混入 stdout。
- 接收 `start`、`set-interval`、`snapshot`、`stop`、`ping` 指令。
- 默认非管理员运行。权限不足、传感器无值或设备不支持时返回 capability/diagnostic，不让进程失败。
- 正常退出时调用 `Computer.Close()`；主进程退出时终止辅助进程。

建议以 .NET 8 self-contained、single-file、trim disabled 发布 `win-x64`。这样用户无需安装 .NET Runtime；代价是安装包会明显增大，需要在 Phase 1 测量体积。`win-arm64` 留作后续产物，不在首版假定 x64 程序可原生覆盖。

### 3.2 Electron 主进程

新增 `hardware-monitor/` 模块：

- `process-manager.ts`：只允许启动打包资源目录中的固定 helper，不接受 renderer 传入可执行路径。
- `protocol.ts`：解析 JSON Lines、限制单行大小、拒绝未知消息和非有限数值。
- `snapshot-store.ts`：只保留最新快照及有限历史环形缓冲。
- `sensor-normalizer.ts`：把 LHM 的名称差异归一成稳定 ID，同时保留原始名称用于诊断。
- `ipc-handlers.ts`：提供能力查询、启动/停止、当前快照、历史片段和订阅。

不开放 HTTP/WMI 服务，不监听端口。主进程采用“最新值优先”策略：renderer 卡顿时丢弃旧帧，不排队积压。

### 3.3 Preload 与 renderer

类型化 API 建议：

```ts
interface HardwareMonitorApi {
  getCapabilities(): Promise<HardwareCapabilities>
  start(): Promise<MonitorResult>
  stop(): Promise<void>
  getSnapshot(): Promise<HardwareSnapshot | null>
  onSnapshot(listener: (snapshot: HardwareSnapshot) => void): () => void
  onStateChanged(listener: (state: MonitorState) => void): () => void
}
```

IPC 快照不得携带任意对象或 LHM 类型，只传纯数据结构。

## 4. 数据模型

每个设备使用稳定 ID（hardware identifier + sensor identifier 的规范化哈希），不要用可翻译名称作主键。

```ts
interface HardwareSnapshot {
  sequence: number
  sampledAt: number
  intervalMs: number
  cpu: CpuSnapshot[]
  gpu: GpuSnapshot[]
  memory: MemorySnapshot | null
  storage: StorageSnapshot[]
  diagnostics: MonitorDiagnostic[]
}
```

CPU：总负载、各核心/线程负载、温度、功耗、有效频率；GPU：核心负载、显存占用、温度、功耗、核心/显存频率、风扇（存在才显示）；内存：已用、可用、总量、负载；硬盘：空间占用、读写负载、读写速率、温度（存在才显示）。

“缺失”必须使用 `null`，不能用 0 代替，避免把权限不足误显示为零温度或零功耗。

多 CPU/GPU/硬盘设备通过详情页选择器切换。首屏默认选择：有有效负载传感器的首个 CPU；优先独显，其次集显；系统盘优先。

## 5. UI 方案

### 5.1 命令 Tab 下方摘要

通过新增 Desktop-only `inspectorWidgets` 扩展点注入，不把硬件逻辑写入共享 Web 页面。

- 卡片高度目标 170–210px。
- CPU 大表：0–100%，绿色到黄色再到红色，中心显示整数百分比，下方显示温度/频率中的可用项。
- GPU 大表：同样为 0–100%，视觉刻度可模拟转速表，但数值语义明确写“GPU 占用”，不伪装为 RPM。
- 内存小表：半圆油量表，显示使用百分比与 `已用 / 总量`。
- 卡片标题显示采样状态和时间；不可用时显示 `--` 与简短原因。
- 整张卡片可点击，键盘 Enter/Space 可进入详情页；仪表本身带可访问文本。

右侧检查器需要 `ResizeObserver` 自适应：检查器总高度能放入有效视口时保持 sticky；加入摘要后超过可用高度则回到页面流，确保不会重现底部截断，也不强制增加检查器滚动条。

### 5.2 性能详情页

采用 Desktop renderer 内的全屏 overlay/page，不修改 URL，不进入 Web 路由：

```text
┌ CPU 设备选择 ─ GPU 设备选择 ─ 采样状态 ─ 暂停 ─ 关闭 ┐
│ CPU 总览与每核心曲线（约 45%） │ GPU 指标与曲线（右上） │
│                                ├─────────────────────┤
│                                │ 内存 + 硬盘（右下）  │
└────────────────────────────────┴─────────────────────┘
```

- CPU 各核心默认按逻辑处理器显示；超过 32 线程时支持“全部 / 分组 / 最忙 16 核”，避免图表不可读。
- GPU 上方展示负载、显存、温度、功耗和频率；缺失项自动隐藏，不保留空格子。
- 内存显示用量时间序列；硬盘可选择设备，显示空间与 I/O，不把空间占用和瞬时 I/O 混为一个百分比。
- 默认历史窗口 5 分钟；1 秒采样对应最多 300 点/序列。可切换 1/5/15 分钟时使用降采样而不是无限增长。
- 首版仪表使用 SVG，时间序列使用 Canvas；避免为了少量图表立即引入大型图表库。高 DPI 下按 devicePixelRatio 绘制。
- 支持 `prefers-reduced-motion`，指针变化使用短插值但不持续弹簧动画。

## 6. 采样、性能与编码联动

- 默认采样间隔 1000ms；详情页打开时仍保持 1000ms，首版不追求 60 FPS 假实时。
- 仪表指针可在 renderer 内以 150–250ms 插值，数据采集频率不因此提高。
- UI 不可见或窗口最小化时降为 3000ms；恢复后立即请求一次快照。
- 辅助进程单次更新超过 800ms 时记录 slow-sample，并自动把间隔退避到 2000ms。
- FFmpeg 编码期间不提高采样率；监控自身 CPU 开销目标：空闲平均 <1% 单核，renderer 每秒最多提交一次图表更新。
- 历史缓冲只在内存中，首版不写磁盘；性能监控事件只记录启动、停止、崩溃和权限问题，不记录每秒快照。

## 7. 权限、失败与隐私

- 首版不要求 FFCodec Lab 整体管理员运行。
- 非管理员拿不到的传感器显示“权限或硬件不支持”，基础 CPU/GPU/内存负载能读多少显示多少。
- “以管理员权限重新启动监控 helper”作为可选后续 Phase，不能悄悄弹 UAC，也不提升 Electron renderer。
- helper 启动失败、协议错误或异常退出：最多指数退避重启 3 次；之后进入 unavailable，提供手动重试。
- 采集数据只在本机进程间流动，不上传访问统计接口，不写编码日志，不包含序列号等设备身份信息。
- 硬盘型号可显示；序列号、主板 UUID、MAC 地址必须在 normalizer 层丢弃。

## 8. 打包与许可证

当前仓库只有 Electron production build，Windows 安装包脚本尚未真正落地，因此监控功能应把 Desktop packaging 作为正式交付门槛：

1. 新增 .NET helper 的 restore/build/publish 脚本。
2. Electron dev 模式从 helper publish 输出启动；packaged 模式从 `process.resourcesPath` 启动。
3. Windows 打包将 helper、LibreHardwareMonitorLib 依赖和 native libraries 放入 `extraResources`，不能打进 asar 后直接执行。
4. 分发包加入 LibreHardwareMonitor `LICENSE`、`THIRD-PARTY-LICENSES`、版本和官方源码链接；项目 About/开源许可页可查看。
5. CI 校验固定 NuGet 版本、许可证文件存在、helper SHA-256 和安装包内资源清单。

许可证执行细节在发布前应做一次人工复核；本文不是法律意见。

## 9. 分阶段实施

### Phase PM-0：技术探针

- 建立最小 .NET 8 console helper。
- 在目标机器非管理员运行，导出一次完整 sensor tree JSON。
- 测量启动时间、单次采样耗时、CPU 开销、稳定版 NuGet 体积。
- 形成传感器映射样本，确认 Intel/AMD CPU 与 NVIDIA/AMD/Intel GPU 的名称差异。

验收：连续运行 30 分钟无泄漏/崩溃；helper 退出后无残留进程；权限不足时仍返回结构化结果。

### Phase PM-1：协议与 Desktop 后端

- 完成 JSON Lines 协议、主进程生命周期、快照归一化、环形缓冲与 typed IPC。
- 增加 mock helper，使 CI 不依赖真实硬件。
- 单元测试协议截断、乱码、NaN、超大消息、崩溃重启和退出清理。

验收：renderer 只能获得白名单快照；Desktop/编码退出不残留 helper；helper 缺失不影响主程序。

### Phase PM-2：摘要仪表盘

- 新增 `inspectorWidgets` 扩展点和 Desktop 性能摘要组件。
- SVG 实现 CPU/GPU 大表、内存小表、缺失态与点击/键盘入口。
- 完成右侧检查器高度自适应吸附，专门回归此前页面底部显示问题。

验收：1280×720 锁定窗口下按钮与摘要不截断；解锁小窗口可访问全部内容；Web bundle 不包含监控组件。

### Phase PM-3：性能详情页

- 实现全屏详情 overlay、设备选择、CPU 每核心、GPU、内存、硬盘面板。
- Canvas 时间序列、5 分钟环形历史、暂停/恢复、空值处理和高线程数聚合。
- 增加 mock snapshots 的视觉回归场景：单 GPU、多 GPU、64/128 线程、无温度、权限不足、硬盘无活动传感器。

验收：详情页持续 1 小时内存稳定；切换设备不串线；关闭后释放 animation frame、listener 和 canvas 资源。

### Phase PM-4：分发与实机矩阵

- 落地 Windows installer/portable packaging 和 `extraResources`。
- 验证普通用户、管理员、无 .NET Runtime、不同 DPI、多显示器。
- 硬件矩阵至少覆盖 Intel CPU + NVIDIA GPU、AMD CPU + AMD GPU、Intel 核显、NVMe + SATA；缺少的组合使用社区/人工测试补充并明确标记。
- 完成 MPL/第三方许可证展示与安装包资源审计。

验收：全新 Windows 环境无需另装 .NET 即可监控；卸载不遗留 helper；禁用监控后 FFmpeg 功能完全可用。

## 10. 测试清单

- C#：normalizer、sensor tree、null/NaN、协议、取消与资源释放。
- Node：helper 生命周期、stdio 分帧、消息上限、重启、IPC 权限边界。
- React：仪表值、不可用态、设备切换、详情页开关、listener 清理、键盘操作。
- 集成：mock helper → main → preload → renderer 全链路。
- 性能：1/3 秒采样、最小化、详情页 1 小时、FFmpeg 高负载编码并行。
- 回归：窗口尺寸锁、参数工作台与命令检查器吸附、状态栏、日志弹窗、退出活动编码任务。

## 11. 实施前决策

建议直接采用以下默认值：

- 稳定版 `LibreHardwareMonitorLib 0.9.6`。
- .NET 8 self-contained single-file `win-x64` helper，trim disabled。
- 1 秒采样、5 分钟内存历史、页面最小化后 3 秒采样。
- 首版非管理员、只读、无网络、无持久化。
- 摘要 SVG + 详情 Canvas，不新增大型图表依赖。
- 先 PM-0 探针，拿到本机真实 sensor tree 后再冻结 UI 字段映射。

实施前唯一需要产品确认的是：性能监控默认随 Desktop 启动，还是首次点击仪表盘后才启动。技术上更推荐按需启动，以减少不使用该功能时的资源与权限影响。
