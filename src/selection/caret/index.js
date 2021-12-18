import { setStyle, multiplication } from '../../utils'
import Measure from '../measure'
const defaultStyle = {}
export default class Caret {
  dom = null
  rect = null
  constructor() {
    this.measure = new Measure()
    this.dom = document.createElement('span')
    this.dom.classList.add('custom-caret')
    this.setStyle(this.dom)
  }
  setStyle(style = {}) {
    const mergeStyle = Object.assign({}, defaultStyle, style)
    setStyle(this.dom, mergeStyle)
  }
  update(range) {
    range.vm.ui.root.appendChild(this.dom)
    let container = range.startContainer
    this.rect = this.measure.measure(range)
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
      display: range.vm.selection.caretStatus ? 'inline-block' : 'none',
    }
    this.setStyle(caretStyle)
  }
}
