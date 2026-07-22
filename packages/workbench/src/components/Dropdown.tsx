// ============================================================
// Dropdown — custom select replacement with frosted glass popup.
// Replaces native <select> so the options panel can use
// backdrop-filter blur (毛玻璃 / frosted glass).
// Panel is rendered via Portal to document.body to avoid
// parent overflow:hidden clipping.
// ============================================================

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'

export interface DropdownOption {
  value: string | number
  label: string
  description?: string
  group?: string
  badge?: string
}

interface DropdownProps {
  id?: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  ariaLabel?: string
  placeholder?: string
}

interface PanelRect {
  top?: number
  bottom?: number
  left: number
  width: number
  maxHeight: number
  placement: 'top' | 'bottom'
}

export function Dropdown({
  id,
  value,
  options,
  onChange,
  disabled = false,
  className = '',
  ariaLabel,
  placeholder,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [focusIndex, setFocusIndex] = useState(-1)
  const [panelRect, setPanelRect] = useState<PanelRect>({ top: 0, left: 0, width: 0, maxHeight: 260, placement: 'bottom' })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  const selectedOption = options.find((opt) => String(opt.value) === value)
  const displayText = selectedOption?.label ?? placeholder ?? ''

  // Compute panel position from trigger bounding rect
  const updatePanelRect = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const viewportPadding = 8
    const gap = 4
    const availableBelow = Math.max(0, window.innerHeight - rect.bottom - viewportPadding - gap)
    const availableAbove = Math.max(0, rect.top - viewportPadding - gap)
    const placement = availableBelow >= Math.min(180, availableAbove) || availableBelow >= availableAbove ? 'bottom' : 'top'
    const available = placement === 'bottom' ? availableBelow : availableAbove
    const width = Math.min(rect.width, window.innerWidth - viewportPadding * 2)
    const left = Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - viewportPadding - width))
    setPanelRect({
      top: placement === 'bottom' ? rect.bottom + gap : undefined,
      bottom: placement === 'top' ? window.innerHeight - rect.top + gap : undefined,
      left,
      width,
      maxHeight: Math.max(96, Math.min(260, available)),
      placement,
    })
  }, [])

  // Update position on scroll / resize
  useEffect(() => {
    if (!open) return
    updatePanelRect()
    const handleAncestorScroll = (event: Event) => {
      const target = event.target
      if (target instanceof Node && panelRef.current?.contains(target)) return
      updatePanelRect()
    }
    window.addEventListener('scroll', handleAncestorScroll, { passive: true, capture: true })
    window.addEventListener('resize', updatePanelRect)
    return () => {
      window.removeEventListener('scroll', handleAncestorScroll, true)
      window.removeEventListener('resize', updatePanelRect)
    }
  }, [open, updatePanelRect])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Focus selected option when opening
  useEffect(() => {
    if (open) {
      const idx = options.findIndex((opt) => String(opt.value) === value)
      setFocusIndex(idx >= 0 ? idx : 0)
    }
  }, [open, options, value])

  // Scroll focused option into view
  useEffect(() => {
    if (!open || focusIndex < 0) return
    const el = optionRefs.current.get(focusIndex)
    const panel = panelRef.current
    if (!el || !panel) return
    const optionRect = el.getBoundingClientRect()
    const panelRect = panel.getBoundingClientRect()
    if (optionRect.top < panelRect.top) panel.scrollTop -= panelRect.top - optionRect.top
    else if (optionRect.bottom > panelRect.bottom) panel.scrollTop += optionRect.bottom - panelRect.bottom
  }, [open, focusIndex])

  const selectOption = useCallback(
    (optValue: string) => {
      onChange(optValue)
      setOpen(false)
      triggerRef.current?.focus()
    },
    [onChange],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (!open) {
            updatePanelRect()
            setOpen(true)
          } else if (focusIndex >= 0) {
            const opt = options[focusIndex]
            if (opt) selectOption(String(opt.value))
          }
          break
        case 'ArrowDown':
          event.preventDefault()
          if (!open) {
            updatePanelRect()
            setOpen(true)
          } else {
            setFocusIndex((prev) => {
              const next = prev + 1
              return next >= options.length ? 0 : next
            })
          }
          break
        case 'ArrowUp':
          event.preventDefault()
          if (open) {
            setFocusIndex((prev) => {
              const next = prev - 1
              return next < 0 ? options.length - 1 : next
            })
          }
          break
        case 'Escape':
          event.preventDefault()
          setOpen(false)
          triggerRef.current?.focus()
          break
        case 'Tab':
          setOpen(false)
          break
      }
    },
    [open, focusIndex, options, selectOption, updatePanelRect],
  )

  // Group options by group label
  const grouped = groupOptions(options)

  const triggerClasses = [
    'custom-select',
    open ? 'custom-select--open' : '',
    disabled ? 'custom-select--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const panelElement = open && (
    <div
      ref={panelRef}
      className={`custom-select-panel custom-select-panel--${panelRect.placement}`}
      role="listbox"
      aria-label={ariaLabel}
      style={{
        position: 'fixed',
        top: panelRect.top,
        bottom: panelRect.bottom,
        left: panelRect.left,
        width: panelRect.width,
        maxHeight: panelRect.maxHeight,
        zIndex: 200,
      }}
    >
      {grouped.map((group, groupIdx) => (
        <div key={group.label ?? `__nogroup_${groupIdx}`} className="custom-select-panel__group">
          {group.label && (
            <div className="custom-select-panel__group-label">{group.label}</div>
          )}
          {group.options.map((opt) => {
            const optIndex = options.indexOf(opt)
            const isSelected = String(opt.value) === value
            const isFocused = optIndex === focusIndex
            return (
              <button
                key={String(opt.value)}
                ref={(el) => {
                  if (el) optionRefs.current.set(optIndex, el)
                  else optionRefs.current.delete(optIndex)
                }}
                type="button"
                data-value={String(opt.value)}
                className={`custom-select-panel__option ${
                  isSelected ? 'custom-select-panel__option--selected' : ''
                } ${isFocused ? 'custom-select-panel__option--focused' : ''}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => selectOption(String(opt.value))}
                onMouseEnter={() => setFocusIndex(optIndex)}
              >
                <span className="custom-select-panel__label" title={opt.label}>
                  <span className="custom-select-panel__label-text">{opt.label}</span>
                  {opt.badge && <span className="custom-select__badge">{opt.badge}</span>}
                </span>
                {opt.description && (
                  <span className="custom-select-panel__desc">{opt.description}</span>
                )}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )

  return (
    <div className="custom-select-wrapper">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={triggerClasses}
        onClick={() => {
          if (disabled) return
          if (!open) updatePanelRect()
          setOpen((prev) => !prev)
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
      >
        <span className="custom-select__text">
          {selectedOption?.badge ? (
            <>
              {selectedOption.label}
              <span className="custom-select__badge">{selectedOption.badge}</span>
            </>
          ) : (
            displayText
          )}
        </span>
        <span className="custom-select__chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {panelElement && createPortal(panelElement, document.body)}
    </div>
  )
}

function groupOptions(
  options: DropdownOption[],
): { label?: string; options: DropdownOption[] }[] {
  const groups: { label?: string; options: DropdownOption[] }[] = []
  let currentGroup: { label?: string; options: DropdownOption[] } | null = null

  for (const opt of options) {
    if (opt.group) {
      if (!currentGroup || currentGroup.label !== opt.group) {
        currentGroup = { label: opt.group, options: [] }
        groups.push(currentGroup)
      }
    } else {
      if (!currentGroup || currentGroup.label !== undefined) {
        currentGroup = { label: undefined, options: [] }
        groups.push(currentGroup)
      }
    }
    currentGroup!.options.push(opt)
  }
  return groups
}
