# 音频编码器扩展与选择器交互调研

更新时间：2026-07-22  
状态：交互方案与 WAV 64-bit 语义已确认，待分阶段实施  
适用范围：Web 与 Desktop 共用的 `catalog / domain / workbench` 音频路径

## 1. 当前问题

当前共享音频目录只有 `aac`、`libopus`、`flac` 三项。Web 与 Desktop 使用同一目录和命令构建器，因此应在共享层扩展，不分别维护两套编码器。

现有平铺下拉框在只有三项时尚可使用；扩展到二三十项后，会出现以下问题：

1. 用户难以区分编码格式、具体实现、profile 和采样格式。
2. 平台专属或依赖外部库的 encoder 会在不支持的 FFmpeg 上直接失败。
3. 容器兼容性、是否有损、适用场景等选择依据在下拉项中不可见。
4. `NMR AAC`、`FDK AAC HE` 等“变体”若被建模成独立 encoder，会复制参数定义并导致后续漂移。

## 2. 官方核验：原生 AAC

### 2.1 `aac_coder` 的版本变化

FFmpeg 上游源码的当前合法算法是：

- `twoloop`
- `fast`
- `nmr`

重要时间点：

- 2025-02-08：上游提交 [`b3d73df80d`](https://github.com/FFmpeg/FFmpeg/commit/b3d73df80d) 删除 ANMR coder。
- 2026-06-10：上游提交 [`d1943afbb7`](https://github.com/FFmpeg/FFmpeg/commit/d1943afbb7) 加入 NMR coder。
- 2026-06-17：上游提交 [`0efac66e7e`](https://github.com/FFmpeg/FFmpeg/commit/0efac66e7e) 将 NMR 设为默认 coder。
- 2026-07-17：上游提交 [`9d0a4132ff`](https://github.com/FFmpeg/FFmpeg/commit/9d0a4132ff) 继续调整 NMR 立体声决策和带宽。

因此：

- 项目当前的 `anmr` 选项应删除。
- 用户所述命令正确：`-aac_coder nmr`，不是 `anmr`。
- NMR 目前具有很强的 FFmpeg 构建版本敏感性，不能假设所有已安装 FFmpeg 都支持。
- 本机当前 FFmpeg 的 `ffmpeg -h encoder=aac` 仍只列出 `twoloop/fast`，证明仅依据上游 master 建目录会让旧构建执行失败。
- “自动”应继续表示不发射 `-aac_coder`，交给用户实际 FFmpeg 构建选择默认值；如果用户要求可复现结果，则应明确选择 `twoloop`、`fast` 或受支持的 `nmr`。

### 2.2 AAC 进阶参数

依据 FFmpeg 当前 `libavcodec/aacenc.c`：

| UI 名称 | FFmpeg 参数 | 值域 | 建议默认行为 | 条件 |
|---|---|---:|---|---|
| 编码算法 | `-aac_coder` | `twoloop/fast/nmr` | 默认不发射 | `nmr` 需运行时/版本核验 |
| NMR 搜索速度 | `-aac_nmr_speed` | `0..4` | 默认不发射 | 仅 `aac_coder=nmr` 时显示 |
| M/S 立体声 | `-aac_ms` | auto/off/on | 默认不发射 | 三态控件 |
| 强度立体声 | `-aac_is` | auto/off/on | 默认不发射 | 三态控件；不要把“auto”误写成通用默认 |
| 感知噪声替代 | `-aac_pns` | auto/off/on | 默认不发射 | 三态控件 |
| 时域噪声整形 | `-aac_tns` | auto/off/on | 默认不发射 | 三态控件 |
| PCE 声道配置 | `-aac_pce` | auto/off/on | 默认不发射 | 三态控件 |

产品建议：三态控件显示为“跟随编码器默认 / 关闭 / 开启”，内部值分别使用“不发射 / 0 / 1”。除非对目标 FFmpeg 构建做过命令验证，不应仅因为 AVOption 接受 `-1` 就强制发射字符串 `auto`。

来源：

- [FFmpeg AAC encoder source](https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/aacenc.c)
- [FFmpeg encoder documentation](https://ffmpeg.org/ffmpeg-codecs.html#aac)

## 3. 用户候选项的正确建模

### 3.1 模式，不是 encoder

| 用户可见项 | 领域模型 | 命令 |
|---|---|---|
| 复制流 | `audio.mode=copy` | `-c:a copy` |
| 禁用 | `audio.mode=disabled` | `-an` |

这两项应保留在“音频处理方式”分段控件中，不混入 encoder 列表。

### 3.2 编码器与变体矩阵

| 用户名称 | FFmpeg encoder | 正确建模 | 可用性/备注 |
|---|---|---|---|
| AAC | `aac` | encoder + coder 控件 | 通常内置；不同构建默认 coder 不同 |
| NMR AAC | `aac` + `-aac_coder nmr` | AAC 预设/算法变体 | 2026-06-10 后上游 master；旧构建不可用 |
| FDK AAC | `libfdk_aac` + `-profile:a aac_low` | 一个 encoder 的 LC profile | 依赖 `--enable-libfdk-aac`，且许可证/构建相关 |
| FDK AAC HE | `libfdk_aac` + `-profile:a aac_he` | 同一 encoder 的 profile | 不是独立 encoder |
| FDK AAC HE v2 | `libfdk_aac` + `-profile:a aac_he_v2` | 同一 encoder 的 profile | 不是独立 encoder |
| AudioToolbox AAC | `aac_at` | 平台 encoder | 仅 Apple AudioToolbox 构建 |
| LAME MP3 | `libmp3lame` | encoder | 依赖 libmp3lame |
| Opus | 优先 `libopus`；原生 `opus` 另列实验实现 | encoder | `libopus` 依赖外部库；原生实现常带 experimental 标记 |
| FLAC | `flac` | encoder | 内置、无损 |
| ALAC | `alac` | encoder | 内置、无损 |
| AudioToolbox ALAC | `alac_at` | 平台 encoder | Apple 平台 |
| WAV 16-bit | `pcm_s16le` | PCM encoder | 实际可用于 WAV 等兼容容器 |
| WAV 32-bit | `pcm_s32le` | PCM encoder | 必须在标签中注明“有符号整数” |
| WAV 64-bit integer | `pcm_s64le` | PCM encoder | 64-bit little-endian 有符号整数，必须与浮点项分开显示 |
| WAV 64-bit float | `pcm_f64le` | PCM encoder | 64-bit little-endian 浮点，必须与整数项分开显示 |
| AudioToolbox PCM A-law | `pcm_alaw_at` | 平台 encoder | Apple 平台；也存在内置 `pcm_alaw` |
| AudioToolbox PCM mu-law | `pcm_mulaw_at` | 平台 encoder | Apple 平台；也存在内置 `pcm_mulaw` |
| ATSC A/52A (AC-3) | `ac3` | encoder | 内置；另有 `ac3_fixed` |
| ATSC A/52B (E-AC-3) | `eac3` | encoder | 内置 |
| DTS Coherent Acoustics | `dca` | encoder | 常带 experimental 标记，执行可能需要 `-strict experimental` |
| TrueHD | `truehd` | encoder | 常带 experimental 标记，容器限制严格 |
| AudioToolbox iLBC | `ilbc_at` | 平台 encoder | Apple 平台；部分构建也有 `libilbc` |
| True Audio | `tta` | encoder | 内置、无损 |
| Vorbis (ogg) | 优先 `libvorbis`；原生 `vorbis` 另列实验实现 | encoder | `libvorbis` 依赖外部库；不要把容器 Ogg 写成 codec 名的一部分 |
| RealAudio 1.0 (14.4K) | `real_144` | legacy encoder | codec ID 是 `ra_144`，CLI encoder 名是 `real_144` |
| WavPack | `wavpack` | encoder | 内置、无损 |
| “LAME MP2” | 不成立 | 改为 `mp2` 或 `libtwolame` | LAME 是 MP3 encoder；TwoLAME 才是 MP2 外部实现 |
| AMR-NB | `libopencore_amrnb` | encoder | 依赖外部库，窄带语音 |
| AMR-WB | `libvo_amrwbenc` | encoder | 依赖外部库，宽带语音 |

Apple encoder 名称已由 FFmpeg `libavcodec/audiotoolboxenc.c` 核验：`aac_at`、`alac_at`、`ilbc_at`、`pcm_alaw_at`、`pcm_mulaw_at`。

外部库和格式支持总览来源：[FFmpeg General Documentation](https://ffmpeg.org/general.html)。具体 encoder 参数应继续以 [`doc/encoders.texi`](https://github.com/FFmpeg/FFmpeg/blob/master/doc/encoders.texi) 和对应 `libavcodec/*enc.c` 为准。

## 4. 推荐的交互方案

### 4.1 不采用二三十项平铺下拉框

建议将当前“音频处理方式 + 编码器下拉框”升级为三级渐进式选择，但不改变底层配置的可分享性：

1. **处理方式分段控件**：`复制流 / 编码 / 禁用`。
2. **快捷推荐卡片**：根据容器和用途展示 4～6 个常用选择。
3. **全部编码器选择器**：可搜索、按类别分组，供高级用户展开。

推荐类别：

- 推荐：AAC、Opus、FLAC、MP3（根据容器动态排序）。
- AAC 家族：原生 AAC、FDK AAC、AudioToolbox AAC；NMR 和 HE/HE v2 放在选中后的“算法/profile”中。
- 通用有损：MP3、Opus、Vorbis、AC-3、E-AC-3、MP2。
- 无损：FLAC、ALAC、WavPack、TTA、TrueHD。
- PCM / WAV：16-bit、32-bit integer、64-bit integer/float（明确标注）。
- 平台专属：AudioToolbox 系列。
- 语音与旧格式：AMR-NB/WB、iLBC、RealAudio 14.4K。
- 实验性：原生 Opus/Vorbis、DTS、TrueHD 等按实际 `ffmpeg -encoders` flags 标注。

### 4.2 每个选项必须提供选择依据

选择器行至少显示：

- 名称与实际 encoder 名，如 `FDK AAC · libfdk_aac`。
- `有损 / 无损 / PCM` badge。
- `内置 / 需外部库 / Apple / 实验性` badge。
- 当前输出容器的 `兼容 / 不推荐 / 不支持` 状态。
- 一句适用场景，例如“通用视频交付”“低延迟语音”“归档无损”。

选中后在同一区域显示“为什么选它”和建议：

- AAC：兼容性优先。
- Opus：WebM、语音和低码率效率优先。
- FLAC/ALAC：无损归档。
- PCM：无压缩、中间制作文件，体积很大。
- legacy/experimental：默认折叠，不进入推荐区。

### 4.3 双端可用性策略

Web 和 Desktop 共用编码器目录、参数与命令生成；只在“可用性来源”上不同：

- **Desktop**：启动或选择 FFmpeg 后缓存 `ffmpeg -encoders`；选择具体 encoder 时按需读取 `ffmpeg -h encoder=<name>`。不存在的 encoder 禁用，并显示“当前 FFmpeg 未提供”。NMR 必须检查 AAC 帮助中是否存在 `nmr` 和 `aac_nmr_speed`。
- **Web**：无法检测用户将来执行命令的 FFmpeg。外部库、Apple、实验性和 NMR 选项可选择，但必须显示构建要求；命令诊断给出可复制的检查命令。
- **共享领域层**：永远按目录生成结构化参数，不根据浏览器或 Electron 写两套业务逻辑。

## 5. 数据模型建议

不要为 profile/算法复制整份 `EncoderDefinition`。建议新增共享的变体层：

```ts
interface AudioEncoderVariantDefinition {
  id: string
  encoderId: string
  label: string
  fixedValues: Record<string, unknown>
  capabilityScope?: CapabilityScope
  recommendedFor?: string[]
}
```

示例：

- `aac-nmr` → `encoderId: aac`，固定 `audio.qualityValues.coder=nmr`。
- `fdk-aac-he` → `encoderId: libfdk_aac`，固定 profile 为 `aac_he`。
- `fdk-aac-he-v2` → 同一 encoder，profile 为 `aac_he_v2`。

PCM 因为 FFmpeg encoder 名确实不同，应继续使用独立 `EncoderDefinition`，但可共享工厂函数生成定义。

当前 `CodecFamily` 只有 `aac/opus/flac/other` 等少量音频 family。实施前应增加音频专用分类字段，避免把 MP3、PCM、Dolby、lossless 等全部塞进 `other`。不建议让视频的 `CODEC_CATEGORIES` 直接承担音频 UI 分组。

## 6. 推荐实施顺序

### Phase A：先修正确性

1. 删除 AAC `anmr`，增加版本敏感的 `nmr`。
2. 增加 `aac_nmr_speed`，仅在 NMR 时显示。
3. 增加 `aac_ms/is/pns/tns/pce` 三态控件，默认不发射。
4. 补命令测试：旧默认不发射 coder、NMR 显式发射、非 NMR 不发射 speed。

### Phase B：核心常用编码器

优先加入并完整实现：

- `libfdk_aac`
- `libmp3lame`
- `alac`
- `ac3`
- `eac3`
- `wavpack`
- `libvorbis`
- PCM 16/32/64（先确认 64-bit 语义）

### Phase C：选择器重构

实现“处理方式分段控件 + 推荐卡片 + 可搜索分组选择器”，并接入容器兼容状态。

### Phase D：平台、语音、legacy、experimental

加入 AudioToolbox、AMR、iLBC、DTS、TrueHD、TTA、RealAudio、MP2/TwoLAME 等，并完成 Desktop 运行时可用性检测。

## 7. 验收清单

- [ ] Web/Desktop 对相同配置生成完全相同的音频参数。
- [ ] `copy` 和 `disabled` 不进入 encoder 目录。
- [ ] AAC 不再出现 `anmr`。
- [ ] 仅支持 NMR 的 FFmpeg 才允许 Desktop 选择 `-aac_coder nmr`。
- [ ] `aac_nmr_speed` 只在 NMR 下可见和发射。
- [ ] FDK LC/HE/HE v2 复用一个 `libfdk_aac` 定义。
- [ ] “LAME MP2”改为原生 MP2或 TwoLAME MP2。
- [ ] WAV 64-bit 明确 integer 或 float。
- [ ] 平台/外部库 encoder 有明确 badge 和诊断。
- [ ] 不兼容容器不会静默生成必然失败的命令。
- [ ] 选择器支持键盘、搜索、分类和中英文。
- [ ] 每个新增 encoder 至少有默认命令、显式进阶参数、copy/disabled 隔离和容器诊断测试。

## 8. 已确认的产品决策

2026-07-22 用户确认：

1. 采用“常用推荐卡片 + 可搜索、分类的全部编码器选择器”结构。
2. WAV 64-bit 同时提供两项：`pcm_s64le`（64-bit signed integer）和 `pcm_f64le`（64-bit float），UI 必须明确区分整数与浮点。

仍待实施阶段确认：NMR 在 Web 允许生成并显示强警告，还是在正式 FFmpeg release 普及前放入“实验/新版”分组。当前建议为允许生成、明确版本要求，并在 Desktop 按实际能力禁用。

## 9. 响度标准化（FFmpeg loudnorm）核验

核验日期：2026-07-22。官方来源：[FFmpeg Filters Documentation — loudnorm](https://ffmpeg.org/ffmpeg-filters.html#loudnorm)，并交叉核对 FFmpeg `libavfilter/af_loudnorm.c` 选项表。

- `I`：目标综合响度，合法范围 `-70.0` 至 `-5.0` LUFS，官方默认 `-24.0`。
- `LRA`：目标响度范围，合法范围 `1.0` 至 `50.0` LU，官方默认 `7.0`。
- `TP`：最大真峰值，合法范围 `-9.0` 至 `0.0` dBTP，官方默认 `-2.0`。
- `dual_mono`：仅用于“单声道内容预期在立体声系统播放”的补偿，默认关闭。
- 动态模式会为了准确检测真峰值将音频内部上采样至 192 kHz；应使用输出 `-ar` 或 `aresample` 明确最终采样率。本项目已有音频输出采样率控制。
- 线性双遍模式必须同时提供 `measured_I`、`measured_LRA`、`measured_TP`、`measured_thresh`；目标条件不满足时仍会回退动态模式。因此当前版本只实现诚实的单遍动态模式，并显式生成 `linear=false`，待执行器支持自动测量/第二遍后再加入双遍。

产品实现采用三个独立开关：I、LRA、TP 仅在各自启用时写入滤镜；三项全部关闭时不生成 `loudnorm`。每项同时提供官方范围滑杆和精确数字输入。
