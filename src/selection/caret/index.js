import { setStyle, multiplication } from '../../utils'
import Measure from '../measure'
const defaultStyle = {}
export default class Caret {
  dom = null
  rect = null
  constructor(range) {
    this.range = range
    this.measure = new Measure()
    this.dom = document.createElement('span')
    this.dom.classList.add('custom-caret')
    this.setStyle(this.dom)
  }
  setStyle(style = {}) {
    const mergeStyle = Object.assign({}, defaultStyle, style)
    setStyle(this.dom, mergeStyle)
  }
  remove() {
    this.dom.remove()
  }
  getRect(range) {
    let container, offset
    switch (range._d) {
      case 0:
      case 1:
        container = range.startContainer
        offset = range.startOffset
        break
      case 2:
        container = range.endContainer
        offset = range.endOffset
        break
    }
    return this.measure.measure(container, offset)
  }
  update(range, drawCaret = true) {
    this.rect = this.getRect(range)
    if (!drawCaret) return
    range.vm.ui.root.appendChild(this.dom)
    let container = range.startContainer
    if (!container) return
    if (!(container instanceof Element)) {
      container = container.parentNode
    }
    const copyStyle = getComputedStyle(container)
    const height = multiplication(copyStyle.fontSize, 1.3)
    const caretStyle = {
      top: this.rect.y + 'px',
      left: this.rect.x + 'px',
      height: height,
      fontSize: copyStyle.fontSize,
      background: copyStyle.color,
      display: range.collapsed ? 'inline-block' : 'none',
    }
    this.setStyle(caretStyle)
  }
}
