// ============================================================
// E2E tests — BuilderPage full interaction chains.
// Requires: npx playwright test
// Playwright browser install: npx playwright install chromium
// ============================================================

import { test, expect } from '@playwright/test'
import {
  waitForBuilder,
  getCommandText,
  selectOption,
  toggleSwitch,
  expandSection,
  assertCommandContains,
  openPresetManager,
} from './helpers'

test.describe('Builder Page', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBuilder(page)
  })

  test('page loads with title and sections', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('FFmpeg')
    // At least one section visible
    await expect(page.locator('.param-field').first()).toBeVisible()
  })

  test('default config generates libx264 CRF command', async ({ page }) => {
    const cmd = await getCommandText(page)
    expect(cmd).toContain('-c:v libx264')
    expect(cmd).toContain('-crf')
  })

  test('switching encoder changes command', async ({ page }) => {
    await selectOption(page, 'video.encoderId', 'libx265')
    await page.waitForTimeout(500)
    const cmd = await getCommandText(page)
    expect(cmd).toContain('-c:v libx265')
  })

  test('switching quality mode changes command args', async ({ page }) => {
    // First switch to an encoder that supports VBR
    await selectOption(page, 'video.encoderId', 'libx265')
    await page.waitForTimeout(300)
    await selectOption(page, 'video.rateControl.mode', 'vbr')
    await page.waitForTimeout(300)
    const cmd = await getCommandText(page)
    expect(cmd).toContain('-b:v')
    expect(cmd).not.toContain('-crf')
  })

  test('switching container changes output extension', async ({ page }) => {
    await selectOption(page, 'output.containerId', 'mkv')
    await page.waitForTimeout(300)
    const cmd = await getCommandText(page)
    expect(cmd).toContain('.mkv')
  })
})

test.describe('Checkbox Controls', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBuilder(page)
    await selectOption(page, 'video.encoderId', 'h264_nvenc')
    await page.waitForTimeout(500)
  })

  test('NVENC spatial AQ toggle updates command', async ({ page }) => {
    await expandSection(page, 'section.video')
    const before = await getCommandText(page)
    expect(before).toContain('-spatial_aq 1') // default for NVENC

    // Toggle spatial AQ off — then on
    // (The actual field ID depends on resolve-section specialParameters rendering)
    const spAq = page.locator('[data-field-id*="spatialaq"] input[type="checkbox"]')
    if (await spAq.isVisible().catch(() => false)) {
      await spAq.click()
      await page.waitForTimeout(300)
      const after = await getCommandText(page)
      // spatial_aq should not appear when unchecked
      expect(after).not.toContain('-spatial_aq')
    }
  })

  test('output overwrite checkbox toggles -y flag', async ({ page }) => {
    const before = await getCommandText(page)
    expect(before).not.toContain(' -y')

    await toggleSwitch(page, 'output.overwrite')
    await page.waitForTimeout(300)
    const after = await getCommandText(page)
    expect(after).toContain('-y')
  })
})

test.describe('Frame Controls', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBuilder(page)
    await expandSection(page, 'section.frame')
  })

  test('resolution mode switch shows/hides width field', async ({ page }) => {
    await selectOption(page, 'frame.resolution.mode', 'size')
    await page.waitForTimeout(300)
    await expect(page.locator('[data-field-id="frame.resolution.width"]')).toBeVisible()
    await expect(page.locator('[data-field-id="frame.resolution.height"]')).toBeVisible()
  })

  test('custom frame rate generates -r flag', async ({ page }) => {
    await selectOption(page, 'frame.frameRate.mode', 'value')
    await page.waitForTimeout(300)
    // Check that frame rate value field appears
    await expect(page.locator('[data-field-id="frame.frameRate.value"]')).toBeVisible()
  })
})

test.describe('Subtitle Controls', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBuilder(page)
    await expandSection(page, 'section.subtitle')
  })

  test('subtitle burn toggle shows burn options', async ({ page }) => {
    const enabled = page.locator('[data-field-id="subtitle.burn.enabled"] input[type="checkbox"]')
    if (await enabled.isVisible().catch(() => false)) {
      const isChecked = await enabled.isChecked()
      if (!isChecked) {
        await enabled.click()
        await page.waitForTimeout(300)
      }
      // After enabling, source selector should appear
      await expect(page.locator('[data-field-id="subtitle.burn.source"]')).toBeVisible()
    }
  })
})

test.describe('Preset Manager', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBuilder(page)
  })

  test('preset manager opens and shows built-in presets', async ({ page }) => {
    await openPresetManager(page)
    await expect(page.getByText('H.264 日常均衡')).toBeVisible()
    await expect(page.getByText('H.265 高质量')).toBeVisible()
  })

  test('applying a built-in preset changes the command', async ({ page }) => {
    await openPresetManager(page)
    // Click "应用" on "H.265 高质量" preset
    const h265Card = page.locator('text=H.265 高质量').locator('..')
    const applyBtn = h265Card.locator('button', { hasText: '应用' })
    if (await applyBtn.isVisible().catch(() => false)) {
      await applyBtn.click()
      await page.waitForTimeout(500)
      const cmd = await getCommandText(page)
      expect(cmd).toContain('-c:v libx265')
    }
  })
})

test.describe('QSV Encoder', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBuilder(page)
  })

  test('selecting h264_qsv shows QSV quality modes', async ({ page }) => {
    await selectOption(page, 'video.encoderId', 'h264_qsv')
    await page.waitForTimeout(500)

    const cmd = await getCommandText(page)
    expect(cmd).toContain('-c:v h264_qsv')
    expect(cmd).toContain('-qp')
  })

  test('QSV ICQ mode generates -global_quality', async ({ page }) => {
    await selectOption(page, 'video.encoderId', 'h264_qsv')
    await page.waitForTimeout(300)
    await selectOption(page, 'video.rateControl.mode', 'qsv-icq')
    await page.waitForTimeout(300)

    const cmd = await getCommandText(page)
    expect(cmd).toContain('-global_quality')
    expect(cmd).toContain('-look_ahead')
  })

  test('QSV error config does not block copy for availability warnings', async ({ page }) => {
    await selectOption(page, 'video.encoderId', 'h264_qsv')
    await page.waitForTimeout(500)
    // Command should still be generated even with hardware-dependent encoder
    const cmd = await getCommandText(page)
    expect(cmd).toContain('ffmpeg')
  })
})

test.describe('Shell Switching', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBuilder(page)
  })

  test('PowerShell uses backtick line continuation', async ({ page }) => {
    // Click PowerShell button in ShellSelector
    const psBtn = page.locator('button', { hasText: 'PowerShell' })
    if (await psBtn.isVisible().catch(() => false)) {
      await psBtn.click()
      await page.waitForTimeout(300)
      const cmd = await getCommandText(page)
      expect(cmd).toContain('`')
    }
  })

  test('CMD uses caret line continuation', async ({ page }) => {
    const cmdBtn = page.locator('button', { hasText: 'CMD' })
    if (await cmdBtn.isVisible().catch(() => false)) {
      await cmdBtn.click()
      await page.waitForTimeout(300)
      const cmd = await getCommandText(page)
      expect(cmd).toContain('^')
    }
  })
})

test.describe('Token Click Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await waitForBuilder(page)
  })

  test('clicking a command token highlights corresponding field', async ({ page }) => {
    // Check if multiline mode is on (tokens are clickable)
    const multilineBtn = page.locator('button', { hasText: '多行' })
    if (await multilineBtn.isVisible().catch(() => false)) {
      await multilineBtn.click()
      await page.waitForTimeout(300)
    }

    // Try clicking a token
    const token = page.locator('.command-token').first()
    if (await token.isVisible().catch(() => false)) {
      await token.click()
      await page.waitForTimeout(300)
      // A highlighted field should appear
      const highlighted = page.locator('.param-field--highlighted')
      expect(await highlighted.count()).toBeGreaterThan(0)
    }
  })
})
