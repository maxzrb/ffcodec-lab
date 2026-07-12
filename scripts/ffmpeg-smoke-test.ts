import { execFileSync } from 'node:child_process'

interface SmokeCase {
  name: string
  args: string[]
}

const source = ['-f', 'lavfi', '-i', 'testsrc2=size=64x64:rate=25:duration=0.12']
const cases: SmokeCase[] = [
  {
    name: 'libx264 advanced rate control',
    args: [...source, '-c:v', 'libx264', '-crf', '30', '-g', '25', '-bf', '2', '-rc-lookahead', '10', '-aq-strength', '1', '-sc_threshold', '40', '-refs', '2', '-level', '3.1', '-f', 'null', '-'],
  },
  {
    name: 'zscale SDR conversion',
    args: [...source, '-vf', 'setparams=colorspace=bt709:color_primaries=bt709:color_trc=bt709:range=tv,zscale=matrix=bt709:primaries=bt709:transfer=bt709:range=tv', '-f', 'null', '-'],
  },
  {
    name: 'CPU HDR-to-SDR tone mapping',
    args: [...source, '-vf', 'setparams=colorspace=bt2020nc:color_primaries=bt2020:color_trc=smpte2084:range=tv,zscale=transfer=linear:npl=100,format=gbrpf32le,tonemap=tonemap=mobius:desat=2,zscale=matrix=bt709:primaries=bt709:transfer=bt709:range=tv,format=yuv420p', '-f', 'null', '-'],
  },
  {
    name: 'denoise and deband chain',
    args: [...source, '-vf', 'hqdn3d=4:3:6:4.5,deband=1thr=0.02:2thr=0.02:3thr=0.02:range=16:direction=0:blur=1:coupling=0', '-f', 'null', '-'],
  },
]

function run(): void {
  const version = execFileSync('ffmpeg', ['-hide_banner', '-version'], { encoding: 'utf8' }).split(/\r?\n/)[0]
  console.log(version)
  for (const smokeCase of cases) {
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', ...smokeCase.args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    console.log(`PASS ${smokeCase.name}`)
  }
  console.log(`FFmpeg smoke matrix passed: ${cases.length}/${cases.length}`)
}

try {
  run()
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error)
  console.error(`FFmpeg smoke matrix failed: ${detail}`)
  process.exitCode = 1
}
