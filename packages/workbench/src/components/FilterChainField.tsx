// ============================================================
// FilterChainField — 自定义滤镜的可编辑单列表格。
// 替代旧 textarea，每行一个滤镜表达式，支持添加/删除/移动。
// ============================================================

import { useCallback } from 'react'

export interface FilterChainFieldProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled: boolean
  id?: string
}

export function FilterChainField({ value, onChange, disabled, id }: FilterChainFieldProps) {
  const rows: string[] = value.length > 0 ? value : ['']

  const updateRow = useCallback((index: number, text: string) => {
    const next = [...rows]
    next[index] = text
    // 过滤掉所有空行（保留至少一行为空数组）
    const filtered = next.filter((s) => s.trim() !== '')
    onChange(filtered)
  }, [rows, onChange])

  const moveUp = useCallback((index: number) => {
    if (index === 0) return
    const next = [...rows]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    onChange(next.filter((s) => s.trim() !== ''))
  }, [rows, onChange])

  const moveDown = useCallback((index: number) => {
    if (index >= rows.length - 1) return
    const next = [...rows]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    onChange(next.filter((s) => s.trim() !== ''))
  }, [rows, onChange])

  const removeRow = useCallback((index: number) => {
    const next = rows.filter((_, i) => i !== index)
    onChange(next.filter((s) => s.trim() !== ''))
  }, [rows, onChange])

  const addRow = useCallback(() => {
    onChange([...rows, ''])
  }, [rows, onChange])

  return (
    <div className="filter-chain-table" id={id}>
      {rows.map((rowText, index) => {
        const isFirst = index === 0
        const isLast = index === rows.length - 1

        return (
          <div className="filter-chain-row" key={index}>
            <input
              type="text"
              className="filter-chain-row__input"
              id={index === 0 ? id : undefined}
              value={rowText}
              onChange={(e) => updateRow(index, e.target.value)}
              disabled={disabled}
              placeholder="滤镜表达式，如 crop=1920:1080"
              spellCheck={false}
            />
            <div className="filter-chain-row__buttons">
              {!isFirst && (
                <button
                  type="button"
                  className="filter-chain-row__btn"
                  onClick={() => moveUp(index)}
                  disabled={disabled}
                  title="上移"
                  aria-label="上移"
                >
                  ▲
                </button>
              )}
              {!isLast && (
                <button
                  type="button"
                  className="filter-chain-row__btn"
                  onClick={() => moveDown(index)}
                  disabled={disabled}
                  title="下移"
                  aria-label="下移"
                >
                  ▼
                </button>
              )}
              <button
                type="button"
                className="filter-chain-row__btn filter-chain-row__btn--delete"
                onClick={() => removeRow(index)}
                disabled={disabled}
                title="删除"
                aria-label="删除"
              >
                ✕
              </button>
            </div>
          </div>
        )
      })}
      <button
        type="button"
        className="filter-chain-add"
        onClick={addRow}
        disabled={disabled}
      >
        + 添加滤镜
      </button>
    </div>
  )
}
