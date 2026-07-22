# FFmpeg 流编码 vs 复制研究

> 2026-07-23

## 核心诉求

用户期望的 FFmpeg 行为：
- **默认全流参与编码**（选中即编码，复制需显式切换）
- **显式切换到"复制"的流原样保留**

## FFmpeg 命令目标

用户模型：**勾选保留 → 标记编码/复制 → 其余丢弃**。

```
输入文件 ─┬─ 视频流 0 → [✓选中] → [编码: libx264] ─┐
          ├─ 视频流 1 → [✓选中] → [复制]          ├─ 输出文件
          ├─ 音频流 0 → [✓选中] → [编码: aac]     │
          ├─ 音频流 1 → [✓选中] → [复制]          │
          ├─ 字幕流 0 → [✓选中] → [复制]          │
          └─ 字幕流 1 → [✗丢弃]                  ─┘

默认：选中 = 编码；复制需显式切换。
```

对应的 FFmpeg 命令必须是逐流显式 `-map` + 逐流 `-c`：

```bash
ffmpeg -i input.mkv \
  -map 0:v:0 -c:v:0 libx264 -b:v:0 5M \
  -map 0:v:1 -c:v:1 copy \
  -map 0:a:0 -c:a:0 aac -b:a:0 192k \
  -map 0:a:1 -c:a:1 copy \
  -map 0:s:0 -c:s:0 copy \
  output.mkv
```

**这就是方案 B（逐流显式映射）**——唯一的区别是 UI 应从"盲填索引号"变成"勾选 + 编码/复制"。

## 当前项目实现 vs 目标

### 当前生成的命令

```
ffmpeg -i input.mkv \
  -map 0:v:0? -map 0:a:0? -map 0:s? \
  -c:v libx264 \
  -c:a aac \
  -c:s copy \
  output.mkv
```

### 问题

| 问题 | 描述 |
|------|------|
| 未映射的流丢失 | `-map 0:v:0?` 只选第 0 条视频流，输入里的视频流 1、2 直接被丢弃 |
| 同类流必须同编解码 | 全部视频都用 `-c:v libx264`，无法"流 0 编码、流 1 复制" |
| 无 `-c copy` 兜底 | 没有"未指定流默认复制"的机制 |

### 目标命令（方案 A）

```
ffmpeg -i input.mkv \
  -map 0 \
  -c copy \
  -c:v:0 libx264 -b:v:0 5M \
  -c:a:0 aac -b:a:0 192k \
  output.mkv
```

### 目标命令（方案 B，精确版）

```
ffmpeg -i input.mkv \
  -map 0:v:0 -c:v:0 libx264 -b:v:0 5M \
  -map 0:v:1 -c:v:1 copy \
  -map 0:a:0 -c:a:0 aac -b:a:0 192k \
  -map 0:a:1 -c:a:1 copy \
  -map 0:s? -c:s copy \
  output.mkv
```

## 需要改造的地方

### 1. 数据模型：`StreamSelectionConfig` → 添加逐流编码模式

```ts
// 当前
interface StreamSelectionConfig {
  videoStreamIndexes: number[]
  audioStreamIndexes: number[]
  subtitleStreamIndexes: number[]
  preserveOtherVideoStreams: boolean
  preserveOtherAudioStreams: boolean
  preserveOtherSubtitleStreams: boolean
}

// 目标：每条映射的流带有 codec 模式
interface StreamMapEntry {
  streamType: 'video' | 'audio' | 'subtitle'
  streamIndex: number          // 相对该类型的索引
  codecMode: 'encode' | 'copy' // 编码 or 复制
  codec?: string               // encode 时使用什么编码器
}

interface StreamSelectionConfig {
  entries: StreamMapEntry[]    // 显式映射条目
  copyAllOther: boolean        // 其余流全部复制（方案 A）
  excludeTypes: StreamType[]   // 排除的类型（如排除 data/attachment）
}
```

### 2. 命令生成器：`buildOutput()` 改造

当前逻辑（简化）：
```
if (explicitStreamMapping) {
  for each videoIndex → -map 0:v:N?
  for each audioIndex → -map 0:a:N?
  for each subtitleIndex → -map 0:s:N?
}
-c:v codec  (全局)
-c:a codec  (全局)
-c:s codec  (全局)
```

目标逻辑（方案 A + B 混合）：
```
if (copyAllOther) {
  -map 0        （全部流）
  -c copy       （默认全部复制）
  for each encode entry → -c:v:N codec -b:v:N bitrate
                         → -c:a:N codec -b:a:N bitrate
} else {
  for each entry → -map 0:v:N -c:v:N (encode|copy)
                → -map 0:a:N -c:a:N (encode|copy)
                → -map 0:s:N -c:s:N copy
}
```

### 3. UI 改造

当前 UI 有三个 multiselect（选流索引）+ 三个 switch（保留全部）。

目标 UI：
- **流映射模式选择**：`-map 0 -c copy`（推荐）/ 精确逐流映射
- **逐流映射表**：每条流一行，含「类型」「索引」「编解码模式（编码/复制）」「编码器（仅编码时）」
- **默认复制未选中流**：一个勾选开关

### 4. 流索引的全局 vs 相对

关键问题：`-c:v:0` 中的 `0` 是**该类型内的第几条**，不是全局流索引。
- 输入有视频流 0#1、视频流 0#2、音频流 0#3、音频流 0#4
- `-c:v:0` = 视频流 #1, `-c:v:1` = 视频流 #2
- `-c:a:0` = 音频流 #3, `-c:a:1` = 音频流 #4

当前项目的 `videoStreamIndexes: [0, 1]` 已经用了类型内索引（`0:v:0`, `0:v:1`），但编解码器选项是全局的（`-c:v` 而非 `-c:v:0`）。需要把编码器参数从全局下沉到逐流。

## 实施建议

### 核心改动

**数据模型**：`StreamSelectionConfig` 改为每条流携带 `codecMode`：

```ts
interface StreamMapEntry {
  streamIndex: number           // 类型内索引（0=v:0, 1=v:1）
  codecMode: 'encode' | 'copy'  // 编码 or 复制
  codec?: string                // encode 时的编码器名
}
// 按类型分组
streams: {
  video: StreamMapEntry[]     // 如 [{index:0, mode:'encode', codec:'libx264'}, {index:1, mode:'copy'}]
  audio: StreamMapEntry[]
  subtitle: StreamMapEntry[]  // 通常全是 copy
}
```

**命令生成**：每项各自生成 `-map` + `-c`：
```
video[0] encode → -map 0:v:0 -c:v:0 libx264
video[1] copy   → -map 0:v:1 -c:v:1 copy
audio[0] encode → -map 0:a:0 -c:a:0 aac
audio[1] copy   → -map 0:a:1 -c:a:1 copy
```

编码器私有参数（`-b:v`, `-preset` 等）也需从全局改为逐流：
```
-c:v:0 libx264 → -b:v:0 5M（而非 -b:v 5M）
```

### UI 改造方向

当前是多选索引 + 保留开关。目标：

1. **流列表**：展示输入文件的每条流（类型图标 + 序号 + 编码/复制开关）
2. **编码时展开编码器选项**（与当前相同，但作用域从全局变为该流）
3. **默认规则**：选中的流默认编码，复制需显式切换。初始状态：视频流 0 选中+编码、音频流 0 选中+编码、字幕流 0 选中+编码

### 暂不处理

- 元数据筛选（`-map 0:m:language:eng`）—— 后续
- ffprobe 集成（自动探测输入流）—— 依赖 Desktop 已有能力，可后续接
