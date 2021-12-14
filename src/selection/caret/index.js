import {setStyle,multiplication} from '../../utils'
import Measure from '../measure'
const defaultStyle = {
  top: '-100px',
  left: 0,
  position: 'absolute',
  width: '2px',
  background: 'transparent',
  border: 'none',
  padding: 0,
}
export default class Caret {
  dom = null
  constructor() {
    this.dom = document.createElement('span')
    this.setStyle(this.dom)
  }
  setStyle(style = {}) {
    const mergeStyle = Object.assign({}, defaultStyle, style)
    setStyle(this.dom, mergeStyle)
  }
  update(range) {
    range.vm.root.appendChild(this.dom)
    let container = range.startContainer
    const rect = new Measure().measure(range)
    if (!container) return
    if (!(container instanceof Element)) {
      container = container.parentNode
    }
    const copyStyle = getComputedStyle(container)
    const height = multiplication(copyStyle.fontSize, 1.3)
    const caretStyle = {
      top: rect.y + 'px',
      left: rect.x + 'px',
      height: height,
      fontSize: copyStyle.fontSize,
      background: copyStyle.color,
    }
    this.setStyle(caretStyle)
  }
}
