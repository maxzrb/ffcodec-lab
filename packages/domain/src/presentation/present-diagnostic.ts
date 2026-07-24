import type { Diagnostic } from '../rules/rule-types'

type Locale = 'zh-CN' | 'en'

export interface PresentedDiagnostic {
  level: string
  title: string
  explanation: string
  guidance: string
}

type Copy = Omit<PresentedDiagnostic, 'level'>

const COPY: Record<string, { 'zh-CN': Copy; en: Copy }> = {
  'error.color.requires.encode': {
    'zh-CN': {
      title: '色彩转换需要重新编码视频',
      explanation: 'zscale、tonemap 或 libplacebo 会修改像素，无法与视频流复制或禁用视频同时使用。',
      guidance: '切换到视频重新编码，或把色彩操作方式改为“仅写入元数据”。',
    },
    en: {
      title: 'Color conversion requires video encoding',
      explanation: 'zscale, tonemap, and libplacebo modify pixels and cannot run while copying or disabling video.',
      guidance: 'Switch to video encoding, or change the color operation to Metadata only.',
    },
  },
  'error.color.conversion.empty': {
    'zh-CN': {
      title: '色彩转换没有目标设置',
      explanation: '已经选择实际转换，但矩阵、原色、传输特性、范围和预转换像素格式均未设置。',
      guidance: '至少设置一个目标色彩值，或改回“仅写入元数据”。',
    },
    en: {
      title: 'Color conversion has no target',
      explanation: 'Conversion is enabled, but no matrix, primaries, transfer, range, or pre-conversion format is set.',
      guidance: 'Set at least one target value, or switch back to Metadata only.',
    },
  },
  'error.color.tonemap.target': {
    'zh-CN': {
      title: '色调映射缺少目标传输特性',
      explanation: '色调映射必须知道输出采用 SDR、PQ、HLG 或其他传输曲线，否则结果无法可靠解释。',
      guidance: '在传输特性中明确选择目标；HDR 转 SDR 通常选择 bt709。',
    },
    en: {
      title: 'Tone mapping needs a target transfer',
      explanation: 'Tone mapping must know the output transfer curve so the resulting pixels can be interpreted correctly.',
      guidance: 'Choose an explicit target transfer; bt709 is common for HDR-to-SDR output.',
    },
  },
  'error.color.tonemap.filter': {
    'zh-CN': {
      title: '色调映射算法与滤镜不匹配',
      explanation: '当前算法由 libplacebo 提供，CPU zscale/tonemap 路径不支持。',
      guidance: '切换到 libplacebo，或选择 mobius、hable、reinhard 等 CPU 算法。',
    },
    en: {
      title: 'Tone-map algorithm does not match the filter',
      explanation: 'The selected algorithm is provided by libplacebo and is unavailable in the CPU zscale/tonemap path.',
      guidance: 'Use libplacebo, or select a CPU algorithm such as mobius, hable, or reinhard.',
    },
  },
  'info.color.libplacebo.build': {
    'zh-CN': {
      title: 'libplacebo 取决于 FFmpeg 构建与 GPU 环境',
      explanation: '命令语法可以生成，但精简版 FFmpeg、旧驱动或缺少 Vulkan 的环境可能无法加载该滤镜。',
      guidance: '先运行 ffmpeg -filters 确认 libplacebo，并用短样片测试；不确定时使用 zscale。',
    },
    en: {
      title: 'libplacebo depends on the FFmpeg build and GPU runtime',
      explanation: 'The command can be generated, but minimal FFmpeg builds, old drivers, or missing Vulkan support may prevent the filter from loading.',
      guidance: 'Check ffmpeg -filters and test a short sample, or use zscale when uncertain.',
    },
  },
  'error.resolution.requires.encode': {
    'zh-CN': {
      title: '复制视频流时不能修改画面',
      explanation: '分辨率、帧率、裁剪、旋转、调色、去隔行或锐化都需要解码并重新编码视频。',
      guidance: '切换为重新编码，或把全部画面处理恢复为跟随输入。',
    },
    en: {
      title: 'Picture changes require video encoding',
      explanation: 'Resolution, frame rate, crop, rotation, adjustment, deinterlacing, and sharpening cannot be applied while copying the compressed video stream.',
      guidance: 'Switch video handling to Encode, or reset all picture processing to the source values.',
    },
  },
  'error.burn.requires.encode': {
    'zh-CN': {
      title: '字幕烧录需要重新编码视频',
      explanation: '烧录会把字幕像素写入每一帧，无法在视频流 copy 模式下完成。',
      guidance: '切换为重新编码，或关闭字幕烧录并改用可切换的字幕轨道。',
    },
    en: {
      title: 'Subtitle burn-in requires video encoding',
      explanation: 'Burn-in writes subtitle pixels into every frame and therefore cannot work with video stream copy.',
      guidance: 'Switch video handling to Encode, or disable burn-in and use a selectable subtitle track.',
    },
  },
  'warn.subtitle.copy.unknown.sourcecodec': {
    'zh-CN': {
      title: '无法确认字幕复制后的容器兼容性',
      explanation: '至少一条选择 copy 的字幕轨道没有已知源编码；命令可以生成，但目标容器可能拒绝该字幕格式。',
      guidance: '先用 ffprobe 确认字幕编码，或把该轨道改为转码并选择目标容器支持的字幕编码。',
    },
    en: {
      title: 'Subtitle copy compatibility cannot be confirmed',
      explanation: 'At least one copied subtitle track has an unknown source codec. The command can run, but the target container may reject that subtitle format.',
      guidance: 'Inspect the source with ffprobe, or transcode the track to a subtitle codec supported by the target container.',
    },
  },
  'error.webm.video.incompatible': {
    'zh-CN': {
      title: 'WebM 不支持当前视频编码器',
      explanation: '当前选择会生成 WebM 容器无法封装的视频编码，FFmpeg 通常会直接报错。',
      guidance: '改用 AV1 等 WebM 支持的编码器，或切换到 MP4/MKV 等兼容容器。',
    },
    en: {
      title: 'WebM does not support the selected video encoder',
      explanation: 'The selected codec cannot be muxed into WebM and FFmpeg will normally reject the output.',
      guidance: 'Use a WebM-compatible encoder such as AV1, or switch to a compatible container such as MP4 or MKV.',
    },
  },
  'error.webm.audio.incompatible': {
    'zh-CN': {
      title: 'WebM 不支持当前音频编码器',
      explanation: '当前音频编码无法封装进 WebM，命令通常会在输出阶段失败。',
      guidance: 'WebM 建议使用 Opus，或改用支持当前音频编码的容器。',
    },
    en: {
      title: 'WebM does not support the selected audio encoder',
      explanation: 'The selected audio codec cannot be muxed into WebM and the command will normally fail during output.',
      guidance: 'Use Opus for WebM, or choose a container that supports the selected audio codec.',
    },
  },
  'error.compat.unsupported': {
    'zh-CN': {
      title: '编码器与输出容器不兼容',
      explanation: '所选容器不支持封装当前编码器的输出，命令很可能失败。',
      guidance: '切换到诊断建议中的兼容容器，或更换编码器。',
    },
    en: {
      title: 'Encoder and output container are incompatible',
      explanation: 'The selected container cannot mux this encoder output, so the command is likely to fail.',
      guidance: 'Switch to one of the suggested compatible containers, or choose another encoder.',
    },
  },
  'warn.compat.caveat': {
    'zh-CN': {
      title: '当前组合存在兼容性限制',
      explanation: '该容器可以尝试封装当前编码，但部分播放器、编辑器或平台可能无法正确识别。',
      guidance: '如果需要广泛分发，优先采用建议的完全兼容容器；否则请在目标设备上实测。',
    },
    en: {
      title: 'This combination has compatibility limitations',
      explanation: 'The container may accept the codec, but some players, editors, or services may not handle it correctly.',
      guidance: 'For broad distribution, prefer a fully supported container from the suggestions; otherwise test on the target devices.',
    },
  },
  'warn.compat.unknown': {
    'zh-CN': {
      title: '当前组合的兼容性未知',
      explanation: '目录中没有足够信息确认该容器能否可靠封装当前编码。',
      guidance: '优先切换到已确认支持的容器，或先用短样片验证 FFmpeg 与目标播放器。',
    },
    en: {
      title: 'Compatibility is unknown',
      explanation: 'The catalog does not have enough information to confirm reliable muxing for this codec and container.',
      guidance: 'Prefer a confirmed container, or test a short sample with FFmpeg and the target player first.',
    },
  },
  'info.category.placeholder': {
    'zh-CN': {
      title: '当前编解码标准尚无可用编码器',
      explanation: '该标准在 FFmpeg 8.1.2 发行版中没有内置编码器实现，无法执行编码操作。',
      guidance: '请切换到其他有编码器支持的标准（如 H.264、HEVC、AV1），或等待 FFmpeg 上游合并相应编码器。',
    },
    en: {
      title: 'No encoder available for this codec standard',
      explanation: 'This standard has no built-in encoder in FFmpeg 8.1.2, encoding cannot be performed.',
      guidance: 'Switch to a standard with encoder support (e.g. H.264, HEVC, AV1), or wait for FFmpeg upstream to merge a corresponding encoder.',
    },
  },
  'info.compat.transcode': {
    'zh-CN': {
      title: '建议转码以提高兼容性',
      explanation: '当前组合可能工作，但转为目标容器常用的编码更稳妥。',
      guidance: '面向公开分发或长期存档时建议更换编码；仅在已验证的工作流中保留当前组合。',
    },
    en: {
      title: 'Transcoding is recommended for compatibility',
      explanation: 'The combination may work, but a codec commonly used by the target container is safer.',
      guidance: 'Change the codec for public distribution or long-term storage; keep this combination only in a tested workflow.',
    },
  },
  'error.unknown.container': {
    'zh-CN': {
      title: '无法识别输出容器',
      explanation: '配置引用了目录中不存在的容器，无法可靠生成输出参数。',
      guidance: '重新选择输出容器，或恢复默认配置。',
    },
    en: {
      title: 'Unknown output container',
      explanation: 'The configuration references a container that is not present in the catalog, so output arguments cannot be generated reliably.',
      guidance: 'Select an output container again, or restore the default configuration.',
    },
  },
  'error.targetSize.video.requiresEncode': {
    'zh-CN': {
      title: '目标大小需要重新编码视频',
      explanation: '目标大小通过计算并控制视频平均码率实现，不能与视频流复制或禁用视频同时使用。',
      guidance: '把视频处理方式改为“重新编码”，或关闭目标文件大小工具。',
    },
    en: {
      title: 'Target size requires video encoding',
      explanation: 'Target size controls the average video bitrate and cannot work while video is copied or disabled.',
      guidance: 'Switch video handling to Encode, or disable the target file size tool.',
    },
  },
  'error.targetSize.encoder.requiresTwoPass': {
    'zh-CN': {
      title: '当前编码器不支持目标大小模式',
      explanation: '该工具只对项目已验证可执行双遍编码的编码器开放，以避免生成无法命中目标的命令。',
      guidance: '改用 libx264 或 libx265，或关闭目标文件大小工具。',
    },
    en: {
      title: 'The encoder does not support target-size mode',
      explanation: 'This tool is limited to encoders with a verified two-pass workflow.',
      guidance: 'Use libx264 or libx265, or disable the target file size tool.',
    },
  },
  'error.targetSize.video.singleStream': {
    'zh-CN': {
      title: '目标大小只支持一个明确的视频流',
      explanation: '多个视频流会分别消耗码率预算，而网页无法可靠预测每条流的最终大小。',
      guidance: '关闭“保留全部视频流”，并且只选择一个视频流索引。',
    },
    en: {
      title: 'Target size requires one explicit video stream',
      explanation: 'Multiple video streams consume separate bitrate budgets that cannot be predicted reliably.',
      guidance: 'Disable Keep all video streams and select exactly one video stream index.',
    },
  },
  'error.targetSize.target.invalid': {
    'zh-CN': {
      title: '目标文件大小无效',
      explanation: '目标大小必须是大于零的 MiB 数值。',
      guidance: '填写有效的目标文件大小。',
    },
    en: {
      title: 'Invalid target file size',
      explanation: 'The target must be a positive MiB value.',
      guidance: 'Enter a valid target file size.',
    },
  },
  'error.targetSize.duration.invalid': {
    'zh-CN': {
      title: '完整视频时长无效',
      explanation: '码率计算必须知道完整时长，零值或空值无法计算。',
      guidance: '按分钟填写完整输入时长。',
    },
    en: {
      title: 'Invalid full video duration',
      explanation: 'A positive full duration is required to calculate bitrate.',
      guidance: 'Enter the complete input duration in minutes.',
    },
  },
  'error.targetSize.overhead.invalid': {
    'zh-CN': {
      title: '封装预留比例无效',
      explanation: '预留比例必须位于 0%–20%，过高会使可用视频预算失真。',
      guidance: '通常设置为 2%–5%。',
    },
    en: {
      title: 'Invalid muxing reserve',
      explanation: 'The reserve must be between 0% and 20%.',
      guidance: 'A value between 2% and 5% is usually appropriate.',
    },
  },
  'error.targetSize.audio.copyUnknown': {
    'zh-CN': {
      title: '无法自动计算复制音频的大小',
      explanation: '音频流复制保留源码率，而网页不知道源文件中所有音轨的真实码率。',
      guidance: '在实用工具中填写“手动音频总码率”，或改为固定码率音频编码。',
    },
    en: {
      title: 'Copied audio size cannot be calculated automatically',
      explanation: 'Stream copy keeps the source bitrate, which is unknown to the website.',
      guidance: 'Enter the manual total audio bitrate, or encode audio at a known bitrate.',
    },
  },
  'error.targetSize.audio.bitrateUnknown': {
    'zh-CN': {
      title: '当前音频大小无法自动预测',
      explanation: '无损编码或缺少固定音频码率时，音频预算无法从现有配置推导。',
      guidance: '填写所有输出音轨的手动总码率，或改用可设置码率的音频编码。',
    },
    en: {
      title: 'The audio size cannot be predicted automatically',
      explanation: 'Lossless or unspecified-bitrate audio has no predictable budget.',
      guidance: 'Enter the total audio bitrate manually, or use a bitrate-controlled audio encoder.',
    },
  },
  'error.targetSize.audio.streamCountUnknown': {
    'zh-CN': {
      title: '保留全部音轨时音频预算未知',
      explanation: '网页不知道输入中实际有多少条音轨，因此不能把每轨码率换算为总码率。',
      guidance: '明确选择音频流索引，或填写手动音频总码率。',
    },
    en: {
      title: 'Audio budget is unknown while keeping all tracks',
      explanation: 'The website does not know how many input audio streams will be mapped.',
      guidance: 'Select audio indexes explicitly, or enter the total audio bitrate manually.',
    },
  },
  'error.targetSize.custom.conflict': {
    'zh-CN': {
      title: '自定义参数与目标大小冲突',
      explanation: '自定义映射、编解码器、码率或 pass 参数可能覆盖工具生成的受控双遍命令。',
      guidance: '移除诊断标记区域中的冲突参数，或关闭目标文件大小工具。',
    },
    en: {
      title: 'Custom arguments conflict with target size',
      explanation: 'Custom mapping, codec, bitrate, or pass arguments can override the controlled two-pass command.',
      guidance: 'Remove the conflicting arguments, or disable the target file size tool.',
    },
  },
  'error.targetSize.budget.exhausted': {
    'zh-CN': {
      title: '目标大小不足以容纳当前音频预算',
      explanation: '扣除封装预留和音频后，没有剩余的有效视频码率。',
      guidance: '增大目标大小、缩短时长、降低音频码率或减少预留比例。',
    },
    en: {
      title: 'The target is too small for the current audio budget',
      explanation: 'No usable video bitrate remains after reserving muxing overhead and audio.',
      guidance: 'Increase the target, shorten the duration, lower audio bitrate, or reduce the reserve.',
    },
  },
  'warn.targetSize.videoBitrate.low': {
    'zh-CN': {
      title: '计算得到的视频码率过低',
      explanation: '命令仍可执行，但画质很可能无法接受。',
      guidance: '增大目标大小、缩短时长或降低音频预算。',
    },
    en: {
      title: 'The calculated video bitrate is very low',
      explanation: 'The command can run, but visual quality is likely to be unacceptable.',
      guidance: 'Increase the target, shorten the duration, or reduce the audio budget.',
    },
  },
  'error.resolution.dimension.invalid': {
    'zh-CN': {
      title: '输出尺寸尚未填写完整',
      explanation: '指定宽度或高度必须是正整数，输入过程中不会把不完整的数字写入配置。',
      guidance: '完成该数值输入后再运行；若需兼容常见 YUV 格式，可再按建议调整为偶数。',
    },
    en: {
      title: 'Output dimensions are incomplete',
      explanation: 'Explicit width and height must be positive integers. Partial numeric edits are not written to the configuration.',
      guidance: 'Finish the numeric value before running, then use the even-dimension suggestion if compatibility requires it.',
    },
  },
  'warn.targetSize.videoDensity.low': {
    'zh-CN': {
      title: '目标码率不足以支撑当前画面负载',
      explanation: '计算得到的平均视频码率相对于输出分辨率和帧率过低；目标大小仍会接近设定值，但单位像素、单位帧可用的数据量很少。',
      guidance: '增大目标大小，或降低输出分辨率、帧率；bpppf 只能作为跨画面负载的粗略指标，实际画质仍取决于编码器和内容复杂度。',
    },
    en: {
      title: 'Target bitrate is too low for the picture load',
      explanation: 'The average video bitrate is too low for the configured output resolution and frame rate. The file can still approach the target size, but each pixel and frame receives very little data.',
      guidance: 'Increase the target size or reduce output resolution or frame rate. bpppf is only a coarse load indicator; actual quality also depends on the encoder and content complexity.',
    },
  },
  'warn.targetSize.rateControlFloor': {
    'zh-CN': {
      title: '目标码率可能低于编码器可实现下限',
      explanation: '当前每帧、每像素预算极低。帧头、切片和块级标记等最低码流开销可能已经超过请求码率，因此双遍编码也可能无法命中目标大小；帧率越高，需要承担最低开销的帧越多。',
      guidance: '增大目标大小，或降低输出分辨率、帧率。该提示是保守的可实现性判断，最终下限仍受编码器、画面内容和 GOP 结构影响。',
    },
    en: {
      title: 'Target bitrate may be below the encoder rate-control floor',
      explanation: 'The per-frame and per-pixel budget is extremely low. Minimum bitstream costs such as frame, slice, and block signaling can exceed the requested bitrate, so even two-pass encoding may overshoot the target. Higher frame rates repeat that minimum cost more often.',
      guidance: 'Increase the target size or reduce output resolution or frame rate. This is a conservative feasibility warning; the actual floor depends on the encoder, content, and GOP structure.',
    },
  },
  'info.targetSize.pictureLoad.unknown': {
    'zh-CN': {
      title: '画面负载信息不完整',
      explanation: '分辨率或帧率仍跟随输入源，当前目标大小配置没有保存对应的源画面参数。因此只能计算目标平均码率和已知的每帧预算，不能判断编码器是否能在该画面负载下命中目标。',
      guidance: '在“画面与滤镜”中明确输出分辨率和帧率，或在 Desktop 媒体探测后结合源参数人工判断。',
    },
    en: {
      title: 'Picture-load information is incomplete',
      explanation: 'Resolution or frame rate still follows the source, and the target-size configuration does not store those source picture values. It can calculate the target average bitrate and known per-frame budget but cannot determine whether the encoder can hit that target for the actual picture load.',
      guidance: 'Set an explicit output resolution and frame rate, or inspect the source in Desktop and evaluate it with those source values.',
    },
  },
}

export function presentDiagnostic(diagnostic: Diagnostic, locale: Locale): PresentedDiagnostic {
  const level = locale === 'zh-CN'
    ? diagnostic.severity === 'error' ? '错误' : diagnostic.severity === 'warning' ? '警告' : '提示'
    : diagnostic.severity === 'error' ? 'Error' : diagnostic.severity === 'warning' ? 'Warning' : 'Info'
  const resolutionDiagnostic = presentOddResolutionDiagnostic(diagnostic, locale)
  if (resolutionDiagnostic) return { level, ...resolutionDiagnostic }
  const runtimeFilterDiagnostic = presentRuntimeFilterDiagnostic(diagnostic, locale)
  if (runtimeFilterDiagnostic) return { level, ...runtimeFilterDiagnostic }
  const copy = COPY[diagnostic.code]?.[locale]
  if (copy) return { level, ...copy }

  return locale === 'zh-CN'
    ? {
        level,
        title: '配置诊断',
        explanation: diagnostic.message || diagnostic.code,
        guidance: '请检查受影响参数；若问题持续存在，可恢复默认值后重新配置。',
      }
    : {
        level,
        title: 'Configuration diagnostic',
        explanation: diagnostic.message || diagnostic.code,
        guidance: 'Review the affected fields. If the issue persists, reset them to defaults and configure again.',
  }
}

function presentOddResolutionDiagnostic(diagnostic: Diagnostic, locale: Locale): Copy | null {
  if (diagnostic.code !== 'warn.resolution.dimension.odd') return null
  const dimensions = Array.isArray(diagnostic.context.dimensions)
    ? diagnostic.context.dimensions.filter((value): value is { axis: string; value: number; repairedValue: number } =>
      Boolean(value) && typeof value === 'object' &&
      typeof (value as { axis?: unknown }).axis === 'string' &&
      typeof (value as { value?: unknown }).value === 'number' &&
      typeof (value as { repairedValue?: unknown }).repairedValue === 'number',
    )
    : []
  const zhSummary = dimensions.map(({ axis, value, repairedValue }) => `${axis === 'width' ? '宽度' : '高度'} ${value} → ${repairedValue}`).join('，')
  const enSummary = dimensions.map(({ axis, value, repairedValue }) => `${axis} ${value} → ${repairedValue}`).join(', ')
  return locale === 'zh-CN'
    ? {
        title: '显式输出尺寸必须为偶数',
        explanation: `${zhSummary || '当前显式尺寸'}为奇数。自动计算的另一边会使用 -2 保持偶数，但常见 yuv420p 和视频编码器仍可能拒绝用户直接填写的奇数边。`,
        guidance: '可使用“一键调整为偶数尺寸”。Desktop 左键“运行”也会自动应用同一修复；右键强制运行会保留原始命令，不做尺寸修改。',
      }
    : {
        title: 'Explicit output dimensions must be even',
        explanation: `${enSummary || 'An explicit dimension'} is odd. FFmpeg uses -2 for the calculated side, but common yuv420p pipelines and encoders can still reject the user-supplied odd side.`,
        guidance: 'Use the one-click even-dimension fix. Desktop left-click Run applies the same repair automatically; right-click force-run preserves the original command.',
      }
}

function presentRuntimeFilterDiagnostic(diagnostic: Diagnostic, locale: Locale): Copy | null {
  if (diagnostic.code === 'error.filter.capabilities.pending') {
    return locale === 'zh-CN'
      ? {
          title: '正在核验 FFmpeg 滤镜能力',
          explanation: '已启用画面滤镜，Desktop 正在读取当前选中 FFmpeg 的滤镜列表。核验完成前不会按“可运行”处理。',
          guidance: '等待核验完成；若确实需要跳过检查，可右键“运行”并在确认风险后强制执行。',
        }
      : {
          title: 'Checking FFmpeg filter capabilities',
          explanation: 'Picture filters are enabled and Desktop is reading the selected FFmpeg filter list. The command is not treated as runnable until checking finishes.',
          guidance: 'Wait for the check to finish, or right-click Run and confirm the risk to force execution.',
        }
  }
  if (diagnostic.code === 'error.filter.capabilities.unknown') {
    return locale === 'zh-CN'
      ? {
          title: '无法核验 FFmpeg 滤镜能力',
          explanation: '无法读取当前选中 FFmpeg 的滤镜列表，因此无法确认已启用滤镜是否存在。',
          guidance: '检查 FFmpeg 路径和可执行权限，或右键“运行”并在确认风险后强制执行。',
        }
      : {
          title: 'Unable to inspect FFmpeg filter capabilities',
          explanation: 'The selected FFmpeg filter list could not be read, so enabled filters cannot be verified.',
          guidance: 'Check the FFmpeg path and execution permission, or right-click Run and confirm the risk to force execution.',
        }
  }
  if (diagnostic.code !== 'error.filter.capabilities.unavailable') return null

  const filters = Array.isArray(diagnostic.context.filters)
    ? diagnostic.context.filters.filter((value): value is string => typeof value === 'string').join(', ')
    : diagnostic.message
  return locale === 'zh-CN'
    ? {
        title: '当前 FFmpeg 缺少已启用滤镜',
        explanation: `当前配置需要以下滤镜，但选中的 FFmpeg 未注册：${filters}。`,
        guidance: '切换到包含这些滤镜的 FFmpeg，或关闭相应画面处理。右键“运行”可跳过本程序检查，但不保证命令能够执行。',
      }
    : {
        title: 'The selected FFmpeg lacks enabled filters',
        explanation: `The configuration requires filters not registered by the selected FFmpeg: ${filters}.`,
        guidance: 'Switch to an FFmpeg build that provides them, or disable the related picture processing. Right-click Run to bypass this app check, but execution is not guaranteed.',
      }
}
