import { createContext, useContext, type ReactNode } from 'react'
import type { ExplanationDefinition } from '../../domain/catalog/catalog-types'

export type Locale = 'zh-CN' | 'en'

const LocaleContext = createContext<Locale>('zh-CN')

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

export function useI18n() {
  const locale = useContext(LocaleContext)
  return {
    locale,
    text: (value: string) => translateText(value, locale),
  }
}

const ENGLISH_TEXT: Record<string, string> = {
  '输入与流': 'Input & streams',
  '输入与输出': 'Input & output',
  '视频编码': 'Video encoding',
  '视频参数': 'Video',
  '画面参数': 'Picture & filters',
  '画面与滤镜': 'Picture & filters',
  '质量控制': 'Quality control',
  '色彩管理': 'Color management',
  '色彩元数据': 'Color metadata',
  '色彩空间操作方式': 'Color operation',
  '仅写入元数据': 'Metadata only',
  '写入元数据并转换': 'Convert and tag',
  '仅转换': 'Convert only',
  '色彩转换滤镜': 'Color conversion filter',
  'zscale（CPU）': 'zscale (CPU)',
  'libplacebo（GPU）': 'libplacebo (GPU)',
  '转换前像素格式': 'Pre-conversion pixel format',
  '色调映射算法': 'Tone-mapping algorithm',
  '标称峰值亮度 (npl)': 'Nominal peak luminance (npl)',
  '色调映射去饱和强度': 'Tone-map desaturation strength',
  '仅写入输出流色彩标记，不改变像素数值。': 'Writes output color metadata without changing pixel values.',
  '色彩转换进入统一滤镜链；是否写入输出标记由操作方式决定。': 'Color conversion joins the unified filter chain; the operation controls whether output metadata is written.',
  '音频': 'Audio',
  '流与封装': 'Streams & container',
  '流选择': 'Stream selection',
  '音频参数': 'Audio',
  '字幕参数': 'Subtitles',
  '字幕': 'Subtitles',
  '输出参数': 'Output',
  '封装设置': 'Container settings',
  '自定义参数': 'Custom arguments',
  '自定义参数（高级）': 'Custom arguments (advanced)',
  '命令环境': 'Shell',
  '输出容器': 'Output container',
  '覆盖已有文件 (-y)': 'Overwrite existing file (-y)',
  '视频处理方式': 'Video handling',
  '视频编码器': 'Video encoder',
  '音频处理方式': 'Audio handling',
  '音频编码器': 'Audio encoder',
  '重新编码': 'Encode',
  '复制视频流 (copy)': 'Copy video stream (copy)',
  '复制音频流 (copy)': 'Copy audio stream (copy)',
  '不输出视频 (-vn)': 'Disable video (-vn)',
  '不输出音频 (-an)': 'Disable audio (-an)',
  '跟随输入': 'Keep source',
  '自动': 'Auto',
  '无 (自动)': 'None (auto)',
  '软件': 'Software',
  '音频码率 (-b:a)': 'Audio bitrate (-b:a)',
  '填写数值后选择单位；例如 192 + kbps 会生成 192k。': 'Enter a number, then choose a unit; for example, 192 + kbps produces 192k.',
  '声道布局': 'Channel layout',
  '采样率 (Hz)': 'Sample rate (Hz)',
  '视频流索引': 'Video stream indexes',
  '音频流索引': 'Audio stream indexes',
  '字幕流索引': 'Subtitle stream indexes',
  '保留全部视频流': 'Keep all video streams',
  '保留全部音频流': 'Keep all audio streams',
  '保留全部字幕流': 'Keep all subtitle streams',
  '保留全部内置字幕流': 'Keep all embedded subtitle streams',
  '可勾选多个相对视频流索引；至少保留一项。开启“保留全部视频流”时忽略此项。': 'Select one or more relative video stream indexes. At least one must remain; this is ignored when all video streams are kept.',
  '可勾选多个相对音频流索引；至少保留一项。开启“保留全部音频流”时忽略此项。': 'Select one or more relative audio stream indexes. At least one must remain; this is ignored when all audio streams are kept.',
  '可勾选多个相对字幕流索引；至少保留一项。开启"保留全部字幕流"时忽略此项。': 'Select one or more relative subtitle stream indexes. At least one must remain; this is ignored when all subtitle streams are kept.',
  '已选择保留全部字幕流': 'All subtitle streams are already selected',
  '开启后保留输入中的所有视频流；关闭时仅保留上方索引选中的视频流。': 'Keep every video stream from the input. Turn this off to keep only the selected indexes above.',
  '开启后保留输入中的所有音频流；关闭时仅保留上方索引选中的音频流。': 'Keep every audio stream from the input. Turn this off to keep only the selected indexes above.',
  '开启后保留输入中的所有字幕流；关闭时仅按字幕流索引保留一条。': 'Keep every subtitle stream from the input. Turn this off to use the selected subtitle indexes.',
  '输入文件路径': 'Input file path',
  '输出文件路径': 'Output file path',
  '质量控制模式': 'Rate-control mode',
  '目标码率': 'Target bitrate',
  '最大码率': 'Maximum bitrate',
  '缓冲区大小': 'Buffer size',
  '编码预设 (preset)': 'Encoding preset',
  '编码线程数': 'Encoding threads',
  'x264 附加参数 (-x264-params)': 'Additional x264 options (-x264-params)',
  'x265 附加参数 (-x265-params)': 'Additional x265 options (-x265-params)',
  'SVT-AV1 附加参数 (-svtav1-params)': 'Additional SVT-AV1 options (-svtav1-params)',
  'AOM 附加参数 (-aom-params)': 'Additional AOM options (-aom-params)',
  'VVenC 附加参数 (-vvenc-params)': 'Additional VVenC options (-vvenc-params)',
  '速度等级 (-cpu-used)': 'Speed level (-cpu-used)',
  '行级多线程 (-row-mt)': 'Row-based multithreading (-row-mt)',
  '感知优化 (-qpa)': 'Perceptual optimization (-qpa)',
  'VVC 层级 (-tier)': 'VVC tier (-tier)',
  '帧内刷新周期（秒）': 'Intra refresh period (seconds)',
  '不设置（使用编码器默认）': 'Unset (use encoder default)',
  '编码配置 (-profile)': 'Encoding profile (-profile)',
  '配置文件 (profile)': 'Profile',
  '场景优化 (tune)': 'Content tuning (tune)',
  '像素格式 (pix_fmt)': 'Pixel format (pix_fmt)',
  'CRF 值': 'CRF value',
  'QP 值': 'QP value',
  'VBR (动态码率)': 'VBR (variable bitrate)',
  '二次编码 (Two-Pass)': 'Two-pass encoding',
  '全局质量 (-global_quality)': 'Global quality (-global_quality)',
  '最大码率 (-maxrate)': 'Maximum bitrate (-maxrate)',
  '目标码率 (-b:v)': 'Target bitrate (-b:v)',
  '缓冲区 (-bufsize)': 'Rate-control buffer (-bufsize)',
  '压缩级别 (compression_level)': 'Compression level',
  '采样格式 (sample_fmt)': 'Sample format',
  'AAC 编码配置': 'AAC encoding algorithm',
  'FFmpeg 原生 AAC': 'FFmpeg native AAC',
  '关闭 (CBR)': 'Off (CBR)',
  '开启 VBR': 'Enable VBR',
  '添加轨道': 'Add track',
  '删除轨道': 'Remove track',
  '启用': 'Enable',
  '开启': 'On',
  '关闭': 'Off',
  '无损': 'Lossless',
  'H.264 日常均衡': 'H.264 balanced',
  'H.265 高质量': 'H.265 high quality',
  'AV1 节省空间': 'AV1 space saver',
  '视频流复制': 'Stream copy',
  '仅提取音频': 'Audio only',
  'libx264 CRF 23 + AAC 192k，适合日常压制': 'libx264 CRF 23 + AAC 192k for everyday encoding',
  'libx265 CRF 24 + Opus 128k，HEVC 高效率编码': 'libx265 CRF 24 + Opus 128k for efficient HEVC output',
  'libsvtav1 CRF 35 + Opus 96k + MKV，适合高压缩效率输出': 'libsvtav1 CRF 35 + Opus 96k + MKV for efficient output',
  '视频和音频流直接复制，仅更换容器': 'Copy video and audio without re-encoding; change only the container',
  '禁用视频，仅输出 AAC 音频': 'Disable video and output AAC audio only',
  'film — 实拍影片': 'film — live action',
  'animation — 动画': 'animation',
  'grain — 胶片颗粒': 'grain — preserve film grain',
  'stillimage — 静止图像': 'stillimage',
  'psnr — PSNR 优化': 'psnr — optimize PSNR metric',
  'ssim — SSIM 优化': 'ssim — optimize SSIM metric',
  'fastdecode — 快速解码': 'fastdecode',
  '单声道 (mono)': 'Mono',
  '立体声 (stereo)': 'Stereo',
  '2.1 声道': '2.1 channels',
  '3.0 声道': '3.0 channels',
  '4.0 声道 (quad)': '4.0 channels (quad)',
  '5.1 声道': '5.1 channels',
  '5.1 侧环绕': '5.1 side surround',
  '7.1 声道': '7.1 channels',
  '选择“跟随输入”时不生成声道布局参数。': 'Keep source omits the channel-layout option and preserves the input layout.',
  '8000 Hz（电话语音）': '8000 Hz (telephone speech)',
  '16000 Hz（语音）': '16000 Hz (speech)',
  'twoloop — 标准质量': 'twoloop — standard quality',
  'fast — 快速编码': 'fast — faster encoding',
  'anmr — 平均噪声掩蔽比': 'anmr — average noise-to-mask ratio',
  'B 帧 QP': 'B-frame QP',
  'I 帧 QP': 'I-frame QP',
  'P 帧 QP': 'P-frame QP',
  'CQ 值 (-cq)': 'CQ value (-cq)',
  'QP 值 (-qp)': 'QP value (-qp)',
  'GOP 大小 (-g)': 'GOP size (-g)',
  'GPU 设备索引 (-gpu)': 'GPU device index (-gpu)',
  'VBR 开关': 'VBR switch',
  '低功耗模式 (-low_power)': 'Low-power mode (-low_power)',
  '使用场景 (-usage)': 'Usage scenario (-usage)',
  '参考帧数 (-refs)': 'Reference frames (-refs)',
  '受限 VBR': 'Constrained VBR',
  '启用 VBAQ': 'Enable VBAQ',
  '帧时长 (frame_duration)': 'Frame duration',
  '异步深度 (-async_depth)': 'Async depth (-async_depth)',
  '恒定码率（macOS 13+）': 'Constant bitrate (macOS 13+)',
  '时间自适应量化 (-temporal-aq)': 'Temporal adaptive quantization (-temporal-aq)',
  '最大 B 帧数 (-bf)': 'Maximum B-frames (-bf)',
  '码率控制前瞻 (-rc-lookahead)': 'Rate-control lookahead (-rc-lookahead)',
  '质量预设 (-quality)': 'Quality preset (-quality)',
  'VBR Peak（峰值约束可变码率）': 'VBR Peak',
  'ICQ (智能恒定质量 — QSV)': 'ICQ (intelligent constant quality — QSV)',
  'LA-ICQ (前瞻智能恒定质量 — QSV)': 'LA-ICQ (look-ahead intelligent quality — QSV)',
  'Look-ahead VBR (前瞻可变码率 — QSV)': 'Look-ahead VBR (QSV)',
  'CQ (恒定质量 — NVENC)': 'CQ (constant quality — NVENC)',
  'CQP (恒定 QP — QSV)': 'CQP (constant QP — QSV)',
  'CQP (恒定量化参数 — NVENC)': 'CQP (constant quantizer — NVENC)',
  'CBR (恒定码率 — NVENC)': 'CBR (NVENC)',
  'CBR (恒定码率 — QSV)': 'CBR (QSV)',
  'VBR (可变码率 — NVENC)': 'VBR (NVENC)',
  'VBR (可变码率 — QSV)': 'VBR (QSV)',
  'VBR (可变码率 — 推荐)': 'VBR (recommended)',
  '0 — 最快 (无压缩)': '0 — fastest (least compression)',
  '0 — 最慢 (最高质量)': '0 — slowest (highest quality)',
  '12 — 最高压缩 (最慢)': '12 — highest compression (slowest)',
  '13 — 最快 (较低质量)': '13 — fastest (lower quality)',
  '20 ms (默认)': '20 ms (default)',
  '510 kbps (最大)': '510 kbps (maximum)',
  'p4 — 中速 (默认)': 'p4 — balanced (default)',
  'p7 — 最慢 (最高质量)': 'p7 — slowest (highest quality)',
  'faster — 最快': 'faster — fastest',
  'medium — 默认': 'medium — default',
  'slower — 最慢': 'slower — slowest',
  'yuv420p10le (必需)': 'yuv420p10le (required)',
  'ull — 超低延迟': 'ull — ultra-low latency',
  'veryfast — 最快速度': 'veryfast — fastest',
  'hq — 高质量': 'hq — high quality',
  'voip — 语音': 'voip — speech',
  '优先节能': 'Prefer power efficiency',
  '低延迟': 'Low latency',
  '像素格式': 'Pixel format',
  '允许软件编码回退': 'Allow software fallback',
  '启用预编码分析': 'Enable pre-encode analysis',
  '实时编码提示': 'Real-time encoding hint',
  '峰值码率': 'Peak bitrate',
  '平均码率': 'Average bitrate',
  '异步深度': 'Async depth',
  '空间自适应量化 (-spatial-aq)': 'Spatial adaptive quantization (-spatial-aq)',
  '缓冲区': 'Buffer size',
  '编码应用类型': 'Encoding application',
  '超低延迟': 'Ultra-low latency',
  '通用转码': 'General transcoding',
  '高质量': 'High quality',
  '启用裁剪': 'Enable crop',
  '旋转': 'Rotation',
  '水平镜像': 'Flip horizontally',
  '垂直镜像': 'Flip vertically',
  '启用画面调整': 'Enable picture adjustments',
  '启用去隔行': 'Enable deinterlacing',
  '启用锐化': 'Enable sharpening',
  '启用降噪': 'Enable denoising',
  '启用去色带': 'Enable debanding',
  '降噪滤镜': 'Denoise filter',
  '去色带滤镜': 'Deband filter',
  '请选择滤镜': 'Select a filter',
  '关键帧间隔 (-g)': 'Keyframe interval (-g)',
  '最小关键帧间隔 (-keyint_min)': 'Minimum keyframe interval (-keyint_min)',
  '量化最小值 (-qmin)': 'Minimum quantizer (-qmin)',
  '量化最大值 (-qmax)': 'Maximum quantizer (-qmax)',
  '量化曲线压缩 (-qcomp)': 'Quantizer curve compression (-qcomp)',
  '前向参考帧数 (-rc-lookahead)': 'Lookahead frames (-rc-lookahead)',
  '自适应量化强度 (-aq-strength)': 'Adaptive quantization strength (-aq-strength)',
  '空间 AQ 强度 (-aq-strength)': 'Spatial AQ strength (-aq-strength)',
  '场景切换阈值 (-sc_threshold)': 'Scene-change threshold (-sc_threshold)',
  '编码级别 (-level)': 'Encoding level (-level)',
  '前瞻等级 (-lookahead_level)': 'Lookahead level (-lookahead_level)',
  '扩展码率控制 (-extbrc)': 'Extended bitrate control (-extbrc)',
  'QVBR 质量级别 (-qvbr_quality_level)': 'QVBR quality level (-qvbr_quality_level)',
  '色彩范围': 'Color range',
  '矩阵 / 色彩空间': 'Matrix / color space',
  '色域 / 原色': 'Color primaries',
  '传输特性': 'Transfer characteristics',
  '不设置（保留输入或编码器默认）': 'Unset (keep source or encoder default)',
  'tv 有限范围': 'TV limited range',
  'pc 全范围': 'PC full range',
  '仅写入输出流色彩标记，不改变像素数值；未设置项不会进入命令。': 'Writes output color metadata without changing pixel values; unset fields are omitted.',
  '亮度空间强度': 'Luma spatial strength',
  '色度空间强度': 'Chroma spatial strength',
  '亮度时间强度': 'Luma temporal strength',
  '色度时间强度': 'Chroma temporal strength',
  '降噪强度': 'Denoise strength',
  '参考像素块大小': 'Patch size',
  '色度像素块大小': 'Chroma patch size',
  '搜索半径': 'Search radius',
  '亮度静态帧加权': 'Luma static-frame weight',
  '亮度动态帧加权': 'Luma dynamic-frame weight',
  '色度静态帧加权': 'Chroma static-frame weight',
  '色度动态帧加权': 'Chroma dynamic-frame weight',
  '噪声强度 sigma': 'Noise strength sigma',
  '块大小': 'Block size',
  '块步长': 'Block step',
  '相似块数量': 'Similar block count',
  '阈值': 'Threshold',
  '采样范围': 'Sampling range',
  '方向': 'Direction',
  '平面耦合': 'Plane coupling',
  '平滑强度': 'Smoothing strength',
  '渐变拟合半径': 'Gradient fitting radius',
  '全局参数': 'Global arguments',
  '输入前参数': 'Pre-input arguments',
  '输出前参数': 'Pre-output arguments',
  '命令末尾参数': 'Trailing arguments',
  '每行输入一个完整 token；系统仅负责 Shell 转义，不校验 FFmpeg 语义。': 'Enter one complete token per line. Shell escaping is applied, but FFmpeg semantics are not validated.',
  '字幕轨道 (混流)': 'Subtitle tracks (muxing)',
  '文件路径': 'File path',
  '语言 (ISO 639-2)': 'Language (ISO 639-2)',
  '标题': 'Title',
  '默认轨道': 'Default track',
  '强制字幕': 'Forced subtitle',
  '听障辅助字幕': 'Hearing-impaired subtitle',
  '字幕烧录': 'Subtitle burn-in',
  '启用字幕烧录': 'Enable subtitle burn-in',
  '字幕文件路径': 'Subtitle file path',
  '粗体': 'Bold',
  '斜体': 'Italic',
  '下划线': 'Underline',
  '删除线': 'Strikeout',
  '主要颜色（ASS ARGB）': 'Primary color (ASS ARGB)',
  '次要颜色（ASS ARGB）': 'Secondary color (ASS ARGB)',
  '描边颜色（ASS ARGB）': 'Outline color (ASS ARGB)',
  '背景颜色（ASS ARGB）': 'Background color (ASS ARGB)',
  '描边宽度': 'Outline width',
  '阴影距离': 'Shadow distance',
  '左边距': 'Left margin',
  '右边距': 'Right margin',
  '垂直边距': 'Vertical margin',
  '字距': 'Letter spacing',
  '补充 force_style': 'Additional force_style',
  '完全自定义字幕滤镜（覆盖以上设置）': 'Fully custom subtitle filter (overrides the settings above)',
  '保持原分辨率': 'Keep source resolution',
  '保持原帧率': 'Keep source frame rate',
  '保留的视频流索引': 'Selected video stream indexes',
  '保留的音频流索引': 'Selected audio stream indexes',
  '保留的字幕流索引': 'Selected subtitle stream indexes',
  '边框样式': 'Border style',
  '编码方式': 'Codec handling',
  '不透明背景框': 'Opaque background box',
  '不旋转': 'No rotation',
  '底场优先': 'Bottom field first',
  '顶场优先': 'Top field first',
  '分辨率': 'Resolution',
  '复制原始流': 'Copy source stream',
  '高度 (像素)': 'Height (pixels)',
  '宽度 (像素)': 'Width (pixels)',
  '居中': 'Center',
  '来源': 'Source',
  '流索引 (0=s:0)': 'Stream index (0=s:0)',
  '每场输出一帧（双帧率）': 'One frame per field (double frame rate)',
  '每帧输出一帧': 'One frame per input frame',
  '描边与阴影': 'Outline and shadow',
  '目标编码': 'Target codec',
  '逆时针 90°': '90° counter-clockwise',
  '顺时针 90°': '90° clockwise',
  '旋转 180°': 'Rotate 180°',
  '烧录滤镜': 'Burn-in filter',
  '输入文件内字幕流': 'Subtitle stream in main input',
  '输入文件中': 'Main input',
  '外挂文件内字幕流索引': 'Subtitle stream index in external file',
  '外挂字幕文件': 'External subtitle file',
  '外挂文件': 'External file',
  '右上': 'Top right',
  '右下': 'Bottom right',
  '右中': 'Middle right',
  '左上': 'Top left',
  '左下': 'Bottom left',
  '左中': 'Middle left',
  '中上': 'Top center',
  '中下': 'Bottom center',
  '帧率 (fps)': 'Frame rate (fps)',
  '帧率': 'Frame rate',
  '指定高度': 'Set height',
  '指定宽度': 'Set width',
  '指定宽高': 'Set width and height',
  '指定帧率': 'Set frame rate',
  '转码': 'Transcode',
  '字号': 'Font size',
  '字幕来源': 'Subtitle source',
  '字幕位置': 'Subtitle position',
  '字体名称': 'Font name',
  '自动检测': 'Auto detect',
  'ass（ASS 字幕）': 'ass (ASS subtitles)',
  'subtitles（通用字幕）': 'subtitles (general subtitles)',
}

/** 翻译目录标签；未知的技术名词保持原样，不猜测含义。 */
export function translateText(value: string, locale: Locale): string {
  if (locale === 'zh-CN') return value
  const exact = ENGLISH_TEXT[value]
  if (exact) return exact

  const subtitleCount = value.match(/^字幕轨道 \((\d+) 条\)$/)
  if (subtitleCount) return `Subtitle tracks (${subtitleCount[1]})`
  const subtitleTrack = value.match(/^字幕: (.+)$/)
  if (subtitleTrack) return `Subtitle: ${subtitleTrack[1]}`

  return value
    .replace(/（恒定码率）|\(恒定码率\)/g, '(CBR)')
    .replace(/（可变码率）|\(可变码率\)/g, '(VBR)')
    .replace(/（恒定质量）|\(恒定质量\)/g, '(constant quality)')
    .replace(/（恒定量化）|\(恒定量化\)/g, '(constant quantizer)')
    .replace(/（固定量化参数）/g, '(constant quantizer)')
    .replace(/ — 推荐/g, ' — recommended')
    .replace(/ — 默认/g, ' — default')
    .replace(/ — 最快/g, ' — fastest')
    .replace(/ — 最慢/g, ' — slowest')
    .replace(/ — 最高质量/g, ' — highest quality')
    .replace(/ — 质量优先/g, ' — quality')
    .replace(/ — 速度优先/g, ' — speed')
    .replace(/ — 平衡/g, ' — balanced')
    .replace(/ — 音乐/g, ' — music')
    .replace(/ — 低延迟/g, ' — low latency')
    .replace(/ — 零延迟/g, ' — zero latency')
    .replace(/ — 无损/g, ' — lossless')
}

const ENGLISH_EXPLANATIONS: Record<string, { title?: string; short: string; detail?: string }> = {
  'expl.param.shell': {
    title: 'Shell',
    short: 'Select the terminal that will run the command so quoting, escaping, and line continuation are generated correctly.',
    detail: 'Choose PowerShell or CMD on Windows when pasting directly into that shell; use Bash for Linux, macOS, WSL, or other POSIX shells.',
  },
  'expl.param.container': {
    title: 'Output container',
    short: 'The container packages video, audio, subtitles, and metadata into the output file. It does not determine visual quality by itself.',
    detail: 'Choose MP4 for broad playback support, MKV for flexible codec and subtitle support, WebM for web-oriented AV1/Opus workflows, and MOV for Apple or editing workflows.',
  },
  'expl.param.overwrite': {
    title: 'Overwrite existing output',
    short: 'Adds -y so FFmpeg replaces an existing output file without asking for confirmation.',
    detail: 'Leave this off when accidental replacement would be costly. Turn it on for repeatable scripts and batch jobs that intentionally regenerate the same path.',
  },
  'expl.param.video.mode': {
    title: 'Video handling',
    short: 'Encode changes the codec and permits filters; copy keeps the original compressed stream without quality loss; disable removes video from the output.',
  },
  'expl.param.video.encoder': {
    title: 'Video encoder',
    short: 'The encoder determines the output codec, compression efficiency, processing speed, hardware requirements, and playback compatibility.',
    detail: 'Use libx264 for broad compatibility, libx265 or AV1 for smaller files when playback support allows it, and a hardware encoder when speed matters more than maximum compression efficiency.',
  },
  'expl.param.audio.mode': {
    title: 'Audio handling',
    short: 'Encode changes format or bitrate; copy preserves the original compressed audio without generation loss; disable removes audio from the output.',
  },
  'expl.param.audio.encoder': {
    title: 'Audio encoder',
    short: 'The audio encoder determines codec compatibility, quality at a given bitrate, and whether the result is lossy or lossless.',
    detail: 'AAC is the safest general-purpose choice, Opus is efficient at low bitrates, and FLAC preserves the audio exactly at a larger file size.',
  },
  'expl.aac.bitrate': {
    title: 'AAC bitrate',
    short: 'Controls the data budget for AAC audio. Higher values usually preserve more detail but increase file size.',
    detail: 'For stereo material, 128–192 kbps is a practical starting range. Speech can often use less; demanding music or multichannel audio may need more.',
  },
  'expl.libopus.bitrate': {
    title: 'Opus bitrate',
    short: 'Controls the data budget for Opus audio. Higher values usually preserve more detail but increase file size.',
    detail: 'Around 64 kbps is a common speech starting point, while 96–160 kbps is a practical range for stereo music depending on the source and target quality.',
  },
}

const ENGLISH_EXPLANATION_WARNINGS: Record<string, string[]> = {
  'expl.h264_qsv': [
    'QSV availability depends on Intel graphics hardware and drivers; FFCodec does not inspect this computer.',
    'ICQ and LA-ICQ require Haswell or newer hardware; low-power mode requires Broadwell or newer.',
  ],
  'expl.hevc_qsv': [
    'HEVC QSV requires a Broadwell (5th generation) or newer Intel GPU.',
    'FFCodec does not inspect local Intel graphics hardware or drivers.',
  ],
}

export function localizeExplanation(explanation: ExplanationDefinition, locale: Locale) {
  if (locale === 'zh-CN') return explanation
  const override = ENGLISH_EXPLANATIONS[explanation.id]
  if (override) return { ...explanation, ...override, warnings: ENGLISH_EXPLANATION_WARNINGS[explanation.id] ?? [] }

  const technicalTitle = translateExplanationTitle(explanation.title)
  const id = explanation.id.toLowerCase()
  let short = `Configures ${technicalTitle} for the selected encoder or output workflow.`
  if (id.includes('preset')) short = 'Balances encoding speed against compression efficiency. Slower presets usually reduce file size at the same quality but take longer.'
  else if (id.includes('profile')) short = 'Limits the codec features and bit depth used by the output. Choose a profile supported by the target player or device.'
  else if (id.includes('pixfmt')) short = 'Sets chroma sampling and bit depth. Higher bit depth can reduce banding, while common 4:2:0 formats provide broader compatibility.'
  else if (id.includes('bitrate')) short = 'Sets the target data rate. Higher values usually improve quality and increase file size or bandwidth use.'
  else if (id.includes('maxrate')) short = 'Caps short-term bitrate peaks. Use it with the rate-control buffer when a player, network, or service has a bandwidth limit.'
  else if (id.includes('bufsize')) short = 'Controls how much bitrate may vary around the target. A larger buffer permits wider short-term variation.'
  else if (id.includes('crf')) short = 'Targets consistent visual quality while allowing bitrate to follow scene complexity. Lower values produce higher quality and larger files.'
  else if (id.includes('cqp') || id.includes('.qp')) short = 'Uses a fixed quantizer instead of targeting a bitrate. Lower values preserve more detail and create larger files.'
  else if (id.includes('vbr')) short = 'Allows bitrate to vary with content complexity, improving efficiency when exact moment-to-moment bandwidth is not required.'
  else if (id.includes('cbr')) short = 'Keeps bitrate close to a fixed target for predictable bandwidth, usually with less allocation flexibility than VBR.'
  else if (id.includes('threads')) short = 'Controls encoder parallelism. Automatic selection is usually best unless CPU usage must be constrained.'
  else if (id.includes('params')) short = 'Passes encoder-specific options directly. Use only when you understand the target encoder syntax and possible conflicts.'

  return {
    ...explanation,
    title: technicalTitle,
    short,
    detail: undefined,
    warnings: ENGLISH_EXPLANATION_WARNINGS[explanation.id] ?? [],
  }
}

function translateExplanationTitle(title: string): string {
  const exact: Record<string, string> = {
    '二次编码': 'Two-pass encoding',
    '音频码率': 'Audio bitrate',
    '应用类型': 'Application type',
    '帧时长': 'Frame duration',
    '视频滤镜链': 'Video filter chain',
    'CQ 值': 'CQ value',
    'CRF 值': 'CRF value',
    'QP 值': 'QP value',
    '缓冲区大小': 'Buffer size',
    '编码线程数': 'Encoding threads',
    'FFmpeg 原生 AAC': 'FFmpeg native AAC',
    'VBR 开关': 'VBR switch',
    'libaom-av1 软件编码器': 'libaom-av1 software encoder',
    'AV1 Profile': 'AV1 profile',
    'libaom 像素格式': 'libaom pixel format',
    'libaom 恒定质量': 'libaom constant quality',
    'libaom CRF': 'libaom CRF',
    'libaom VBR': 'libaom VBR',
    'libaom 目标码率': 'libaom target bitrate',
    'libaom 速度等级': 'libaom speed level',
    'libaom 行级多线程': 'libaom row-based multithreading',
    'AOM 附加参数': 'Additional AOM options',
    'libvvenc H.266/VVC 编码器': 'libvvenc H.266/VVC encoder',
    'VVenC 编码预设': 'VVenC encoding preset',
    'VVenC 输入像素格式': 'VVenC input pixel format',
    'VVenC 恒定量化': 'VVenC constant quantizer',
    'VVenC QP': 'VVenC QP',
    'VVenC 码率模式': 'VVenC bitrate mode',
    'VVenC 目标码率': 'VVenC target bitrate',
    'VVenC 感知优化': 'VVenC perceptual optimization',
    'VVC Tier': 'VVC tier',
    '帧内刷新周期': 'Intra refresh period',
    'VVenC 附加参数': 'Additional VVenC options',
    '码率控制前瞻 (-rc-lookahead)': 'Rate-control lookahead (-rc-lookahead)',
    '最大 B 帧数 (-bf)': 'Maximum B-frames (-bf)',
    'ICQ (智能恒定质量)': 'ICQ (intelligent constant quality)',
    'LA-ICQ (前瞻智能恒定质量)': 'LA-ICQ (look-ahead intelligent quality)',
    '实时编码提示': 'Real-time encoding hint',
    '全局质量': 'Global quality',
    '前瞻深度': 'Look-ahead depth',
    '低功耗模式': 'Low-power mode',
    'B 帧数': 'B-frames',
    'GOP 大小': 'GOP size',
    '参考帧数': 'Reference frames',
    '空间自适应量化 (-spatial_aq)': 'Spatial adaptive quantization (-spatial_aq)',
    '时间自适应量化 (-temporal_aq)': 'Temporal adaptive quantization (-temporal_aq)',
    '预编码分析': 'Pre-encode analysis',
    '允许软件回退': 'Allow software fallback',
    '节能优先': 'Prefer power efficiency',
    '关键帧间隔': 'Keyframe interval',
    '最大 B 帧数': 'Maximum B-frames',
    '最小关键帧间隔': 'Minimum keyframe interval',
    '最低量化值': 'Minimum quantizer',
    '最高量化值': 'Maximum quantizer',
    '量化曲线压缩': 'Quantizer curve compression',
    '码率控制前瞻': 'Rate-control lookahead',
    '自适应量化强度': 'Adaptive quantization strength',
    '场景切换阈值': 'Scene-change threshold',
    '编码级别': 'Encoding level',
    'NVENC 前瞻等级': 'NVENC lookahead level',
    'Intel 扩展码率控制': 'Intel extended bitrate control',
    'AMD QVBR 质量级别': 'AMD QVBR quality level',
  }
  if (exact[title]) return exact[title]

  return title
    .replace('硬件编码器', 'hardware encoder')
    .replace('编码器', 'encoder')
    .replace('恒定量化参数', 'constant quantizer')
    .replace('恒定量化', 'constant quantizer')
    .replace('恒定 QP', 'constant QP')
    .replace('恒定质量', 'constant quality')
    .replace('动态码率', 'variable bitrate')
    .replace('可变码率', 'variable bitrate')
    .replace('恒定码率', 'constant bitrate')
    .replace('附加参数', 'advanced options')
    .replace('编码算法', 'encoding algorithm')
    .replace('编码预设', 'preset')
    .replace('质量预设', 'quality preset')
    .replace('编码配置', 'profile')
    .replace('使用场景', 'usage')
    .replace('场景优化', 'tuning')
    .replace('像素格式', 'pixel format')
    .replace('目标码率', 'target bitrate')
    .replace('平均码率', 'average bitrate')
    .replace('最大码率', 'maximum bitrate')
    .replace('码率约束', 'bitrate constraints')
    .replace('缓冲大小', 'buffer size')
    .replace('压缩级别', 'compression level')
    .replace('采样格式', 'sample format')
    .replace('帧类型', 'frame-type')
    .replace('异步深度', 'async depth')
    .replace('GPU 选择', 'GPU selection')
    .replace('前瞻智能恒定质量', 'look-ahead intelligent quality')
    .replace('智能恒定质量', 'intelligent constant quality')
    .replace('低功耗模式', 'low-power mode')
    .replace('B 帧数', 'B-frames')
    .replace('GOP 大小', 'GOP size')
    .replace('参考帧数', 'reference frames')
}
