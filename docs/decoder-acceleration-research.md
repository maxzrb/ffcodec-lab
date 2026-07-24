# 解码器与硬件加速功能引入研究

研究日期：2026-07-24

## 结论

截图对应 FFmpegFreeUI v6 的“解码参数”面板，目标不是选择具体的 H.264/HEVC 解码器，而是为主输入配置 FFmpeg 的输入侧解码选项：

| 界面项 | FFmpeg 参数 | 截图中的候选值 | 参数位置 |
|---|---|---|---|
| 硬件加速解码方式 | `-hwaccel` | `d3d11va`、`d3d12va`、`cuda`、`qsv`、`amf`、`vulkan`、`dxva2`、`vaapi`、`opencl` | 主输入 `-i` 前 |
| CPU 解码线程数 | `-threads` | 正整数 | 主输入 `-i` 前 |
| 解码数据格式 | `-hwaccel_output_format` | `nv12`、`yuv420p`、`p010`、`d3d11` | 主输入 `-i` 前 |
| 硬件加速解码设备 | `-hwaccel_device` 等 | 参数名 + 自定义值 | 需按参数名区分 |

默认状态应当四项都不设置。硬件解码不是普遍的性能开关：它依赖 FFmpeg 构建、操作系统、GPU 驱动、输入编码器和后续滤镜/编码器，未知时必须允许用户保留空值。

## 来源与实测

- 上游面板：`Lake1059/FFmpegFreeUI` 的 `Form_v6_参数面板_解码参数.Designer.vb`。其中解码方式候选值与截图一致，设备参数名为空、`-hwaccel_device`、`-init_hw_device`、`-qsv_device`。
- 上游命令生成：`功能/预设系统/预设命令行输入输出_v6.vb` 的 `生成解码参数`，只有值非空时才发射参数，并将片段放入主输入前。
- 本机 FFmpeg：`ffmpeg version 8.1.1-full_build-www.gyan.dev`。`ffmpeg -hwaccels` 返回 `cuda`、`dxva2`、`qsv`、`d3d11va`、`opencl`、`vulkan`、`d3d12va`、`amf`；`vaapi` 虽被该构建编译，但 Windows 运行时不出现在可用加速列表中。
- 本机 `-h full` 确认了 `-hwaccel[:stream_spec]`、`-hwaccel_device[:stream_spec]`、`-hwaccel_output_format[:stream_spec]`、`-threads`、`-qsv_device` 和 `-init_hw_device`。

## 对当前架构的影响

当前 `ProjectConfig` 没有解码配置，只有编码侧 `video.threads`。命令层已经具备所需的结构：

1. `buildInputs` 为主输入保留 `argsBeforeInput`，可生成输入侧解码参数。
2. `globalArgs` 适合承载 `-init_hw_device` 这类全局初始化参数。
3. `ResolvedField.configBinding`、Zod schema、迁移和分享编码器可复用现有配置管道。

建议增加独立的 `decode` 配置，而不是复用 `video.specialParameters` 或 `video.threads`：

```ts
interface DecodeConfig {
  hwaccel?: 'd3d11va' | 'd3d12va' | 'cuda' | 'qsv' | 'amf' | 'vulkan' | 'dxva2' | 'vaapi' | 'opencl'
  threads?: number
  outputFormat?: 'nv12' | 'yuv420p' | 'p010' | 'd3d11'
  device?: {
    parameter?: 'hwaccel_device' | 'init_hw_device' | 'qsv_device'
    value?: string
  }
}
```

首版可将它挂在 `input.decode`，明确只作用于主输入；额外输入暂不继承主输入的硬件解码设置。这样不会误把外挂字幕或其他输入也套上相同设备参数。

## 命令与联动建议

默认配置应保持现有命令完全不变。显式设置后，单遍和双遍的每个相关 invocation 都要带同一组主输入解码参数，因为双遍第一遍也需要解码视频。

推荐的结构化输出如下：

```text
ffmpeg [全局参数]
  [-init_hw_device ...] [-qsv_device ...]
  [-hwaccel cuda] [-threads 8] [-hwaccel_output_format cuda]
  [-hwaccel_device 0]
  -i input.mkv ... output.mp4
```

需要特别处理以下情况：

- `video.mode === 'copy'` 或 `disabled` 时没有视频重解码需求，面板应显示不可用状态，避免生成无意义或失败的硬件参数。
- `outputFormat` 为 `d3d11`、`cuda`、`qsv` 等硬件帧格式时，后续 CPU 滤镜或软件编码器可能需要 `hwdownload`；当前项目没有硬件帧上传/下载滤镜链，因此首版应给出 warning，或先限制为软件格式 `nv12`/`yuv420p`/`p010`。
- `-init_hw_device` 是全局初始化语义，值不是简单的设备编号；应作为高级文本值并保留原始表达式，不要把它强行限制为数字。
- `-qsv_device`、`-vaapi_device` 是平台/设备专用参数；截图只列出前三个设备参数名，建议首版严格复刻这三个，后续再根据实际 FFmpeg 探测扩展。
- `-threads` 的作用受位置和流类型影响。解码线程必须放在主输入前；编码器自身的 `-threads` 仍由视频编码器参数单独生成，二者可以同时存在。

## 推荐实施阶段

### Phase A：领域与命令

- 新增 `DecodeConfig`、默认空值、schema v7 迁移。
- 增加输入前参数的结构化 AST，区分 `hwaccel_device` 与全局 `init_hw_device/qsv_device`。
- 为单遍、双遍分别增加命令快照测试，覆盖空配置、CUDA、CPU 线程和设备参数。

### Phase B：工作台

- 新增“解码”面板，按截图顺序提供四项控件；所有下拉都增加“不设置”。
- 复用现有解释、来源和双语 i18n；不在组件内硬编码 FFmpeg 业务判断。
- 视频复制/禁用时显示面板状态提示。

### Phase C：能力提示

- Desktop 在切换 FFmpeg 时读取 `ffmpeg -hwaccels`，将不在当前构建注册的方式标为 warning，不阻止用户复制命令。
- 后续可探测 `-devices`、GPU 驱动和硬件帧格式，但不能把“注册成功”宣传为“本机一定能运行”。

## 当前不建议直接做的事情

- 不把 `-hwaccel` 默认设为 `auto`：这会改变现有命令和用户的 CPU 基线。
- 不把 `amf`、`opencl`、`vaapi` 当作所有编码器的通用解码器；它们的实际支持取决于 FFmpeg 构建和平台。
- 不把硬件输出格式默认设置为 `cuda`/`d3d11`；当前滤镜管线没有显式 `hwdownload`/`hwupload` 保障。
- 不把设备值仅做数字输入；D3D、QSV、CUDA 和自定义硬件设备表达式的语法不同。

