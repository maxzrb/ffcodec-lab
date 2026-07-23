import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Dropdown } from '@ffcodec/workbench'

describe('Dropdown scroll behavior', () => {
  it('鼠标悬停滚动后的选项不会把面板拉回其他位置', async () => {
    render(
      <Dropdown
        value="0"
        options={Array.from({ length: 30 }, (_, index) => ({ value: String(index), label: `Option ${index}` }))}
        onChange={() => undefined}
        ariaLabel="Long options"
      />,
    )

    await userEvent.click(screen.getByLabelText('Long options'))
    const panel = document.querySelector('.custom-select-panel') as HTMLDivElement
    const hoveredOption = panel.querySelector('[data-value="20"]') as HTMLButtonElement
    panel.scrollTop = 200
    panel.getBoundingClientRect = () => ({ top: 0, bottom: 100, left: 0, right: 200, width: 200, height: 100, x: 0, y: 0, toJSON: () => ({}) })
    hoveredOption.getBoundingClientRect = () => ({ top: 200, bottom: 220, left: 0, right: 200, width: 200, height: 20, x: 0, y: 200, toJSON: () => ({}) })

    await act(async () => {
      fireEvent.mouseEnter(hoveredOption)
    })

    expect(panel.scrollTop).toBe(200)
  })
})
