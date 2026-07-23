import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { Arch, Platform, build } from 'electron-builder'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const desktopDir = resolve(scriptDir, '..')
const repositoryDir = resolve(desktopDir, '..', '..')
const packageJson = JSON.parse(readFileSync(resolve(desktopDir, 'package.json'), 'utf8'))

const profiles = {
  full: {
    target: 'nsis',
    outputDirectory: 'full',
    artifactName: 'FFCodec-Lab-Setup-Full-${version}.${ext}',
    includeFfmpeg: true,
  },
  base: {
    target: 'nsis',
    outputDirectory: 'base',
    artifactName: 'FFCodec-Lab-Setup-Base-${version}.${ext}',
    includeFfmpeg: false,
  },
  onedir: {
    target: 'dir',
    outputDirectory: 'onedir',
    includeFfmpeg: false,
  },
}

const profileName = process.argv[2]
const profile = profiles[profileName]

if (!profile) {
  console.error(`未知构建类型：${profileName ?? '(未提供)'}。可选值：full、base、onedir。`)
  process.exit(1)
}

function resetDirectory(directoryPath) {
  const relativePath = relative(repositoryDir, directoryPath)
  if (!relativePath || relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new Error(`拒绝清理仓库外目录：${directoryPath}`)
  }

  rmSync(directoryPath, { recursive: true, force: true })
  mkdirSync(directoryPath, { recursive: true })
}

function extractFfmpeg() {
  const archivePath = resolve(process.env.FFCODEC_FFMPEG_ARCHIVE || resolve(repositoryDir, 'ffmpeg-full.7z'))
  if (!existsSync(archivePath)) {
    throw new Error(`全量构建缺少 FFmpeg 归档：${archivePath}`)
  }

  const stagingDirectory = resolve(repositoryDir, 'out', 'release-staging', 'ffmpeg-full')
  resetDirectory(stagingDirectory)

  const commands = [process.env.SEVEN_ZIP, '7z', '7zz'].filter(Boolean)
  let lastError

  for (const command of commands) {
    const result = spawnSync(command, ['x', '-y', `-o${stagingDirectory}`, archivePath], {
      cwd: repositoryDir,
      encoding: 'utf8',
      stdio: 'inherit',
      windowsHide: true,
    })

    if (!result.error && result.status === 0) {
      lastError = undefined
      break
    }

    lastError = result.error ?? new Error(`${command} 退出码 ${result.status}`)
  }

  if (lastError) {
    throw new Error(`无法解压 FFmpeg 归档，请安装 7z 或设置 SEVEN_ZIP：${lastError.message}`)
  }

  for (const executable of ['ffmpeg.exe', 'ffprobe.exe']) {
    if (!existsSync(resolve(stagingDirectory, executable))) {
      throw new Error(`FFmpeg 归档缺少 ${executable}`)
    }
  }

  return stagingDirectory
}

const outputDirectory = resolve(repositoryDir, 'release', 'desktop', profile.outputDirectory)
resetDirectory(outputDirectory)

const config = {
  directories: {
    output: outputDirectory,
  },
  win: {
    target: [profile.target],
  },
}

if (profile.includeFfmpeg) {
  config.extraResources = [{
    from: extractFfmpeg(),
    to: 'ffmpeg',
    filter: ['**/*'],
  }]
}

if (profile.artifactName) {
  config.nsis = {
    artifactName: profile.artifactName,
  }
}

process.chdir(desktopDir)

const artifacts = await build({
  targets: Platform.WINDOWS.createTarget([profile.target], Arch.x64),
  config,
})

console.log(`Windows ${profileName} 构建完成：`)
for (const artifact of artifacts) {
  console.log(artifact)
}
