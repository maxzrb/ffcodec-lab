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
  top: number
  left: number
  width: number
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
  const [panelRect, setPanelRect] = useState<PanelRect>({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  const selectedOption = options.find((opt) => String(opt.value) === value)
  const displayText = selectedOption?.label ?? placeholder ?? ''

  // Compute panel position from trigger bounding rect
  const updatePanelRect = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPanelRect({ top: rect.bottom + 4, left: rect.left, width: rect.width })
  }, [])

  // Update position on scroll / resize
  useEffect(() => {
    if (!open) return
    updatePanelRect()
    window.addEventListener('scroll', updatePanelRect, { passive: true })
    window.addEventListener('resize', updatePanelRect)
    return () => {
      window.removeEventListener('scroll', updatePanelRect)
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
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' })
    }
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
      className="custom-select-panel"
      role="listbox"
      aria-label={ariaLabel}
      style={{
        position: 'fixed',
        top: panelRect.top,
        left: panelRect.left,
        width: panelRect.width,
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
                <span className="custom-select-panel__label">
                  {opt.label}
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
