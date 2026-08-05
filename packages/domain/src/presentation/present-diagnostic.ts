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
  'warn.filter.processing.probeRecommended': {
    'zh-CN': {
      title: '强烈建议先探测输入媒体',
      explanation: '当前没有与输入路径匹配的 ffprobe 像素格式信息。高精度滤镜只能生成通用候选列表，命令会更长，也无法针对真实位深、采样方式、RGB 或 Alpha 精确收敛。',
      guidance: '在 Desktop 的“媒体信息探测”中点击“探测”。探测成功后，工作格式会自动联动到当前参与编码的视频流；无需开启“联动流选择”。',
    },
    en: {
      title: 'Probe the input media first',
      explanation: 'No ffprobe pixel-format data matches the current input path. The high-precision pipeline must use a longer generic fallback list and cannot converge on the source bit depth, chroma, RGB family, or alpha layout.',
      guidance: 'Click Probe in Desktop Media Probe. A successful probe automatically informs filter-format negotiation; enabling Sync streams is not required.',
    },
  },
  'error.filter.processing.precision': {
    'zh-CN': {
      title: '当前滤镜会破坏高精度处理链',
      explanation: '至少一个已启用滤镜在 FFmpeg 8.1.2 中只能协商到 8-bit，链尾重新升位不能恢复已经发生的量化损失。',
      guidance: '改用诊断中列出的高位深替代滤镜，或明确把不兼容策略改为“允许降级并警告”。',
    },
    en: {
      title: 'A filter breaks the high-precision pipeline',
      explanation: 'At least one enabled filter negotiates only 8-bit formats in FFmpeg 8.1.2. Raising the bit depth afterwards cannot recover the quantized values.',
      guidance: 'Use one of the listed high-bit-depth alternatives, or explicitly allow a warned precision downgrade.',
    },
  },
  'warn.filter.processing.precision': {
    'zh-CN': {
      title: '高精度滤镜链将发生已知降级',
      explanation: '当前策略允许执行，但至少一个滤镜会在处理中降到 8-bit。程序会在该滤镜后恢复工作格式，已经丢失的精度无法恢复。',
      guidance: '优先改用诊断中列出的高位深替代滤镜，并用短样片检查 FFmpeg 日志中的实际像素格式。',
    },
    en: {
      title: 'The high-precision pipeline has a known downgrade',
      explanation: 'Execution is allowed, but at least one filter drops to 8-bit internally. The working format is restored afterwards, but lost precision cannot be recovered.',
      guidance: 'Prefer a listed high-bit-depth alternative and verify the actual pixel formats in a short FFmpeg run.',
    },
  },
  'error.filter.processing.hardwareUpload': {
    'zh-CN': {
      title: '高精度 CPU 滤镜链缺少安全的硬件上传边界',
      explanation: 'VAAPI、Vulkan Video 或 D3D12 编码器需要对应 API 的硬件帧。当前解析链以软件帧结束，但配置中没有足够的设备信息来可靠生成 hwupload、hwupload_vaapi 或跨 API 映射。',
      guidance: '改用可直接接收软件帧的编码器，或先配置并验证完整硬件设备链；不要只追加一个没有设备上下文的 hwupload。',
    },
    en: {
      title: 'The high-precision CPU pipeline has no safe hardware-upload boundary',
      explanation: 'VAAPI, Vulkan Video, and D3D12 encoders require API-specific hardware frames. The resolved pipeline ends in software frames and lacks enough device context for a reliable upload or cross-API mapping.',
      guidance: 'Use an encoder that accepts software frames, or configure and verify a complete hardware-device pipeline. Do not append a context-free hwupload.',
    },
  },
  'warn.decode.hwaccel.environment': {
    'zh-CN': {
      title: '硬件解码不保证在当前电脑可用',
      explanation: 'FFmpeg 能识别参数不代表该输入一定能硬解。是否成功同时取决于 FFmpeg 构建、操作系统、GPU、驱动、输入编码、位深和 Profile。失败时 FFmpeg 可能直接退出，也可能回退软件解码。',
      guidance: '先保持输出格式和设备参数为空，用 10–30 秒样片测试并查看日志。失败时清空硬件解码设置；Desktop 后续可按所选 FFmpeg 的 -hwaccels 结果进一步提示。',
    },
    en: {
      title: 'Hardware decoding is not guaranteed on this computer',
      explanation: 'Recognizing the option does not mean the source can be decoded in hardware. Support also depends on the FFmpeg build, OS, GPU, driver, source codec, bit depth, and profile.',
      guidance: 'Leave output format and device unset first, test a 10–30 second sample, and inspect the log. Clear hardware decoding if it fails.',
    },
  },
  'warn.decode.outputFormat.without.hwaccel': {
    'zh-CN': {
      title: '解码输出格式缺少硬件解码方式',
      explanation: '-hwaccel_output_format 用于约束硬件解码器交出的帧格式；未设置 -hwaccel 时通常没有必要，且可能被忽略或导致协商失败。',
      guidance: '先选择对应的硬件加速解码方式，或把解码输出格式恢复为“不设置”。',
    },
    en: {
      title: 'Decoder output format has no hardware decoder',
      explanation: '-hwaccel_output_format constrains frames produced by a hardware decoder and is normally unnecessary without -hwaccel.',
      guidance: 'Choose a matching hardware acceleration method, or leave decoder output format unset.',
    },
  },
  'warn.decode.outputFormat.hardwareFrames': {
    'zh-CN': {
      title: 'D3D11 硬件帧可能与当前处理链不兼容',
      explanation: 'd3d11 会让解码帧留在 GPU 设备内存。当前工作台的缩放、调色、降噪、字幕等多数滤镜以及软件编码器通常需要系统内存帧，没有显式 hwdownload/format 时可能报错。',
      guidance: '只有在确认后续滤镜和硬件编码器支持同一设备帧时使用；否则留空，或选择 nv12/yuv420p/p010 并用短样片验证。',
    },
    en: {
      title: 'D3D11 hardware frames may not match the processing chain',
      explanation: 'd3d11 keeps decoded frames in GPU memory. Most CPU filters and software encoders need system-memory frames and may fail without hwdownload/format.',
      guidance: 'Use it only with a verified compatible filter and hardware encoder chain; otherwise leave it unset or test a software format.',
    },
  },
  'info.decode.outputFormat.hardwareFramesDownloaded': {
    'zh-CN': {
      title: '硬件帧将在 CPU 滤镜前显式下载',
      explanation: '当前高精度处理链会生成 hwdownload，并紧接软件像素格式候选，避免把 D3D11 设备帧直接交给 CPU 滤镜。',
      guidance: '仍需用目标 GPU 和短样片验证硬件解码；如果后续改成纯 GPU 滤镜链，应重新评估是否需要下载和上传。',
    },
    en: {
      title: 'Hardware frames are downloaded before CPU filters',
      explanation: 'The high-precision pipeline emits hwdownload followed by software pixel-format candidates instead of feeding D3D11 frames directly to CPU filters.',
      guidance: 'Verify hardware decoding with the target GPU and a short sample. Re-evaluate the boundary if the pipeline later becomes GPU-only.',
    },
  },
  'info.decode.threads.hwaccel': {
    'zh-CN': {
      title: 'CPU 解码线程数对硬件解码可能无效',
      explanation: '硬件解码的并行调度主要由 GPU、驱动和硬件解码器管理，输入前的 -threads 通常只影响软件解码路径或部分辅助工作。',
      guidance: '除非正在限制软件解码的 CPU 占用，否则建议清空线程数，让 FFmpeg 自动决定。',
    },
    en: {
      title: 'CPU decoder threads may not affect hardware decoding',
      explanation: 'GPU hardware and drivers manage most hardware-decoder scheduling, so input-side -threads often affects only software decoding or auxiliary work.',
      guidance: 'Leave it unset unless you specifically need to constrain software decoding CPU use.',
    },
  },
  'warn.decode.device.incomplete': {
    'zh-CN': {
      title: '硬件设备参数尚未填写完整',
      explanation: '参数名和值必须同时存在才会进入命令。当前设置会被保留，但不会生成半条设备参数。',
      guidance: '填写与所选参数匹配的设备值，或同时清空参数名和值。-init_hw_device 需要完整设备表达式，不一定是数字。',
    },
    en: {
      title: 'Hardware device setting is incomplete',
      explanation: 'Both the option name and value are required. The incomplete setting is retained but is not emitted.',
      guidance: 'Enter a matching device value, or clear both fields. -init_hw_device usually needs a full device expression, not just a number.',
    },
  },
  'warn.decode.device.qsvMismatch': {
    'zh-CN': {
      title: 'QSV 设备参数与解码方式不匹配',
      explanation: '-qsv_device 专用于 Intel QSV，但当前选择了其他硬件解码方式，设备设置可能无效或误导。',
      guidance: '将硬件解码方式改为 qsv，或改用 -hwaccel_device/清空设备参数。',
    },
    en: {
      title: 'QSV device does not match the decoder method',
      explanation: '-qsv_device is specific to Intel QSV, but another hardware acceleration method is selected.',
      guidance: 'Switch the decoder method to qsv, or use -hwaccel_device/clear the device setting.',
    },
  },
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
  'info.compat.customContainer': {
    'zh-CN': {
      title: '自定义容器 — 跳过兼容性校验',
      explanation: '当前使用自定义容器后缀，未受内置目录校验。请自行确认所选编码器与格式（如 AVIF、M4A、WebP）的兼容性。',
      guidance: '验证 FFmpeg 是否支持该编码器 × 容器的组合后再运行。',
    },
    en: {
      title: 'Custom container — compatibility check skipped',
      explanation: 'A custom container extension is in use, which is not validated by the built-in catalog. Please verify compatibility manually.',
      guidance: 'Confirm with FFmpeg that your encoder × container combination is supported before running.',
    },
  },
  'error.container.image.noVideo': {
    'zh-CN': {
      title: '图片容器不支持视频编码',
      explanation: '当前容器为图片格式，无法封装视频轨道。请将视频模式切换为禁用，或选择视频容器。',
      guidance: '将视频模式设为「禁用」，或改为 MP4/MKV 等视频容器。',
    },
    en: {
      title: 'Image container cannot encode video',
      explanation: 'The selected container is an image format and cannot hold a video track. Disable video encoding or switch to a video container.',
      guidance: 'Set video mode to Disabled or choose a video container such as MP4 or MKV.',
    },
  },
  'error.container.image.noAudio': {
    'zh-CN': {
      title: '图片容器不支持音频编码',
      explanation: '当前容器为图片格式，无法封装音频轨道。请将音频模式切换为禁用，或选择视频容器。',
      guidance: '将音频模式设为「禁用」，或改为视频容器。',
    },
    en: {
      title: 'Image container cannot encode audio',
      explanation: 'The selected container is an image format and cannot hold an audio track. Disable audio encoding or switch to a video container.',
      guidance: 'Set audio mode to Disabled or choose a video container.',
    },
  },
  'error.container.audio.noVideo': {
    'zh-CN': {
      title: '音频容器不支持视频编码',
      explanation: '当前容器为纯音频格式，无法封装视频轨道。请将视频模式切换为禁用或流复制。',
      guidance: '将视频模式设为「禁用」或「流复制」，或改为视频容器。',
    },
    en: {
      title: 'Audio container cannot encode video',
      explanation: 'The selected container is audio-only and cannot hold a video track. Disable video encoding or switch to a video container.',
      guidance: 'Set video mode to Disabled or Stream copy, or choose a video container.',
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
