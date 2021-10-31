import { styleSet } from '../utils/styleOp'
import { multiplication } from '../utils/pixelsCalc'
import Selection from '../selection'
import state from '../state/'
export default class Cursor {
  input = null
  caret = null
  measure = null
  selection = null
  inputState = {
    value: '',
    isComposing: false,
  }
  meta = {
    x: 0,
    y: 0,
    offset: 0,
    range: null,
    selection: null,
    container: null,
    text: null,
  }
  constructor() {
    this.input = document.createElement('input')
    this.caret = document.createElement('span')
    this.measure = document.createElement('span')
    this.initEvent()
    this.input.id = 'custom-input'
    this.caret.id = 'custom-caret'
    this.measure.id = 'custom-measure'
    document.body.appendChild(this.input)
    document.body.appendChild(this.caret)
    document.body.appendChild(this.measure)
    this.selection = new Selection()
  }
  initEvent() {
    this.input.addEventListener('compositionstart', this.handleEvent.bind(this))
    this.input.addEventListener('compositionend', this.handleEvent.bind(this))
    this.input.addEventListener('input', this.handleEvent.bind(this))
  }
  handleEvent(event) {
    console.log(`--->${event.type}: ${event.data}--${event.isComposing}--${event.target.value}\n`)
    if (event.type === 'input') {
      if (!this.inputState.isComposing && event.data) {
        this.meta.text.data = this.meta.text.data.slice(0, this.meta.offset) + event.data + this.meta.text.data.slice(this.meta.offset)
        this.setSysCaret(1)
        this.followSysCaret()
        this.focus()
      } else {
        const preValLen = this.inputState.value.length
        this.inputState.value = event.data || ''
        this.measure.innerText = this.inputState.value
        console.log([this.measure.offsetWidth])
        this.setCustomMeasureSty()
        this.setCaret(this.meta.x + this.measure.offsetWidth, this.meta.y, this.meta.container)
        this.meta.text.data = this.meta.text.data.slice(0, this.meta.offset) + this.inputState.value + this.meta.text.data.slice(this.meta.offset + preValLen)
      }
    } else if (event.type === 'compositionstart') {
      this.inputState.isComposing = true
    } else {
      this.inputState.isComposing = false
      this.setSysCaret(this.inputState.value.length)
      this.followSysCaret()
      this.focus()
    }
  }

  /**
   * @param {*} meta
   * @memberof Cursor
   */
  setPosition(x, y, container) {
    const copyStyle = getComputedStyle(container)
    const lineHeight = multiplication(copyStyle.fontSize, 1.3)
    const styleObj = {
      top: y + 'px',
      left: x + 'px',
      lineHeight,
      fontSize: copyStyle.fontSize,
    }
    const styleObj2 = {
      top: y + 'px',
      left: x + 'px',
      height: lineHeight,
      fontSize: copyStyle.fontSize,
      background: copyStyle.color,
    }
    styleSet(this.input, styleObj)
    styleSet(this.caret, styleObj2)
    console.log(styleObj2)
  }
  // 设置自定义光标位置
  setCaret(x, y, container) {
    const copyStyle = getComputedStyle(container)
    const lineHeight = multiplication(copyStyle.fontSize, 1.3)
    const styleObj = {
      top: y + 'px',
      left: x + 'px',
      height: lineHeight,
      fontSize: copyStyle.fontSize,
      background: copyStyle.color,
    }
    styleSet(this.caret, styleObj)
  }
  //测量中文输入
  setCustomMeasureSty() {
    const { container } = this.meta
    const copyStyle = getComputedStyle(container)
    const lineHeight = multiplication(copyStyle.fontSize, 1.3)
    const styleObj = {
      height: lineHeight,
      fontSize: copyStyle.fontSize,
    }
    styleSet(this.measure, styleObj)
  }
  // 聚焦到模拟输入
  focus() {
    this.input.focus()
  }
  // 自定义光标跟随系统光标
  followSysCaret() {
    this.getMeta()
    const { x, y, container } = this.meta
    this.setPosition(x, y, container)
  }
  // 设置系统光标，设置系统光标位置会使模拟输入框失焦
  setSysCaret(relativeOffset) {
    const { selection, range, text, offset } = this.meta
    range.setStart(text, offset + relativeOffset)
    range.setEnd(text, offset + relativeOffset)
    selection.removeAllRanges()
    selection.addRange(range)
  }
  getMeta() {
    if (this.selection.selection.rangeCount === 0) {
      return this.meta
    }
    const range = this.selection.getRange()
    const text = range.endContainer
    if (text.nodeName !== '#text') {
      return this.meta
    }
    // 相对于 focusTaget 的偏移量
    const offset = range.endOffset
    this.meta.range = range
    this.meta.text = text
    this.meta.offset = offset
    this.meta.selection = this.selection
    this.meta.container = range.endContainer.parentNode
    // 模拟光标 有个bug这里
    const virtualCursor = document.createElement('span')
    const endNode = text.splitText(offset)
    text.parentNode.insertBefore(endNode, text.nextSibling)
    text.parentNode.insertBefore(virtualCursor, endNode)
    const { offsetLeft: x, offsetTop: y } = virtualCursor
    this.meta.x = x
    this.meta.y = y
    text.parentNode.removeChild(virtualCursor)
    // 修复行首选区丢失的bug
    offset && text.parentNode.normalize()
    return this.meta
  }
}
