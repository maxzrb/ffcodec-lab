// E2E test helpers
import type { Page } from '@playwright/test'

/** Wait for the builder page to fully load and render */
export async function waitForBuilder(page: Page) {
  await page.goto('/')
  await page.waitForSelector('h1')
  // Wait for pipeline to stabilize (no spinners, sections rendered)
  await page.waitForTimeout(500)
}

/** Get the command text from the preview area */
export async function getCommandText(page: Page): Promise<string> {
  const pre = page.locator('.command-preview pre, [data-testid="command-text"]').first()
  return (await pre.textContent()) ?? ''
}

/** Select an option in a ParameterField select */
export async function selectOption(page: Page, fieldId: string, value: string) {
  const select = page.locator(`[data-field-id="${fieldId}"] select`)
  await select.selectOption(value)
}

/** Toggle a switch/checkbox */
export async function toggleSwitch(page: Page, fieldId: string) {
  const checkbox = page.locator(`[data-field-id="${fieldId}"] input[type="checkbox"]`)
  await checkbox.click()
}

/** Fill a text input */
export async function fillText(page: Page, fieldId: string, value: string) {
  const input = page.locator(`[data-field-id="${fieldId}"] input[type="text"]`)
  await input.fill(value)
}

/** Set a number input */
export async function setNumber(page: Page, fieldId: string, value: number) {
  const input = page.locator(`[data-field-id="${fieldId}"] input[type="number"]`)
  await input.fill(String(value))
}

/** Expand a section by clicking its header */
export async function expandSection(page: Page, sectionId: string) {
  const section = page.locator(`[data-section-id="${sectionId}"]`)
  const button = section.locator('button').first()
  const isExpanded = await section.locator('.param-field').first().isVisible().catch(() => false)
  if (!isExpanded) {
    await button.click()
    await page.waitForTimeout(200)
  }
}

/** Click a command token */
export async function clickToken(page: Page, tokenText: string) {
  const token = page.locator('.command-token', { hasText: tokenText }).first()
  await token.click()
}

/** Open the preset manager */
export async function openPresetManager(page: Page) {
  await page.locator('button', { hasText: '预设' }).click()
  await page.waitForTimeout(300)
}

/** Close a modal by clicking the backdrop or X button */
export async function closeModal(page: Page) {
  // Try X button first, then backdrop
  const xBtn = page.locator('button', { hasText: '✕' }).first()
  if (await xBtn.isVisible().catch(() => false)) {
    await xBtn.click()
  }
}

/** Check that the command contains specific text */
export async function assertCommandContains(page: Page, text: string) {
  const cmd = await getCommandText(page)
  if (!cmd.includes(text)) {
    throw new Error(`Expected command to contain "${text}" but got:\n${cmd}`)
  }
}
