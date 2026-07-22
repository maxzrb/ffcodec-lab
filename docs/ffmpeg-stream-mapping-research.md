# FFmpeg 流映射（-map）研究

> 研究日期：2026-07-23

## 一、FFmpeg `-map` 官方语义

### 默认行为（无 `-map`）

不显式指定 `-map` 时，FFmpeg 从每个输入文件中**各选择一个"最佳"流**：
- 1 条视频流（最佳质量）
- 1 条音频流（最佳质量）
- 1 条字幕流（如果有）

**一旦显式指定任何 `-map`，默认选择全部被禁用**，仅保留显式映射的流。

### `-map` 语法

```
-map input_file_index:stream_specifier
```

**流标识符（stream_specifier）语法**：

| 形式 | 含义 | 示例 |
|------|------|------|
| `v` / `V` | 所有视频流 / 非纯图像视频流 | `-map 0:v` |
| `a` | 所有音频流 | `-map 0:a` |
| `s` | 所有字幕流 | `-map 0:s` |
| `d` | 所有数据流 | `-map 0:d` |
| `t` | 所有附件流 | `-map 0:t` |
| `v:N` / `a:N` / `s:N` | 第 N 条视频/音频/字幕流（0-based） | `-map 0:a:0` |
| `N` (数字) | 全局流索引 | `-map 0:3` |
| `m:key:value` | 按元数据选择 | `-map 0:m:language:eng` |
| `#id` | 按格式特定 ID 选择 | 罕见 |

**可选标记 `?`**：`-map 0:a:2?` —— 若流不存在不报错，跳过。

**负映射**：`-map -0:a:1` —— 排除特定流。

### 快捷开关

| 选项 | 等价于 |
|------|--------|
| `-vn` | 禁用视频输出 |
| `-an` | 禁用音频输出 |
| `-sn` | 禁用字幕输出 |
| `-dn` | 禁用数据输出 |

### 关键约束

1. **视频流必须按类型映射**：`-map` 选出的是 FFmpeg 解码后的流。如果视频编码器在 `-c:v` 指定，你只能输出被映射为 video type 的流。试图把音频流映射到视频输出会失败。
2. **字幕/附件不经过编码器**：它们直接拷贝（或通过 `-c:s` 转码）。
3. **多文件输入**：每个文件有独立的 input_file_index（从 0 开始）。`-map 1:a:0` 指第二个输入文件的第一条音频流。
4. **-map 0** ：映射输入 0 的全部流。慎用——它会输出**所有**类型的流（包括封面、章节等），可能导致容器报错。

## 二、当前项目实现

### 核心文件

| 文件 | 作用 |
|------|------|
| `packages/domain/src/command/command-builder.ts:201-261` | `-map` 生成核心逻辑 |
| `packages/domain/src/config/project-config.ts:69-85` | `StreamSelectionConfig` 类型定义 |
| `packages/domain/src/config/defaults.ts:34-41` | 流选择默认值 |
| `packages/domain/src/presentation/resolve-section.ts:51-148` | 流选择 UI（输入与输出区） |

### 当前 `-map` 生成逻辑

```
videoStreamIndexes: [0] → "-map" "0:v:0?"
audioStreamIndexes: [0] → "-map" "0:a:0?"
subtitleStreamIndexes: [0] → "-map" "0:s:0?"
```

保留勾选：
```
preserveOtherVideoStreams → "-map" "0:v?"  (全部视频流)
preserveOtherAudioStreams → "-map" "0:a?"  (全部音频流)
preserveOtherSubtitleStreams → "-map" "0:s?" (全部字幕流，默认开启)
```

### 现有问题和不足

1. **默认只选 0 号流**：`videoStreamIndexes: [0]` 意味着只处理第一条视频流。若输入有 3 条视频流，第 2、3 条会被丢弃（除非开 "preserve" 开关）。
2. **无流类型发现**：用户不知道输入文件里有几条视频/音频/字幕流，只能盲填索引号。
3. **"全部保留" 是粗粒度的**：`preserveOtherVideoStreams` 要么全选，要么手动指定。无法"选前 2 条视频流"、"选英语和日语音轨"。
4. **跨类型不关联**：视频和音频流索引独立设置，但实际使用中经常需要对应（如"视频流 1 配音频流 3"）。
5. **默认字幕保留**：`preserveOtherSubtitleStreams: true` 是默认值，意味着默认输出全部字幕流——这是合理的，但也意味着即使不设字幕也会打 `-map 0:s?`。
6. **无位移逻辑**：用户指定 `videoStreamIndexes: [1]`（选第 2 条视频流），输出时它在文件里变为流 #0。如果同时选了 `audioStreamIndexes: [0, 1]`，输出流 #1、#2 是音频。但用户可能期望输出时视频保持为第一条流。

## 三、FFmpeg 流选择官方文档关键要点

来源：https://ffmpeg.org/ffmpeg.html#Stream-selection

### 流选择分三个阶段

1. **自动流选择（automatic stream selection）**：若未指定 `-map`，按类型各选一个"最佳"流。
2. **显式映射（explicit mapping）**：`-map` 选项加入的流。一旦有任何 `-map`，自动选择暂停。
3. **负映射（negative mapping）**：用 `-map -input:specifier` 排除流。

### 流类型（Stream type）

FFmpeg 内部区分：
- **video**：含纯图像（JPEG 等）和视频序列
- **audio**
- **subtitle**
- **data**：非 AV 数据轨
- **attachment**：封面图、字体等

`-map 0:v` 选择**所有视频流**（包括图像）。`-map 0:V` 只选**非纯图像视频流**。

### `-map` 与编解码器交互

```
ffmpeg -i input.mkv \
  -map 0:v:0 -c:v libx264 \
  -map 0:a:0 -c:a aac \
  -map 0:a:1 -c:a copy \
  -map 0:s? -c:s mov_text \
  output.mp4
```

- `0:v:0` → libx264 编码
- `0:a:0` → AAC 编码
- `0:a:1` → 音频拷贝
- `0:s?` → 字幕转 mov_text（若没有字幕则跳过）

每条映射的流顺序按 **`-map` 出现的顺序**排列在输出文件中。

### `-map` 的四种流选择方式对比

| 方式 | 粒度 | 适用场景 |
|------|------|----------|
| 无 `-map` | 自动（最佳流） | 简单转码，单视频+单音频 |
| `-map 0:v -map 0:a` | 按类型全选 | 保留全部同类型流 |
| `-map 0:v:0 -map 0:a:1` | 精确索引 | 挑选特定流 |
| `-map 0:m:language:jpn` | 按元数据 | 语言筛选、字幕选择 |
| `-map -0:a:1` | 排除法 | "全部除了" |

## 四、改进方向

### 短期（增量改进）

1. **添加 `-map` 模式选择器**：替代目前的"保留其他流"开关，提供 3 种模式：
   - **精确**：仅映射用户指定的流索引（当前行为 + 可多选）
   - **按类型全部**：`-map 0:v` / `-map 0:a`（全部保留）
   - **智能**：自动选第一个视频流 + 第一个音频流（默认）

2. **流数量提示**：在 UI 的流索引输入旁提示"请输入流索引"，或使用 ffprobe 探测实际流数量。

### 中期（结构改进）

3. **支持流元数据筛选**：允许按语言选择音轨/字幕轨（`-map 0:m:language:eng`）。

4. **流编排视图**：在参数工作台中列出输入文件探测到的所有流，用户可以拖拽/勾选来决定哪些进入输出。

### 长期（完全重做）

5. **输入分析器**：集成 ffprobe，编码前分析输入文件，生成可视化流表，支持拖拽排序以决定输出流顺序。

## 五、待确认问题

1. 当用户指定的 `videoStreamIndexes: [2]` 但输入只有 2 条视频流（索引 0、1）时，`-map 0:v:2?` 的 `?` 修饰会让 FFmpeg 静默跳过——输出无视频流。这种情况应对用户有警告吗？
2. 当前 `preserveOtherSubtitleStreams` 默认为 `true`，这是否是合理默认值（避免意外丢失字幕）？
3. 是否需要支持"从所有输入复制所有流"的快速通道（`-map 0 -map 1 ... -c copy` 的 remux 模式）？
