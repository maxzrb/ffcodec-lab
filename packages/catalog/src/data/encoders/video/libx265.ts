import type { EncoderDefinition, ArgumentPhase } from '@ffcodec/domain/catalog/catalog-types'
import { CONFIG_PATHS, videoSpecialParamPath } from '@ffcodec/domain/config/config-path'

const libx265Source = {
  repository: 'FFmpeg/FFmpeg',
  branch: 'master',
  snapshotDate: '2026-07-20',
  file: 'libavcodec/libx265.c',
  sourceType: 'ffmpeg-official' as const,
  url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c',
}

/** 便捷：生成通过 -x265-params dict 传入的单个 key 控件 */
function x265key(id: string, label: string, control: 'select' | 'number' | 'switch' | 'text', key: string, opts?: { options?: Array<{ value: string; label: string }>; range?: { min?: number; max?: number; step?: number }; phase?: ArgumentPhase }) {
  return {
    id: `libx265.${id}`,
    label,
    control,
    optional: true,
    configBinding: { path: videoSpecialParamPath(id) },
    commandBinding: {
      argName: '-x265-params', prefix: '-x265-params',
      phase: opts?.phase ?? 'VIDEO_CODEC',
      dictionary: { key, separator: ':' as const },
    },
    ...(opts?.options ? { options: opts.options } : {}),
    ...(opts?.range ? { range: opts.range } : {}),
    explanationId: `expl.libx265.${id}`,
    sourceRefs: [libx265Source],
  }
}

export const libx265: EncoderDefinition = {
  id: 'libx265',
  label: 'libx265 (H.265/HEVC)',
  ffmpegName: 'libx265',
  mediaType: 'video',
  family: 'hevc' as const,
  implementation: 'software' as const,
  availabilityClass: 'ffmpeg-build-dependent',
  capabilityScope: {
    buildRequirements: ['--enable-libx265'],
    library: { name: 'x265', minVersion: '3.0' },
    notes: ['libx265 是 HEVC/H.265 软件编码器，需要 FFmpeg 编译时启用'],
  },
  availabilityNote:
    'libx265 是 HEVC/H.265 软件编码器。可用性取决于本机 FFmpeg 构建。可运行 ffmpeg -encoders | grep x265 检查。',

  capabilities: {
    copy: false,
    disabled: false,
    supportsTwoPass: true,
    supportsLossless: true,
    supportedContainers: ['mp4', 'mkv', 'mov', 'mxf', 'ts'],
  },

  preset: {
    id: 'libx265.preset',
    label: '编码预设 (preset)',
    control: 'select',
    commandBinding: { argName: '-preset', prefix: '-preset', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'ultrafast', label: 'ultrafast' },
      { value: 'superfast', label: 'superfast' },
      { value: 'veryfast', label: 'veryfast' },
      { value: 'faster', label: 'faster' },
      { value: 'fast', label: 'fast' },
      { value: 'medium', label: 'medium', description: '默认值' },
      { value: 'slow', label: 'slow' },
      { value: 'slower', label: 'slower' },
      { value: 'veryslow', label: 'veryslow' },
      { value: 'placebo', label: 'placebo', description: '极慢，不推荐' },
    ],
    defaultValue: 'medium',
    explanationId: 'expl.libx265.preset',
  },

  profile: {
    id: 'libx265.profile',
    label: '配置文件 (profile)',
    control: 'select',
    commandBinding: { argName: '-profile:v', prefix: '-profile:v', phase: 'VIDEO_PROFILE' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'main', label: 'main' },
      { value: 'main10', label: 'main10' },
      { value: 'main12', label: 'main12' },
      { value: 'mainstillpicture', label: 'mainstillpicture' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.libx265.profile',
  },

  tune: {
    id: 'libx265.tune',
    label: '场景优化 (tune)',
    control: 'select',
    commandBinding: { argName: '-tune', prefix: '-tune', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'auto', label: '无 (自动)' },
      { value: 'psnr', label: 'psnr' },
      { value: 'ssim', label: 'ssim' },
      { value: 'grain', label: 'grain' },
      { value: 'fastdecode', label: 'fastdecode' },
      { value: 'zerolatency', label: 'zerolatency' },
      { value: 'animation', label: 'animation' },
      { value: 'stillimage', label: 'stillimage' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.libx265.tune',
  },

  pixelFormat: {
    id: 'libx265.pixelFormat',
    label: '像素格式 (pix_fmt)',
    control: 'select',
    commandBinding: { argName: '-pix_fmt', prefix: '-pix_fmt', phase: 'VIDEO_CODEC' },
    options: [
      { value: 'auto', label: '自动' },
      { value: 'yuv420p', label: 'yuv420p' },
      { value: 'yuv422p', label: 'yuv422p' },
      { value: 'yuv444p', label: 'yuv444p' },
      { value: 'yuv420p10le', label: 'yuv420p10le' },
      { value: 'yuv422p10le', label: 'yuv422p10le' },
      { value: 'yuv444p10le', label: 'yuv444p10le' },
      { value: 'yuv420p12le', label: 'yuv420p12le' },
      { value: 'yuv422p12le', label: 'yuv422p12le' },
      { value: 'yuv444p12le', label: 'yuv444p12le' },
    ],
    defaultValue: 'auto',
    explanationId: 'expl.libx265.pixfmt',
  },

  qualityModes: [
    {
      id: 'crf',
      label: 'CRF (恒定质量)',
      emitterId: 'emitter.crf',
      explanationId: 'expl.libx265.crf',
      sourceRefs: [
        {
          repository: 'Lake1059/FFmpegFreeUI',
          branch: 'main',
          snapshotDate: '2026-07-10',
          file: 'src/databases/video-encoders.json',
          symbol: 'libx265.quality.crf',
          sourceType: 'ffmpegfreeui',
        },
      ],
      recommendedValues: [
        { label: '高质量', value: 24, description: '接近透明质量' },
        { label: '默认', value: 28, description: '画质与体积的良好平衡' },
        { label: '一般质量', value: 32, description: '文件较小' },
      ],
      controls: [
        {
          id: 'libx265.crf.value',
          label: 'CRF 值',
          control: 'number',
          commandBinding: { argName: '-crf', prefix: '-crf', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 0, max: 51, step: 0.1 },
          defaultValue: 28,
          explanationId: 'expl.libx265.crf.value',
        },
      ],
    },
    {
      id: 'vbr',
      label: 'VBR (动态码率)',
      emitterId: 'emitter.vbr',
      explanationId: 'expl.libx265.vbr',
      sourceRefs: [
        {
          repository: 'Lake1059/FFmpegFreeUI',
          branch: 'main',
          snapshotDate: '2026-07-10',
          file: 'src/databases/video-encoders.json',
          symbol: 'libx265.quality.vbr',
          sourceType: 'ffmpegfreeui',
        },
      ],
      controls: [
        {
          id: 'libx265.vbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.libx265.vbr.bitrate',
        },
        {
          id: 'libx265.vbr.maxrate',
          label: '最大码率 (-maxrate)',
          control: 'text',
          commandBinding: { argName: '-maxrate', prefix: '-maxrate', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.maxRate },
          explanationId: 'expl.libx265.vbr.maxrate',
        },
        {
          id: 'libx265.vbr.bufsize',
          label: '缓冲区 (-bufsize)',
          control: 'text',
          commandBinding: { argName: '-bufsize', prefix: '-bufsize', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bufferSize },
          explanationId: 'expl.libx265.vbr.bufsize',
        },
      ],
    },
    {
      id: 'cqp',
      label: 'CQP (恒定量化)',
      emitterId: 'emitter.cqp',
      explanationId: 'expl.libx265.cqp',
      sourceRefs: [
        {
          repository: 'Lake1059/FFmpegFreeUI',
          branch: 'main',
          snapshotDate: '2026-07-10',
          file: 'src/databases/video-encoders.json',
          symbol: 'libx265.quality.cqp',
          sourceType: 'ffmpegfreeui',
        },
      ],
      controls: [
        {
          id: 'libx265.cqp.value',
          label: 'QP 值 (-qp)',
          control: 'number',
          commandBinding: { argName: '-qp', prefix: '-qp', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.qualityValue },
          range: { min: 0, max: 51, step: 1 },
          defaultValue: 28,
          explanationId: 'expl.libx265.cqp.value',
        },
      ],
    },
    {
      id: 'cbr',
      label: 'CBR (恒定码率)',
      emitterId: 'emitter.cbr',
      explanationId: 'expl.libx265.cbr',
      sourceRefs: [
        {
          repository: 'Lake1059/FFmpegFreeUI',
          branch: 'main',
          snapshotDate: '2026-07-10',
          file: 'src/databases/video-encoders.json',
          symbol: 'libx265.quality.cbr',
          sourceType: 'ffmpegfreeui',
        },
      ],
      controls: [
        {
          id: 'libx265.cbr.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.libx265.cbr.bitrate',
        },
      ],
    },
    {
      id: 'twoPass',
      label: '二次编码 (Two-Pass)',
      emitterId: 'emitter.twoPass',
      explanationId: 'expl.libx265.twopass',
      sourceRefs: [
        {
          repository: 'Lake1059/FFmpegFreeUI',
          branch: 'main',
          snapshotDate: '2026-07-10',
          file: 'src/databases/video-encoders.json',
          symbol: 'libx265.quality.twoPass',
          sourceType: 'ffmpegfreeui',
        },
      ],
      controls: [
        {
          id: 'libx265.twopass.bitrate',
          label: '目标码率 (-b:v)',
          control: 'text',
          commandBinding: { argName: '-b:v', prefix: '-b:v', phase: 'VIDEO_RATE_CONTROL' },
          configBinding: { path: CONFIG_PATHS.video.rateControl.bitrate },
          defaultValue: '5000k',
          explanationId: 'expl.libx265.twopass.bitrate',
        },
      ],
    },
  ],

  specialParameters: [
    // -- 线程（通用编码选项） ----------------------------------
    {
      id: 'libx265.threads',
      label: '编码线程数 (-threads)',
      control: 'number',
      configBinding: { path: videoSpecialParamPath('threads') },
      commandBinding: { argName: '-threads', prefix: '-threads', phase: 'VIDEO_CODEC' },
      range: { min: 1, max: 128 },
      explanationId: 'expl.libx265.threads',
      sourceRefs: [libx265Source],
    },

    // -- 自适应量化 ----------------------------------------------
    x265key('aqMode', '自适应量化模式 (aq-mode)', 'select', 'aq-mode', { options: [
      { value: '0', label: '0 — 关闭' }, { value: '1', label: '1 — 方差' },
      { value: '2', label: '2 — 自动方差' }, { value: '3', label: '3 — 自动方差 + 暗景偏向' },
      { value: '4', label: '4 — 自动方差 + 暗景偏向（增强）' },
    ]}),
    x265key('aqStrength', 'AQ 强度 (aq-strength)', 'number', 'aq-strength', { range: { min: 0, max: 3, step: 0.1 } }),

    // -- 心理视觉优化 --------------------------------------------
    x265key('psyRd', '心理视觉 RDO (psy-rd)', 'number', 'psy-rd', { range: { min: 0, max: 5, step: 0.1 } }),
    x265key('psyRdoq', '心理视觉 RDO-Q (psy-rdoq)', 'number', 'psy-rdoq', { range: { min: 0, max: 50, step: 0.1 } }),

    // -- 帧结构 --------------------------------------------------
    x265key('bframes', '最大 B 帧数 (bframes)', 'number', 'bframes', { range: { min: 0, max: 16, step: 1 } }),
    x265key('bAdapt', 'B 帧自适应策略 (b-adapt)', 'select', 'b-adapt', { options: [
      { value: '0', label: '0 — 关闭' }, { value: '1', label: '1 — 快速' }, { value: '2', label: '2 — 完整' },
    ]}),
    x265key('ref', '参考帧数 (ref)', 'number', 'ref', { range: { min: 1, max: 16, step: 1 } }),
    x265key('scenecut', '场景切换阈值 (scenecut)', 'number', 'scenecut', { range: { min: 0, max: 100, step: 1 } }),
    x265key('ctu', 'CTU 大小 (ctu)', 'select', 'ctu', { options: [
      { value: '64', label: '64' }, { value: '32', label: '32' }, { value: '16', label: '16' },
    ]}),

    // -- 运动估计 ------------------------------------------------
    x265key('me', '运动估计方法 (me)', 'select', 'me', { options: [
      { value: 'dia', label: 'dia — 菱形' }, { value: 'hex', label: 'hex — 六边形' },
      { value: 'umh', label: 'umh — 非均匀多六边形' }, { value: 'star', label: 'star — 星形' },
      { value: 'sea', label: 'sea — 连续消除' }, { value: 'full', label: 'full — 全搜索' },
    ]}),
    x265key('subme', '子像素 ME 精度 (subme)', 'number', 'subme', { range: { min: 0, max: 7, step: 1 } }),
    x265key('merange', 'ME 搜索范围 (merange)', 'number', 'merange', { range: { min: 0, max: 32768, step: 1 } }),

    // -- GOP 与滤波 ----------------------------------------------
    x265key('noOpenGop', '关闭开放 GOP (no-open-gop)', 'switch', 'no-open-gop'),
    x265key('noSao', '关闭 SAO 滤波 (no-sao)', 'switch', 'no-sao'),
    x265key('selectiveSao', '选择性 SAO (selective-sao)', 'select', 'selective-sao', { options: [
      { value: '0', label: '0 — 关闭' }, { value: '1', label: '1 — 开启' }, { value: '2', label: '2 — 增强' },
    ]}),
    x265key('saoNonDeblock', 'SAO 非去块模式 (sao-non-deblock)', 'switch', 'sao-non-deblock'),

    // -- 帧内预测 ------------------------------------------------
    x265key('noStrongIntraSmoothing', '关闭帧内强平滑', 'switch', 'no-strong-intra-smoothing'),
    x265key('noConstrainedIntra', '关闭约束帧内预测', 'switch', 'no-constrained-intra'),

    // -- 速度/质量权衡 -------------------------------------------
    x265key('limitModes', '限制 CU 模式 (limit-modes)', 'switch', 'limit-modes'),
    x265key('limitRefs', '限制参考帧候选 (limit-refs)', 'select', 'limit-refs', { options: [
      { value: '0', label: '0 — 关闭' }, { value: '1', label: '1 — 轻度' },
      { value: '2', label: '2 — 中度' }, { value: '3', label: '3 — 强度' },
    ]}),
    x265key('noCutree', '关闭 CU-tree (no-cutree)', 'switch', 'no-cutree'),

    // -- RDO -----------------------------------------------------
    x265key('rdoqLevel', 'RDO-Q 级别 (rdoq-level)', 'select', 'rdoq-level', { options: [
      { value: '0', label: '0 — 关闭' }, { value: '1', label: '1 — 轻度' }, { value: '2', label: '2 — 完整' },
    ]}),
    x265key('rdpenalty', 'RD 惩罚 (rdpenalty)', 'select', 'rdpenalty', { options: [
      { value: '0', label: '0 — 关闭' }, { value: '1', label: '1 — 轻度' }, { value: '2', label: '2 — 强度' },
    ]}),

    // -- CU / Merge ----------------------------------------------
    x265key('maxMerge', '最大 Merge 候选 (max-merge)', 'number', 'max-merge', { range: { min: 1, max: 5, step: 1 } }),
    x265key('earlySkip', '提前 Skip 检测 (early-skip)', 'switch', 'early-skip'),
    x265key('fastIntra', '快速帧内 (fast-intra)', 'switch', 'fast-intra'),
    x265key('bIntra', 'B 帧帧内 (b-intra)', 'switch', 'b-intra'),

    // -- VBV 码率控制 --------------------------------------------
    x265key('vbvMaxrate', 'VBV 最大码率 kbps (vbv-maxrate)', 'number', 'vbv-maxrate', { range: { min: 0, max: 240000, step: 1 } }),
    x265key('vbvBufsize', 'VBV 缓冲区 kbps (vbv-bufsize)', 'number', 'vbv-bufsize', { range: { min: 0, max: 240000, step: 1 } }),

    // -- QP 边界 -------------------------------------------------
    x265key('qpmin', '最小 QP (qpmin)', 'number', 'qpmin', { range: { min: 0, max: 69, step: 1 } }),
    x265key('qpmax', '最大 QP (qpmax)', 'number', 'qpmax', { range: { min: 0, max: 69, step: 1 } }),
    x265key('qpstep', 'QP 步长 (qpstep)', 'number', 'qpstep', { range: { min: 1, max: 10, step: 1 } }),

    // -- HRD -----------------------------------------------------
    x265key('hrd', 'HRD 兼容输出 (hrd)', 'switch', 'hrd'),
    x265key('hrdConcat', 'HRD 拼接模式 (hrd-concat)', 'switch', 'hrd-concat'),

    // -- 输出格式 ------------------------------------------------
    x265key('noInfo', '不写入编码器信息 (no-info)', 'switch', 'no-info'),
    x265key('hash', '解码校验哈希 (hash)', 'select', 'hash', { options: [
      { value: '0', label: '0 — 关闭' }, { value: '1', label: '1 — MD5' }, { value: '2', label: '2 — CRC' },
    ]}),
    x265key('repeatHeaders', '重复 SEI 头信息 (repeat-headers)', 'switch', 'repeat-headers'),

    // -- 去块滤波 ------------------------------------------------
    x265key('deblock', '去块滤波参数 (deblock)', 'text', 'deblock'),
    x265key('noDeblock', '关闭去块滤波 (no-deblock)', 'switch', 'no-deblock'),

    // -- 附加参数字典（保留） ------------------------------------
    {
      id: 'libx265.x265params',
      label: 'x265 附加参数 (-x265-params)',
      control: 'text',
      configBinding: { path: videoSpecialParamPath('x265Params') },
      commandBinding: {
        argName: '-x265-params', prefix: '-x265-params', phase: 'VIDEO_CODEC',
        dictionary: { separator: ':' },
      },
      optional: true,
      explanationId: 'expl.libx265.x265params',
    },
  ],

  requiredArguments: [],
  defaultArguments: [
    {
      argName: '-threads',
      value: 'auto',
      phase: 'VIDEO_CODEC',
    },
  ],

  explanationId: 'expl.libx265',
  sourceRefs: [
    {
      repository: 'Lake1059/FFmpegFreeUI',
      branch: 'main',
      snapshotDate: '2026-07-10',
      file: 'src/databases/video-encoders.json',
      symbol: 'libx265',
      sourceType: 'ffmpegfreeui',
    },
    {
      repository: 'FFmpeg/FFmpeg',
      branch: 'master',
      snapshotDate: '2026-07-10',
      file: 'libavcodec/libx265.c',
      sourceType: 'ffmpeg-official',
      url: 'https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/libx265.c',
    },
  ],
  sourceAuthority: 'ffmpegfreeui',
  verificationLevel: 'project-derived',
  needsCrossVerification: true,
  status: 'verified',
}
