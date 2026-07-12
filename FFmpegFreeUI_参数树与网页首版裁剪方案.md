# FFmpegFreeUI 参数树与网页首版裁剪方案

> 整理依据：Lake1059/FFmpegFreeUI 主分支 v6 系列源码，整理日期 2026-07-10。  
> 本文目标不是复刻 3FUI 界面，而是把源码中的参数组织方式转换为适合“纯 FFmpeg 命令生成网页”的数据树。

## 0. 建议采用的三层模型

3FUI 的参数不宜压成一棵只有父子关系的静态树。网页端建议同时保留三层：

```text
参数导航树
├─ 决定页面分组、折叠层级和控件位置

参数能力树
├─ 编码器分类 → 具体编码器 → preset/profile/tune/pix_fmt/专用参数

依赖规则图
└─ visibleWhen / enabledWhen / requires / conflicts / transforms
```

其中，导航树负责“看起来像树”，能力树负责“选中父项后加载哪些子项”，依赖规则图负责跨分支联动，例如：

```text
视频编码器 = copy
→ 禁用质量控制、分辨率、帧率、像素格式、烧录字幕

字幕处理 = 烧录
→ 要求视频重新编码
→ 生成 subtitles/ass 视频滤镜

输出容器 = mp4
→ 字幕转码优先 mov_text

输出容器 = webm
→ 字幕转码优先 webvtt
```

---

# 一、3FUI 源码参数总树

```text
FFmpegFreeUI 预设 v6
├─ A. 预设信息
│  ├─ 预设备注
│  └─ 预设文件版本
│
├─ B. 输出设置
│  ├─ 输出容器
│  ├─ 输出文件参数使用方法
│  │  ├─ 正常使用
│  │  ├─ 不附加输出文件参数
│  │  └─ 声明丢弃输出
│  ├─ 输出目录
│  ├─ 自动命名
│  │  ├─ 不自动命名
│  │  ├─ 递增时间戳
│  │  ├─ 递增编号
│  │  ├─ 附加 3FUI
│  │  ├─ 附加编码器与质量值
│  │  ├─ 随机数字/字母组合
│  │  └─ 自定义前缀、替代文本、后缀
│  └─ 保留文件时间
│     ├─ 创建时间
│     ├─ 修改时间
│     └─ 访问时间
│
├─ C. 解码设置
│  ├─ 解码器
│  ├─ CPU 解码线程数
│  ├─ 解码数据格式
│  └─ 硬件设备参数
│     ├─ 参数名
│     └─ 参数值
│
├─ D. 视频编码器
│  ├─ 类型
│  │  ├─ 未选择
│  │  ├─ 视频
│  │  └─ 图片
│  ├─ 分类
│  ├─ 具体编码器
│  ├─ 编码器通用子项（由具体编码器动态决定）
│  │  ├─ 编码预设 preset
│  │  ├─ 配置文件 profile
│  │  ├─ 场景优化 tune/usage
│  │  ├─ 像素格式 pix_fmt
│  │  ├─ 图片质量
│  │  ├─ GPU 索引
│  │  └─ 编码线程数
│  └─ 编码器数据库附加信息
│     ├─ 可用性说明
│     ├─ 视觉与体积均衡点
│     ├─ 无损模式说明
│     ├─ 是否支持二次编码
│     ├─ 特殊参数列表
│     ├─ 必要参数列表
│     └─ 默认附加参数列表
│
├─ E. 画面帧
│  ├─ 分辨率
│  │  ├─ 直接指定宽×高
│  │  ├─ 自动计算宽度
│  │  ├─ 自动计算高度
│  │  └─ 裁剪参数
│  ├─ 输出帧率
│  ├─ 抽帧
│  ├─ 插帧
│  ├─ 动态模糊
│  ├─ 超分辨率
│  ├─ 降噪
│  ├─ 锐化
│  ├─ 胶片颗粒
│  ├─ 平滑断层/去色带
│  ├─ 扫描方式处理
│  ├─ 旋转与镜像
│  └─ 烧录字幕
│
├─ F. 视频质量控制
│  ├─ 控制方式
│  │  ├─ 未选择
│  │  ├─ CRF 恒定质量
│  │  ├─ VBR 动态码率
│  │  ├─ CQP 恒定量化
│  │  ├─ CBR 恒定速率
│  │  └─ TPE 二次编码
│  ├─ 质量参数名
│  │  ├─ -crf
│  │  ├─ -cq
│  │  ├─ -global_quality
│  │  └─ -qp
│  ├─ 质量值
│  ├─ 基础码率 -b:v
│  ├─ 最低码率 -minrate
│  ├─ 最高码率 -maxrate
│  ├─ 缓冲区 -bufsize
│  └─ 进阶参数集
│     ├─ 前瞻
│     ├─ GOP
│     ├─ B 帧
│     ├─ I/P/B 帧量化值
│     ├─ qmin/qmax
│     ├─ qcomp
│     ├─ 外部码率控制
│     ├─ 空间/时间 AQ
│     └─ level
│
├─ G. 色彩管理
│  ├─ 输出像素格式
│  ├─ 预转换像素格式
│  ├─ 色彩处理滤镜
│  ├─ 矩阵系数 colorspace
│  ├─ 色域 primaries
│  ├─ 传输特性 transfer
│  ├─ 色彩范围 range
│  ├─ 色调映射算法
│  ├─ 处理方式
│  └─ 基础画面调整
│     ├─ 亮度
│     ├─ 对比度
│     ├─ 饱和度
│     └─ 伽马
│
├─ H. 视频帧服务器
│  ├─ AviSynth
│  │  ├─ 启用
│  │  └─ AVS 脚本路径
│  └─ VapourSynth
│     ├─ 启用
│     └─ VPY 脚本路径
│
├─ I. 音频参数
│  ├─ 音频编码器
│  ├─ 比特率
│  ├─ 质量参数 1
│  │  ├─ 参数名
│  │  └─ 参数值
│  ├─ 质量参数 2
│  │  ├─ 参数名
│  │  └─ 参数值
│  ├─ 声道布局
│  ├─ 采样格式/位深
│  ├─ 采样率
│  └─ 响度标准化
│     ├─ 目标响度
│     ├─ 动态范围
│     └─ 峰值电平
│
├─ J. 剪辑区间
│  ├─ 剪辑方法
│  ├─ 入点
│  ├─ 出点
│  └─ 向前解码秒数
│
├─ K. 滤镜排序
│  ├─ 视频滤镜顺序
│  ├─ 音频滤镜顺序
│  ├─ 映射参数
│  └─ 输出滤镜参数
│
├─ L. 自定义参数
│  ├─ 视频滤镜
│  ├─ 音频滤镜
│  ├─ 视频参数
│  ├─ 音频参数
│  ├─ 命令开头参数
│  ├─ 输入前参数
│  ├─ 输出前参数
│  ├─ 命令最后参数
│  └─ 完全自写命令
│
├─ M. 流控制
│  ├─ 视频流
│  │  ├─ 参数应用到指定流
│  │  └─ 保留其他视频流
│  ├─ 音频流
│  │  ├─ 参数应用到指定流
│  │  └─ 保留其他音频流
│  └─ 字幕流
│     ├─ 参数应用到指定流
│     ├─ 指定字幕操作
│     ├─ 保留其他字幕流
│     ├─ 自动混流同名 SRT
│     ├─ 自动混流同名 ASS
│     ├─ 自动混流同名 SSA
│     └─ 自动混流字幕转 mov_text
│
└─ N. 附加内容
   ├─ 元数据
   │  ├─ 保留/清除策略
   │  └─ 自定义字段和值
   ├─ 章节
   │  ├─ 来源
   │  └─ 章节文件路径
   └─ 附件
      ├─ 附件类型
      └─ 文件路径
```

---

# 二、视频编码器能力树

## 2.1 类型与分类

```text
视频编码器
├─ 复制流
│  └─ copy
├─ AV2
│  ├─ av2
│  └─ avmenc
├─ H.266 / VVC
│  └─ libvvenc
├─ AV1
│  ├─ libaom-av1
│  ├─ libsvtav1
│  ├─ av1_nvenc
│  ├─ av1_qsv
│  ├─ av1_amf
│  ├─ av1_d3d12va
│  ├─ librav1e
│  └─ av1_vulkan
├─ H.265 / HEVC
│  ├─ libx265
│  ├─ hevc_nvenc
│  ├─ hevc_qsv
│  ├─ hevc_amf
│  ├─ hevc_d3d12va
│  ├─ hevc_vulkan
│  ├─ libkvazaar
│  └─ libsvt_hevc
├─ H.264 / AVC
│  ├─ libx264
│  ├─ libx264rgb
│  ├─ libopenh264
│  ├─ h264_nvenc
│  ├─ h264_qsv
│  ├─ h264_amf
│  ├─ h264_d3d12va
│  └─ h264_vulkan
├─ ProRes
│  ├─ prores_ks
│  └─ prores_aw
├─ VP9 / VP8
│  ├─ libvpx-vp9
│  ├─ libsvt_vp9
│  ├─ vp9_qsv
│  └─ libvpx
├─ FFV1
│  ├─ ffv1 -level 3
│  ├─ ffv1 -level 1
│  └─ ffv1_vulkan
├─ 其他现代编码
│  ├─ libxeve
│  ├─ libxavs
│  ├─ libxavs2
│  ├─ libuavs3e
│  └─ liboapv
├─ 老旧编码
│  ├─ mpeg4
│  ├─ libxvid
│  ├─ rv20
│  ├─ rv10
│  ├─ wmv2
│  └─ wmv1
├─ 禁用
│  └─ -vn
└─ 自定义
```

## 2.2 图片编码器分类

```text
图片编码器
├─ PNG → png
├─ APNG → apng
├─ JPEG/JPG → mjpeg
├─ WebP 静图 → libwebp
├─ WebP 动图 → libwebp_anim
├─ GIF → gif
├─ BMP → bmp
├─ OpenJPEG → libopenjpeg
├─ JPEG-LS → jpegls
├─ SVT JPEG XS → libsvtjpegxs
├─ HDR Radiance → hdr
├─ TIFF → tiff
├─ DPX → dpx
└─ OpenEXR → exr
```

## 2.3 每个具体编码器的统一子树

```text
具体编码器
├─ identity
│  ├─ id
│  ├─ 显示名称
│  ├─ FFmpeg 编码器名
│  ├─ 所属分类
│  └─ 类型（视频/图片）
├─ description
│  ├─ 编码器说明
│  ├─ 可用性说明
│  ├─ 视觉体积均衡点
│  └─ 无损模式说明
├─ capability
│  ├─ 是否复制流
│  ├─ 是否禁用输出
│  ├─ 是否支持二次编码
│  ├─ preset 参数名、选项、默认值
│  ├─ profile 参数名、选项、默认值
│  ├─ tune/usage 参数名、选项、默认值
│  ├─ pix_fmt 选项
│  └─ 图片质量参数
├─ quality
│  ├─ 支持的控制方式
│  ├─ 对应参数名
│  ├─ 值范围
│  ├─ 默认值
│  └─ 参数解释
├─ specialParameters[]
│  ├─ 参数名
│  ├─ 值范围
│  ├─ 默认值
│  └─ 说明
├─ requiredParameters[]
└─ defaultAdditionalParameters[]
```

### 示例：libx264

```text
libx264
├─ -preset
│  └─ ultrafast … medium … veryslow / placebo
├─ -profile:v
│  ├─ baseline
│  ├─ main
│  ├─ high
│  ├─ high10
│  ├─ high422
│  └─ high444
├─ -tune
│  ├─ film
│  ├─ animation
│  ├─ grain
│  ├─ stillimage
│  ├─ psnr
│  ├─ ssim
│  ├─ fastdecode
│  └─ zerolatency
├─ -pix_fmt
│  └─ 由源码数据库给出的兼容格式
├─ 质量控制
│  ├─ -crf 0~51
│  └─ -qp 0~69（按源码说明）
├─ -aq-mode
├─ -aq-strength
└─ -x264-params
```

### 示例：libx265

```text
libx265
├─ -preset
│  └─ ultrafast … medium … veryslow / placebo
├─ -profile:v
│  ├─ main
│  ├─ main10
│  ├─ main12
│  └─ mainstillpicture
├─ -tune
│  ├─ psnr
│  ├─ ssim
│  ├─ grain
│  ├─ fastdecode
│  ├─ zerolatency
│  ├─ animation
│  └─ stillimage
├─ -pix_fmt
├─ 质量控制
│  ├─ -crf 0~51
│  └─ -qp
└─ -x265-params
```

### 示例：libsvtav1

```text
libsvtav1
├─ -preset
│  └─ 0 最慢 ~ 13 最快（源码默认 6）
├─ -profile:v
│  ├─ main
│  ├─ high
│  └─ professional
├─ -pix_fmt
│  ├─ yuv420p
│  └─ yuv420p10le
├─ -crf
│  └─ 0~63（以当前 3FUI 源码定义为准）
├─ -qp
│  └─ 0~63
└─ -svtav1-params
```

> 注意：3FUI 源码适合作为网页参数结构的权威来源，但具体 FFmpeg 构建支持哪些编码器、选项和值范围，仍可能随 FFmpeg 版本和编译配置变化。网页应显示“依赖本机 FFmpeg 构建”，不要承诺一定可用。

---

# 三、音频编码器树

```text
音频编码器
├─ 不指定
├─ 复制流 → copy
├─ 禁用 → -an
├─ AAC
│  ├─ FFmpeg 原生 AAC → aac
│  ├─ NMR AAC → aac + 算法附加参数
│  ├─ FDK AAC → libfdk_aac
│  ├─ FDK AAC HE → libfdk_aac + profile
│  ├─ FDK AAC HE v2 → libfdk_aac + profile
│  └─ AudioToolbox AAC → aac_at
├─ MP3
│  └─ LAME MP3 → libmp3lame
├─ Opus
│  └─ libopus
├─ 无损压缩
│  ├─ FLAC → flac
│  ├─ ALAC → alac
│  ├─ AudioToolbox ALAC → alac_at
│  ├─ TTA → tta
│  └─ WavPack → wavpack
├─ PCM/WAV
│  ├─ pcm_s16le
│  ├─ pcm_s24le
│  ├─ pcm_s32le
│  ├─ pcm_s64le
│  ├─ pcm_alaw_at
│  └─ pcm_mulaw_at
├─ 家庭影院
│  ├─ AC-3 → ac3
│  ├─ E-AC-3 → eac3
│  ├─ DTS → dca
│  └─ TrueHD → truehd
├─ 语音通信
│  ├─ iLBC → ilbc_at
│  ├─ AMR-NB → libopencore_amrnb
│  └─ AMR-WB → libvo_amrwbenc
├─ OGG/Vorbis
│  └─ libvorbis
├─ MP2
│  └─ libtwolame
└─ 旧格式
   └─ RealAudio 1.0 → real_144
```

每个音频编码器节点包含：

```text
音频编码器节点
├─ id / 显示名称 / FFmpeg 编码器名
├─ 描述
├─ 质量参数列表
├─ 特殊参数列表
├─ 默认附加参数列表
├─ VBR 说明
├─ 支持说明
├─ 是否复制流
└─ 是否禁用
```

音频公共参数：

```text
音频公共参数
├─ 比特率 -b:a
│  └─ 96k / 128k / 192k / 256k / 320k / 384k / 448k / 512k / 640k / 1411k / 自定义
├─ 质量参数 1
├─ 质量参数 2
├─ 声道布局
│  ├─ mono
│  ├─ stereo
│  ├─ 2.1
│  ├─ 4.0
│  ├─ 5.0
│  ├─ 5.1
│  ├─ 6.1
│  ├─ 7.1
│  ├─ hexagonal
│  └─ octagonal
├─ 采样格式
│  ├─ s8
│  ├─ s16
│  ├─ s24
│  ├─ s32
│  └─ s64
├─ 采样率
│  ├─ 192000
│  ├─ 96000
│  ├─ 48000
│  ├─ 44100
│  ├─ 32000
│  ├─ 24000
│  ├─ 22050
│  ├─ 16000
│  ├─ 11025
│  └─ 8000
└─ 响度标准化
   ├─ 目标响度
   ├─ 响度范围
   └─ 真峰值
```

---

# 四、字幕树

字幕必须拆成“字幕流处理”和“烧录字幕”两棵子树。两者底层逻辑不同，不能放成一个简单的“字幕编码”下拉框。

## 4.1 字幕流处理（不改变视频画面）

```text
字幕流处理
├─ 字幕来源
│  ├─ 输入文件内嵌字幕流
│  └─ 同名外挂字幕
├─ 指定字幕流
│  └─ 选择器，例如 0:s:0 / 0:s
├─ 对指定字幕流的操作
│  ├─ 不设置
│  ├─ copy
│  ├─ mov_text
│  ├─ srt
│  ├─ ass
│  └─ ssa
├─ 保留其他字幕流
├─ 自动混流同名字幕
│  ├─ SRT
│  ├─ ASS
│  └─ SSA
└─ 容器兼容转换
   ├─ MP4/MOV/3GP 系 → mov_text
   ├─ WebM → webvtt
   └─ MKV 系 → 通常保留或按选择转码
```

容器兼容规则按 3FUI 当前实现：

```text
mov_text 容器
└─ mp4 / m4v / m4a / mov / 3gp / 3g2

webvtt 容器
└─ webm

支持附件的容器
└─ mkv / mka / mks / mk3d
```

## 4.2 烧录字幕（改变视频画面）

```text
烧录字幕
├─ 总开关
├─ 滤镜选择
│  ├─ subtitles
│  └─ ass
├─ 字幕来源
│  ├─ 外部字幕文件
│  └─ 内嵌字幕流
├─ 外部字幕匹配
│  ├─ 格式优先级
│  │  ├─ SRT
│  │  ├─ ASS
│  │  └─ SSA
│  ├─ 文件名附加字符
│  └─ 字幕文件夹
├─ 内嵌字幕
│  └─ 流索引
├─ 字体基础样式
│  ├─ 字体名称
│  ├─ 字号
│  ├─ 粗体
│  ├─ 斜体
│  ├─ 下划线
│  └─ 删除线
├─ 边框样式
│  ├─ 描边+阴影
│  ├─ 背景框
│  ├─ 描边宽度
│  └─ 阴影距离
├─ 颜色
│  ├─ 主要颜色 ARGB
│  ├─ 次要颜色 ARGB
│  ├─ 描边颜色 ARGB
│  └─ 背景颜色 ARGB
├─ 字体文件夹
├─ 对齐位置
│  └─ 1~9 九宫格位置
├─ 边距与间距
│  ├─ 垂直边距
│  ├─ 左边距
│  ├─ 右边距
│  ├─ 字距
│  └─ 行距
├─ 补充 force_style
└─ 完全自定义字幕滤镜
   └─ 覆盖以上设置
```

关键联动：

```text
烧录字幕 = 开启
→ 视频编码器不得为 copy
→ 必须生成视频滤镜
→ 视频必须重新编码

字幕流处理 = copy/转码/混流
→ 不要求重新编码视频
→ 只生成 -map 与 -c:s 等参数
```

---

# 五、适合网页第一版的裁剪树

以下不是删除 3FUI 的能力，而是确定首版界面只暴露最有价值、最容易验证的参数。

```text
FFmpeg 压制命令生成器 V1
├─ 1. 输入与输出
│  ├─ 输入文件占位路径
│  ├─ 输出文件占位路径
│  ├─ 输出容器
│  ├─ 覆盖已有文件 -y
│  └─ 命令环境（PowerShell/CMD/Bash）【网页新增】
│
├─ 2. 流选择
│  ├─ 视频流选择
│  ├─ 音频流选择
│  ├─ 字幕流选择
│  └─ 是否保留其他同类流
│
├─ 3. 视频编码
│  ├─ 视频处理方式
│  │  ├─ 重新编码
│  │  ├─ copy
│  │  └─ -vn
│  ├─ 编码分类
│  ├─ 具体编码器
│  ├─ preset
│  ├─ profile
│  ├─ tune/usage
│  ├─ 像素格式
│  ├─ GPU 索引
│  ├─ 线程数
│  └─ 编码器专用参数（折叠高级区）
│
├─ 4. 视频质量
│  ├─ CRF
│  ├─ VBR
│  ├─ CQP
│  ├─ CBR
│  ├─ 二次编码
│  ├─ 质量值
│  ├─ 基础码率
│  ├─ minrate
│  ├─ maxrate
│  └─ bufsize
│
├─ 5. 画面帧
│  ├─ 分辨率
│  │  ├─ 保持原始
│  │  ├─ 直接指定
│  │  ├─ 只指定宽度，高度 -2
│  │  └─ 只指定高度，宽度 -2
│  ├─ 常用预设
│  │  ├─ 1024×576
│  │  ├─ 1280×720
│  │  ├─ 1600×900
│  │  ├─ 1920×1080
│  │  ├─ 2560×1440
│  │  └─ 3840×2160
│  ├─ 输出帧率
│  │  ├─ 保持原始
│  │  ├─ 15
│  │  ├─ 23.976
│  │  ├─ 24
│  │  ├─ 25
│  │  ├─ 30
│  │  ├─ 50
│  │  ├─ 59.94
│  │  ├─ 60
│  │  ├─ 90
│  │  ├─ 120
│  │  └─ 自定义
│  └─ 第一版暂缓：裁剪、插帧、降噪、锐化、超分、色彩滤镜
│
├─ 6. 音频
│  ├─ 编码器 / copy / -an
│  ├─ 比特率
│  ├─ 编码器质量参数
│  ├─ 声道布局
│  ├─ 采样格式
│  ├─ 采样率
│  └─ 响度标准化（可放高级区）
│
├─ 7. 字幕
│  ├─ 字幕流处理
│  │  ├─ 保留/复制
│  │  ├─ 转 mov_text/srt/ass/ssa
│  │  ├─ 保留其他字幕
│  │  └─ 自动混流同名字幕
│  └─ 烧录字幕
│     ├─ 外挂/内嵌来源
│     ├─ 字幕流或文件
│     ├─ 基本样式
│     ├─ 颜色、描边、位置、边距
│     └─ 自定义 force_style
│
├─ 8. 封装兼容性
│  ├─ 容器与视频编码兼容提示
│  ├─ 容器与音频编码兼容提示
│  └─ 容器与字幕编码自动建议
│
├─ 9. 自定义附加参数
│  ├─ 输入前
│  ├─ 视频参数
│  ├─ 音频参数
│  ├─ 输出前
│  └─ 命令末尾
│
└─ 10. 命令预览与解释
   ├─ 实时命令
   ├─ 参数片段高亮
   ├─ 点击命令定位控件
   ├─ 每个参数的简要解释
   ├─ 当前编码器专属解释
   ├─ 禁用原因
   ├─ 冲突与兼容警告
   └─ 复制命令
```

---

# 六、第一版最重要的依赖规则

```text
R01 视频编码器 = copy
→ hide/disable: 质量控制、preset、profile、tune、pix_fmt、分辨率、帧率、烧录字幕

R02 视频编码器 = -vn
→ hide: 全部视频参数与烧录字幕

R03 音频编码器 = copy
→ hide: 音频码率、质量、采样率、声道、响度标准化

R04 音频编码器 = -an
→ hide: 全部音频参数

R05 质量模式 = CRF
→ show: 编码器支持的 CRF 参数及范围
→ hide: 目标码率控制

R06 质量模式 = VBR
→ 根据编码器映射 -cq / -global_quality / 编码器专用参数

R07 质量模式 = CBR
→ require: -b:v
→ optional: -minrate = -maxrate = -b:v, -bufsize

R08 质量模式 = TPE
→ require: 编码器支持二次编码
→ require: 基础码率
→ 生成 pass 1 / pass 2 两条命令

R09 分辨率或帧率发生改变
→ require: 视频重新编码
→ conflict: 视频 copy

R10 烧录字幕开启
→ require: 视频重新编码
→ conflict: 视频 copy

R11 字幕流处理不等于烧录字幕
→ 仅生成 map/c:s，不生成视频滤镜

R12 输出容器 = mp4/mov/3gp 系
→ 建议字幕编码 mov_text

R13 输出容器 = webm
→ 建议字幕编码 webvtt

R14 输出容器 = mkv 系
→ 可保留多种字幕流与附件

R15 编码器变化
→ 重载 preset/profile/tune/pix_fmt/质量范围/专用参数
→ 清理旧编码器不再有效的值

R16 像素格式变化
→ 校验编码器是否支持
→ 校验 profile/色深关系

R17 完全自定义字幕滤镜不为空
→ 覆盖字幕烧录面板生成的其他滤镜设置
```

---

# 七、推荐的数据节点格式

```ts
interface ParameterNode {
  id: string
  label: string
  group: string
  command?: string
  control: 'select' | 'number' | 'text' | 'switch' | 'multiselect' | 'color'

  options?: Option[]
  range?: {
    min?: number
    max?: number
    step?: number
  }
  defaultValue?: unknown

  visibleWhen?: RuleExpression
  enabledWhen?: RuleExpression
  requires?: RuleExpression[]
  conflicts?: RuleExpression[]

  explanation: {
    short: string
    detail?: string
    effects?: {
      quality?: number
      fileSize?: number
      speed?: number
      compatibility?: number
    }
    warnings?: string[]
  }

  source: {
    repository: 'Lake1059/FFmpegFreeUI'
    file: string
    symbol?: string
    sourceVersion: string
  }
}
```

编码器节点建议单独定义：

```ts
interface EncoderDefinition {
  id: string
  label: string
  ffmpegName: string
  mediaType: 'video' | 'image' | 'audio'
  family: string

  copy?: boolean
  disabled?: boolean
  supportsTwoPass?: boolean

  preset?: ParameterDefinition
  profile?: ParameterDefinition
  tune?: ParameterDefinition
  pixelFormat?: ParameterDefinition
  qualityModes: QualityModeDefinition[]
  specialParameters: ParameterDefinition[]
  requiredParameters: ParameterDefinition[]
  defaultAdditionalParameters: ParameterDefinition[]

  availabilityNote?: string
  balanceNote?: string
  losslessNote?: string
}
```

---

# 八、准确性与版本管理建议

为了避免“AI 补全式参数错误”，每条参数都应保存来源，不允许只有文本说明：

```text
参数来源优先级
1. FFmpegFreeUI 当前源码：用于继承产品结构、参数选项和联动逻辑
2. FFmpeg 官方 encoder help / filters 文档：用于核对实际参数语义
3. 编码器官方文档：用于核对范围和版本差异
4. 人工经验值：只能标记为“经验建议”，不能冒充参数规范
```

网页不调用本机 FFmpeg，因此无法知道用户的 FFmpeg 是否编译了某个编码器。每个外部库或硬件编码器都应显示：

```text
可用性取决于本机 FFmpeg 构建、硬件和驱动。
可运行 ffmpeg -encoders 或 ffmpeg -h encoder=<name> 检查。
```

版本字段至少应记录：

```text
sourceProject: FFmpegFreeUI
sourceBranch: main
sourceSnapshotDate: 2026-07-10
schemaVersion: 1
```

---

## 2026-07-12 工作台与高级参数实施补充

- 页面结构采用九模块侧边导航，不再将所有参数区同时挂载在主页。
- 首批高级参数覆盖质量控制、输出色彩标记、降噪和去色带。
- FFmpegFreeUI 的参数名、取值范围、联动和版本说明可以直接作为 `project-derived` 实现来源，不强制逐项官方复核。
- 新增高级项必须显式设置后才生成命令；v2 配置迁移到 schema v3 后保持原命令行为。
