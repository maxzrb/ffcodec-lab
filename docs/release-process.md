# FFCodec Lab 标准发布流程

本文是 FFCodec Lab 正式发布的唯一执行流程。任何 Agent 或维护者收到“发布”“打包并发布”“推进版本”等请求时，都必须按本文顺序执行，不得根据个人习惯重排步骤、遗漏资产或把发布拆成互不校验的操作。

固定主流程：

```text
推进版本号 → 提交 → 构建 Desktop → 推送远端 → 发布 GitHub Release → 更新 README
```

版本规则以 [`VERSIONING.md`](../VERSIONING.md) 为准。本文负责规定具体操作、门禁、产物和失败处理。

## 1. 发布授权与基本原则

- 只有用户明确要求“发布”时才能创建标签、推送、创建 GitHub Release 或上传资产。普通的“构建”“验收”“准备版本”不包含发布授权。
- 正式发布分支固定为 `master`，远端固定为 `origin`。
- Git 标签和 Release 标签使用 `v<SemVer>`，例如 `v1.8.0`。
- Release 标题使用 `FFCodec Lab <SemVer>（<版本序号>）`。
- Desktop 固定发布四项资产：Full 安装版、Base 安装版、Onedir ZIP、`SHA256SUMS.txt`。
- Web 正式环境由 `master` 推送触发 Cloudflare 部署；不使用 OpenAI Sites 代替正式 Web 发布。
- 发布时只暂存明确列出的源码和文档。禁止使用未经检查的 `git add .`，禁止把 `assets/`、FFmpeg 归档、临时输出或本机配置带入提交。
- 发布步骤必须连续完成。任何门禁失败都先停止发布，不得跳过后继续上传。

## 2. 发布前置条件

### 2.1 环境

Windows 发布机至少需要：

- Node.js 20+
- 仓库指定的 pnpm 版本（当前见根 `package.json#packageManager`）
- .NET 8 SDK
- 7-Zip，并能调用 `7z`；或设置 `SEVEN_ZIP`
- GitHub CLI `gh`，已登录且对 `maxzrb/ffcodec-lab` 有发布权限
- 用户明确确认的 Full 包 FFmpeg 归档

检查：

```powershell
node --version
pnpm --version
dotnet --version
7z i
gh auth status
```

### 2.2 Git 边界

```powershell
git pull --ff-only
git status --short --branch
git log -1 --oneline --decorate
```

开始推进版本前必须满足：

- 当前分支为 `master`。
- 已同步 `origin/master`，或已明确了解本地领先提交并准备一并发布。
- 不存在来源不明的 staged 文件。
- 所有产品改动均已验收并形成清晰提交；允许存在明确列入排除清单的本地未跟踪素材，但绝不能暂存。
- `CHANGELOG.md` 的 `Unreleased` 内容与本次实际发布范围一致。

如果工作树包含多个尚未提交功能，先停止并划分提交边界；不得把“顺手修改”混入 release commit。

## 3. 第一步：推进版本号

先根据 [`VERSIONING.md`](../VERSIONING.md) 选择 PATCH、MINOR 或 MAJOR，并把正式版本序号递增 1。版本序号永不重置、不得复用。

设本次参数为：

```powershell
$Version = "1.8.0"
$BuildNumber = 17
$Tag = "v$Version"
```

必须同步：

1. 根目录 `package.json` 的 `version`。
2. `apps/web/package.json` 的 `version`。
3. `apps/desktop/package.json` 的 `version`。
4. `packages/workbench/src/WorkbenchApp.tsx` 的 `APP_VERSION`，格式为 `<版本号>（<版本序号>）`。
5. 所有断言界面版本号的自动化测试。
6. `CHANGELOG.md`：把本次内容从 `Unreleased` 整理到 `v<版本号> (<日期>)`。
7. `VERSIONING.md`：补充正式版本序号映射，并更新“下一次正式发布”序号。
8. `version/版本迭代记录.md`、`docs/codex/STATUS.md`、`version/工作进度.md`。

内部 workspace 包当前固定为 `0.1.0`；除非明确要发布这些 npm 包，否则不要修改 `packages/*/package.json` 的版本。

按用户习惯，`README.md` 的当前版本、下载链接和发布门禁说明放在 GitHub Release 成功后更新，不纳入此时的 release commit。

检查所有残留旧版本：

```powershell
rg -n "1\.7\.3|1\.7\.3（16）|v1\.7\.3" package.json apps packages CHANGELOG.md VERSIONING.md version
```

把示例中的旧版本替换成实际上一版本。搜索结果必须逐项判断；历史版本记录和迁移测试中的旧版本可以保留，不能机械全局替换。

## 4. 第二步：发布门禁与提交

### 4.1 提交前门禁

```powershell
pnpm install --frozen-lockfile
pnpm check
pnpm audit:catalog
pnpm verify:filter-formats
pnpm verify:real-media
pnpm build:web
git diff --check
```

要求：

- TypeScript、Vitest、ESLint 全部通过。
- Desktop 原生 helper 必须从源码构建成功。
- Catalog audit 为 0 error；已有 warning 要记录，新 warning 必须解释。
- 实际 FFmpeg 验证必须 FAIL 0；当前设备缺少的硬件能力应记为 SKIP，不能伪装成 PASS，也不能把环境性缺失计为产品 FAIL。
- Web production build 成功。Vite 大 chunk 警告目前是已知非阻断项，但必须在发布记录中注明。

### 4.2 审查并提交

只暂存本次发布范围内的明确路径：

```powershell
git add -- <产品源码路径> <测试路径> package.json apps/web/package.json apps/desktop/package.json packages/workbench/src/WorkbenchApp.tsx CHANGELOG.md VERSIONING.md
git diff --cached --stat
git diff --cached
git status --short
```

确认 `assets/`、`release/`、`out/`、FFmpeg 归档、本地教程和密钥均未暂存，然后提交：

```powershell
git commit -m "release: v$Version"
```

提交后记录发布提交：

```powershell
$ReleaseCommit = git rev-parse HEAD
git show --stat --oneline HEAD
```

## 5. 第三步：从发布提交构建 Desktop

Desktop 正式包必须从刚才的 `$ReleaseCommit` 构建。构建过程中如果修改了受版本控制文件，立即停止，先处理并重新提交。

### 5.1 Full 包输入

默认归档为仓库根目录的 `ffmpeg-full.7z`。也可以显式指定：

```powershell
$env:FFCODEC_FFMPEG_ARCHIVE = "D:\path\to\ffmpeg-full.7z"
$env:SEVEN_ZIP = "7z"
```

用户目前指定为仓库根目录下assets\ffmpeg-full-8.6自编译全功能，打包后必须把文件夹脱壳或改名为ffmpeg-full

Full 归档必须由用户确认是本次要分发的构建。Agent 不得自行把 `assets/` 中任意 FFmpeg 目录或测试压缩包替换为正式发布输入。

### 5.2 构建三种包

```powershell
pnpm build:desktop:win
```

脚本输出位置：

```text
release/desktop/full/FFCodec-Lab-Setup-Full-<version>.exe
release/desktop/base/FFCodec-Lab-Setup-Base-<version>.exe
release/desktop/onedir/win-unpacked/
```

### 5.3 创建 Onedir ZIP

```powershell
$OnedirZip = "release\desktop\onedir\FFCodec-Lab-Onedir-$Version.zip"
if (Test-Path -LiteralPath $OnedirZip) { Remove-Item -LiteralPath $OnedirZip }
7z a -tzip -mx=9 $OnedirZip ".\release\desktop\onedir\win-unpacked\*"
```

ZIP 根目录必须直接包含 `FFCodec Lab.exe`，不能额外套一层 `win-unpacked`。

### 5.4 产物边界检查

```powershell
$FullDir = "release\desktop\full\win-unpacked"
$BaseDir = "release\desktop\base\win-unpacked"
$OnedirDir = "release\desktop\onedir\win-unpacked"

Test-Path "$FullDir\resources\ffmpeg\ffmpeg.exe"
Test-Path "$FullDir\resources\ffmpeg\ffprobe.exe"
Test-Path "$FullDir\resources\ffmpeg\ffplay.exe"
Test-Path "$BaseDir\resources\ffmpeg\ffmpeg.exe"
Test-Path "$OnedirDir\resources\ffmpeg\ffmpeg.exe"
```

预期前三项为 `True`，后两项为 `False`。三种包都必须包含原生 hardware-monitor 和第三方许可文件。

核对主程序版本：

```powershell
@(
  "$FullDir\FFCodec Lab.exe",
  "$BaseDir\FFCodec Lab.exe",
  "$OnedirDir\FFCodec Lab.exe"
) | ForEach-Object {
  [PSCustomObject]@{
    Path = $_
    ProductVersion = (Get-Item -LiteralPath $_).VersionInfo.ProductVersion
  }
}
```

三个 `ProductVersion` 必须与 `$Version` 一致。

### 5.5 完整性与 SHA-256

```powershell
$Full = "release\desktop\full\FFCodec-Lab-Setup-Full-$Version.exe"
$Base = "release\desktop\base\FFCodec-Lab-Setup-Base-$Version.exe"
$Onedir = "release\desktop\onedir\FFCodec-Lab-Onedir-$Version.zip"
$Sums = "release\desktop\SHA256SUMS.txt"

7z t $Full
7z t $Base
7z t $Onedir

$Lines = @($Full, $Base, $Onedir) | ForEach-Object {
  $Hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $_).Hash.ToLowerInvariant()
  "$Hash *$(Split-Path -Leaf $_)"
}
[System.IO.File]::WriteAllLines(
  (Join-Path (Resolve-Path "release\desktop").Path "SHA256SUMS.txt"),
  $Lines,
  [System.Text.UTF8Encoding]::new($false)
)
Get-Content -Encoding UTF8 $Sums
```

`SHA256SUMS.txt` 只写三个资产的文件名，不写发布机本地目录。记录每个资产的字节数和 SHA-256，供 Release 与版本记录复核。

若本次要求代码签名，再运行：

```powershell
Get-AuthenticodeSignature -LiteralPath $Full
Get-AuthenticodeSignature -LiteralPath $Base
Get-AuthenticodeSignature -LiteralPath "$OnedirDir\FFCodec Lab.exe"
```

要求签名的版本必须为 `Valid`；未要求签名时要在 README/Release 说明 SmartScreen 风险，不得声称已签名。

## 6. 第四步：推送发布提交和标签

构建与产物检查全部通过后才能推送：

```powershell
git status --short --branch
git push origin master
git tag -a $Tag $ReleaseCommit -m "FFCodec Lab $Version（$BuildNumber）"
git push origin $Tag
```

标签必须是 annotated tag，并且明确指向 `$ReleaseCommit`。此时还没有 README follow-up commit，因此不会误把后续 README 提交纳入版本标签。

远端核对：

```powershell
git ls-remote origin refs/heads/master
git ls-remote origin "refs/tags/$Tag" "refs/tags/$Tag^{}"
git show $Tag --no-patch --decorate
```

## 7. 第五步：发布 GitHub Release

先准备 UTF-8 Release 说明，至少包含：

- 本版主要变化
- 兼容性或迁移说明
- 验证结果
- Full/Base/Onedir 的区别
- 已知限制

创建正式 Release 并上传四项资产：

```powershell
$Notes = "release\desktop\release-notes-$Version.md"
gh release create $Tag `
  $Full `
  $Base `
  $Onedir `
  $Sums `
  --verify-tag `
  --fail-on-no-commits `
  --latest `
  --title "FFCodec Lab $Version（$BuildNumber）" `
  --notes-file $Notes
```

发布后必须验证：

```powershell
gh release view $Tag --json tagName,name,isDraft,isPrerelease,publishedAt,url,assets
```

通过条件：

- `isDraft=false`、`isPrerelease=false`。
- Release 标题、标签和版本序号正确。
- 四项资产状态均为 `uploaded`。
- 远端资产名称和本地名称完全一致。
- 远端资产大小与本地字节数一致。
- GitHub 返回的 `sha256:` digest 与本地 `Get-FileHash` 一致。

在这些检查完成前，不得宣布发布成功。

## 8. 第六步：更新 README

GitHub Release 和四项资产确认可用后，最后更新 `README.md`：

1. “当前版本”改为 `<版本号>（<版本序号>）`。
2. Full、Base、Onedir 三条下载链接改为新标签和新文件名。
3. `SHA256SUMS.txt` 链接改为新标签。
4. 发布门禁说明改为本次真实测试数量、构建与验证范围。
5. 签名或 SmartScreen 状态必须与本次产物一致。
6. 若主要能力有用户可见变化，同步更新能力摘要，但不要把 CHANGELOG 全文复制进 README。

检查链接：

```powershell
rg -n "当前版本|releases/download|SHA256SUMS|发布门禁" README.md
git diff --check -- README.md
```

README 单独提交并推送：

```powershell
git add -- README.md
git diff --cached -- README.md
git commit -m "docs: update README for v$Version"
git push origin master
```

这是用户约定的最后一步。`v<version>` 标签仍指向发布提交，README follow-up commit 位于标签之后。

## 9. 发布后验收与记录

### 9.1 Git 与 Release

```powershell
git status --short --branch
git log -3 --oneline --decorate
gh release view $Tag --json url,tagName,name,assets
```

受版本控制工作树应干净；只允许存在发布前已经列明的本地忽略文件或未跟踪测试素材。

### 9.2 Web

等待 Cloudflare 对最终 `master` 提交部署完成，然后检查：

- `https://fflab.loliland.cn` 返回 HTTP 200。
- 页面或主脚本显示新版本号和版本序号。
- Desktop 下载入口指向新 Release。
- 字体及关键静态资源响应正常。

### 9.3 项目记录

完成以下记录：

- `version/版本迭代记录.md`：版本、日期、功能、验证、资产大小与 SHA-256、Release URL。
- `docs/codex/STATUS.md`：发布提交、README 提交、标签、远端状态、验证结果和 Git 状态。
- `version/工作进度.md`：面向用户的中文发布摘要。

只有版本或 Release 状态确实变化时才更新 `version/版本迭代记录.md`。

## 10. 失败处理

- **提交前失败**：修复后重跑对应门禁，不提交、不构建发布包。
- **发布提交后、推送前失败**：修复并形成明确提交，再从新的 HEAD 重新构建全部资产；不得混用旧产物。
- **推送后、打标签前失败**：推送修复提交，重新构建；标签最终指向通过全部门禁的提交。
- **标签已推送但 Release 未发布**：停止并报告用户。未经明确授权不得移动或删除远端正式标签。
- **Release 已发布后发现问题**：不得静默替换资产或改写标签。默认发布新的 PATCH 版本；只有用户明确要求同标签热替换时，才同时更新资产、SHA256SUMS、Release 说明、README 和版本记录，并完整复核远端 digest。
- **README 更新失败**：Release 仍然存在，但发布流程尚未完成。修复 README、推送并验证后才能宣告收尾。

## 11. Agent 最终汇报格式

每次发布完成后，Agent 至少汇报：

- 版本号与版本序号
- 发布提交、README 提交、标签
- Full/Base/Onedir/SHA256SUMS 四项资产状态
- 三个二进制资产的大小和 SHA-256
- `pnpm check`、真实媒体、双端构建及包完整性结果
- Release URL 与 Web 上线状态
- 最终 Git 是否干净、是否仍有本地未跟踪资产

不得只回复“已发布”而省略上述证据。
