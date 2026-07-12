import { describe, it, expect } from 'vitest'
import { createDefaultProjectConfig } from '../../domain/config/defaults'
import { buildFixSuggestions } from '../../domain/diagnostics/build-fix-suggestions'
import { applyFix, isAllowedOperation } from '../../domain/diagnostics/apply-diagnostic-fix'
import { loadCatalog } from '../../domain/catalog/catalog-loader'
import { CONFIG_PATHS } from '../../domain/config/config-path'
import type { Diagnostic, DiagnosticFix } from '../../domain/rules/rule-types'

const catalog = loadCatalog()

describe('Diagnostic fix suggestions', () => {
  it('suggests container switch for WebM + libx264', () => {
    const diag: Diagnostic = {
      code: 'error.webm.video.incompatible',
      severity: 'error',
      category: 'compatibility',
      message: 'WebM does not support libx264',
      originIds: ['video.encoderId', 'output.containerId'],
      context: { encoderId: 'libx264', containerId: 'webm' },
      sourceRuleId: 'R15.incompatible.combo',
    }
    const fixes = buildFixSuggestions(diag, catalog)
    expect(fixes.length).toBeGreaterThan(0)
    expect(fixes.some((f) => f.id === 'fix.encoder.to.av1')).toBe(true)
  })

  it('suggests burn disable for burn+copy conflict', () => {
    const diag: Diagnostic = {
      code: 'error.burn.requires.encode',
      severity: 'error',
      category: 'configuration',
      message: 'Burn requires encoding',
      originIds: ['subtitle.burn.enabled', 'video.mode'],
      context: {},
    }
    const fixes = buildFixSuggestions(diag, catalog)
    expect(fixes.length).toBeGreaterThanOrEqual(1)
    expect(fixes.some((f) => f.safety === 'safe')).toBe(true)
  })

  it('suggests resolution reset for resolution+copy conflict', () => {
    const diag: Diagnostic = {
      code: 'error.resolution.requires.encode',
      severity: 'error',
      category: 'configuration',
      message: 'Resolution change requires encoding',
      originIds: ['frame.resolution', 'video.mode'],
      context: {},
    }
    const fixes = buildFixSuggestions(diag, catalog)
    expect(fixes.length).toBeGreaterThanOrEqual(1)
  })

  it('returns empty array for unknown diagnostic code', () => {
    const diag: Diagnostic = {
      code: 'unknown.code',
      severity: 'warning',
      category: 'configuration',
      message: 'Unknown',
      originIds: [],
      context: {},
    }
    const fixes = buildFixSuggestions(diag, catalog)
    expect(fixes).toEqual([])
  })

  it('offers fully supported containers for compatibility warnings', () => {
    const diag: Diagnostic = {
      code: 'warn.compat.caveat',
      severity: 'warning',
      category: 'compatibility',
      message: '',
      originIds: ['audio.encoderId', 'output.containerId'],
      context: { encoderId: 'flac', containerId: 'mp4', mediaType: 'audio' },
    }

    const fixes = buildFixSuggestions(diag, catalog)
    expect(fixes.length).toBeGreaterThan(0)
    expect(fixes.every((fix) => fix.operations[0]?.op === 'set')).toBe(true)
  })

  it('fix operations have correct safety levels', () => {
    const diag: Diagnostic = {
      code: 'error.burn.requires.encode',
      severity: 'error',
      category: 'configuration',
      message: '',
      originIds: [],
      context: {},
    }
    const fixes = buildFixSuggestions(diag, catalog)
    for (const fix of fixes) {
      expect(['safe', 'changes-output', 'destructive']).toContain(fix.safety)
    }
  })
})

describe('Diagnostic fix application', () => {
  it('applyFix sets a config value correctly', () => {
    const config = createDefaultProjectConfig()
    const fix: DiagnosticFix = {
      id: 'fix.test',
      label: 'Test',
      description: 'Test fix',
      category: 'compatibility',
      operations: [{ op: 'set', path: CONFIG_PATHS.output.containerId, value: 'mkv' }],
      safety: 'safe',
    }
    const result = applyFix(config, fix, catalog)
    expect(result.success).toBe(true)
    expect(result.newConfig.output.containerId).toBe('mkv')
  })

  it('applyFix rejects illegal path', () => {
    const config = createDefaultProjectConfig()
    const fix: DiagnosticFix = {
      id: 'fix.illegal',
      label: 'Illegal',
      description: 'Should fail',
      category: 'configuration',
      operations: [{ op: 'set', path: '__proto__' as never, value: 'bad' }],
      safety: 'safe',
    }
    const result = applyFix(config, fix, catalog)
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('applyFix rejects path not in whitelist', () => {
    const config = createDefaultProjectConfig()
    const fix: DiagnosticFix = {
      id: 'fix.disallowed',
      label: 'Disallowed',
      description: 'Should fail',
      category: 'configuration',
      operations: [{ op: 'set', path: 'video.preset' as never, value: 'fast' }],
      safety: 'safe',
    }
    const result = applyFix(config, fix, catalog)
    expect(result.success).toBe(false)
  })

  it('applyFix runs normalization after patch', () => {
    const config = createDefaultProjectConfig()
    const fix: DiagnosticFix = {
      id: 'fix.encode',
      label: 'Switch to encode',
      description: '',
      category: 'configuration',
      operations: [{ op: 'set', path: CONFIG_PATHS.video.mode, value: 'encode' }],
      safety: 'safe',
    }
    const result = applyFix(config, fix, catalog)
    expect(result.success).toBe(true)
    // Normalization notices may be empty or populated
    expect(Array.isArray(result.normalizationNotices)).toBe(true)
    // Diagnostics include post-fix validation
    expect(Array.isArray(result.diagnostics)).toBe(true)
  })

  it('applies the safe subtitle burn-in fix offered by the registry', () => {
    const config = createDefaultProjectConfig()
    config.subtitle.burn.enabled = true
    const diagnostic: Diagnostic = {
      code: 'error.burn.requires.encode',
      severity: 'error',
      category: 'configuration',
      message: '',
      originIds: ['subtitle.burn', 'video.mode'],
      context: {},
    }
    const fix = buildFixSuggestions(diagnostic, catalog).find((candidate) => candidate.id === 'fix.burn.disable')

    expect(fix).toBeDefined()
    const result = applyFix(config, fix!, catalog)
    expect(result.success).toBe(true)
    expect(result.newConfig.subtitle.burn.enabled).toBe(false)
  })

  it('isAllowedOperation validates paths', () => {
    expect(isAllowedOperation({ op: 'set', path: 'output.containerId' })).toBe(true)
    expect(isAllowedOperation({ op: 'set', path: 'video.mode' })).toBe(true)
    expect(isAllowedOperation({ op: 'set', path: '__proto__' })).toBe(false)
  })
})
