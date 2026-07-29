import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

// 用真实 FFmpeg 验证项目依赖的像素格式协商，不把静态能力表当作唯一证据。
const requested = process.argv.slice(2)
const bundled = resolve('apps/desktop/native/ffmpeg/ffmpeg.exe')
const assFixture = resolve('apps/web/src/tests/fixtures/minimal.ass')
  .replaceAll('\\', '/')
  .replace(':', '\\:')
const executables = requested.length > 0
  ? requested
  : ['ffmpeg', ...(existsSync(bundled) ? [bundled] : [])]

const cases = [
  {
    name: '4:2:0 8-bit 自动提升到同采样 10-bit',
    input: 'yuv420p',
    filter: 'format=pix_fmts=yuv420p10le|yuv422p10le|yuv444p10le|gbrp10le',
    expected: 'yuv420p10le',
  },
  {
    name: '4:4:4 16-bit 保持原精度',
    input: 'yuv444p16le',
    filter: 'format=pix_fmts=yuv420p10le|yuv422p10le|yuv444p10le|yuv420p12le|yuv422p12le|yuv444p12le|yuv420p16le|yuv422p16le|yuv444p16le',
    expected: 'yuv444p16le',
  },
  {
    name: '4:2:2 8-bit 自动提升到同采样 10-bit',
    input: 'yuv422p',
    filter: 'format=pix_fmts=yuv420p10le|yuv422p10le|yuv444p10le|gbrp10le',
    expected: 'yuv422p10le',
  },
  {
    name: '4:4:4 12-bit 保持原精度',
    input: 'yuv444p12le',
    filter: 'format=pix_fmts=yuv420p10le|yuv422p10le|yuv444p10le|yuv420p12le|yuv422p12le|yuv444p12le',
    expected: 'yuv444p12le',
  },
  {
    name: 'Alpha 4:2:0 提升到 10-bit 并保留 Alpha',
    input: 'yuva420p',
    filter: 'format=pix_fmts=yuv420p10le|yuva420p10le|yuva444p10le',
    expected: 'yuva420p10le',
  },
  {
    name: '灰度输入提升到 gray10le',
    input: 'gray',
    filter: 'format=pix_fmts=yuv420p10le|gray10le|gbrp10le',
    expected: 'gray10le',
  },
  {
    name: 'RGB 12-bit 保持色彩家族和位深',
    input: 'gbrp12le',
    filter: 'format=pix_fmts=yuv444p10le|gbrp10le|gbrp12le',
    expected: 'gbrp12le',
  },
  {
    name: '高精度画面调整保持 16-bit',
    input: 'yuv420p16le',
    filter: "lutyuv=y='val':u='val':v='val'",
    expected: 'yuv420p16le',
  },
  {
    name: '误差扩散降到 8-bit',
    input: 'yuv420p10le',
    filter: 'zscale=dither=error_diffusion,format=yuv420p',
    expected: 'yuv420p',
  },
  {
    name: '字幕烧录保持 12-bit',
    input: 'yuv422p12le',
    filter: `ass=filename='${assFixture}'`,
    expected: 'yuv422p12le',
  },
  {
    name: '能力快照确认 nlmeans 降到 8-bit',
    input: 'yuv420p10le',
    filter: 'nlmeans=s=1:p=3:r=5',
    expected: 'yuv420p',
  },
  {
    name: '能力快照确认 gradfun 降到 8-bit',
    input: 'yuv420p10le',
    filter: 'gradfun',
    expected: 'yuv420p',
  },
]

const requiredPixelFormats = [
  'yuv420p10le', 'yuv422p10le', 'yuv444p10le',
  'yuva420p10le', 'yuva422p10le', 'yuva444p10le',
  'gray10le', 'gbrp10le', 'gbrap10le',
  'yuv420p12le', 'yuv422p12le', 'yuv444p12le',
  'yuva422p12le', 'yuva444p12le', 'gray12le', 'gbrp12le', 'gbrap12le',
  'yuv420p16le', 'yuv422p16le', 'yuv444p16le',
  'yuva420p16le', 'yuva422p16le', 'yuva444p16le',
  'gray16le', 'gbrp16le', 'gbrap16le', 'gbrpf32le', 'gbrapf32le',
]

let failed = false
for (const executable of executables) {
  const version = run(executable, ['-version']).stdout.split(/\r?\n/, 1)[0]
  console.log(`\n${executable}\n${version}`)
  const pixelFormats = run(executable, ['-hide_banner', '-pix_fmts']).stdout
  const missing = requiredPixelFormats.filter((format) => (
    !new RegExp(`^IO...\\s+${format}\\s`, 'm').test(pixelFormats)
  ))
  const formatsOk = missing.length === 0
  console.log(`${formatsOk ? 'PASS' : 'FAIL'} 高精度候选格式均存在${formatsOk ? '' : `: ${missing.join(', ')}`}`)
  if (!formatsOk) failed = true
  for (const testCase of cases) {
    const result = run(executable, [
      '-hide_banner', '-loglevel', 'info',
      '-f', 'lavfi',
      '-i', `testsrc2=s=64x64:d=0.08,format=${testCase.input}`,
      '-vf', `${testCase.filter},showinfo`,
      '-frames:v', '1',
      '-f', 'null', '-',
    ])
    const actual = [...result.stderr.matchAll(/\bfmt:([^\s]+)/g)].at(-1)?.[1]
    const ok = result.status === 0 && actual === testCase.expected
    console.log(`${ok ? 'PASS' : 'FAIL'} ${testCase.name}: ${actual ?? '无输出格式'}`)
    if (!ok) failed = true
  }
}

if (failed) process.exitCode = 1

function run(executable, args) {
  const result = spawnSync(executable, args, { encoding: 'utf8', windowsHide: true })
  if (result.error) {
    throw new Error(`无法运行 ${executable}: ${result.error.message}`)
  }
  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  }
}
