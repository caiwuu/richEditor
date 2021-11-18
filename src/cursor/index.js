import { styleSet } from '../utils/index'
import { multiplication } from '../utils/index'
import Selection from '../selection'
import action from '../actions'
export default class Cursor {
  vm = null
  root = null
  isShow = true // 显示状态
  input = null // 虚拟输入框
  caret = null // 虚拟光标
  selection = null // 光标所处选区
  caretMarker = null // 系统光标标记
  inputState = {
    // 输入框状态
    value: '',
    isComposing: false,
  }
  // 光标元信息
  meta = {
    x: 0,
    y: 0,
    start: 0,
    end: 0,
    range: null,
  }
  constructor(vm) {
    this.vm = vm
    this.input = document.createElement('input')
    this.caret = document.createElement('span')
    this.caretMarker = document.createElement('span')
    this.initEvent()
    this.input.id = 'custom-input'
    this.caret.id = 'custom-caret'
    this.vm.root.appendChild(this.input)
    this.vm.root.appendChild(this.caret)
    this.selection = new Selection()
  }
  initEvent() {
    this.input.addEventListener('compositionstart', this.handleEvent.bind(this))
    this.input.addEventListener('compositionend', this.handleEvent.bind(this))
    this.input.addEventListener('input', this.handleEvent.bind(this))
  }
  handleEvent(event) {
    console.log(`--->${event.type}: ${event.data}--${event.isComposing}--${event.target.value}\n`)
    // console.log(this.meta.range);
    // selected时释放掉一次输入，因为不能调起中文输入法 折中做法 暂时没有好的解决办法
    if (!this.meta.range.collapsed) {
      console.log(this.meta.range.startOffset, this.meta.range.endOffset)
      this.meta.range.collapse(true)
      this.followSysCaret()
      console.log(this.meta.range.endOffset)
    } else if (event.type === 'input') {
      // 键盘字符输入
      if (!this.inputState.isComposing && event.data) {
        const inputData = event.data === ' ' ? '\u00A0' : event.data
        // mvc
        action.emit('input', { vm: this.vm, inputData })
      } else {
        // 聚合输入， 非键盘输入，如中文输入，ui变化但不会同步vnode
        this.inputState.value = event.data || ''
        this.meta.range.endContainer.data = this.meta.range.endContainer.data.slice(0, this.meta.end) + this.inputState.value
        const { offsetLeft: x, offsetTop: y } = this.caretMarker
        this.setCaret(x, y, this.meta.range.endContainer.parentNode)
      }
    } else if (event.type === 'compositionstart') {
      // 开始聚合输入 插入光标标记dom
      this.inputState.isComposing = true
      const endContainer = this.meta.range.endContainer
      const endNode = endContainer.splitText(this.meta.end)
      endContainer.parentNode.insertBefore(endNode, endContainer.nextSibling)
      endContainer.parentNode.insertBefore(this.caretMarker, endNode)
    } else if (event.type === 'compositionend') {
      // 结束聚合输入 删除光标标记dom，执行输入同步vnode
      this.inputState.isComposing = false
      this.caretMarker.remove()
      this.meta.end && this.meta.range.endContainer.parentNode.normalize()
      action.emit('input', { vm: this.vm, inputData: event.data })
      // 等待dom更新
      setTimeout(() => {
        event.target.value = ''
        this.inputState.value = ''
      })
    }
  }
  setPosition(x, y, parentNode) {
    if (!parentNode) return
    const copyStyle = getComputedStyle(parentNode)
    const lineHeight = multiplication(copyStyle.fontSize, 1.3)
    const inputStyle = {
      top: y + 'px',
      left: x + 'px',
      lineHeight,
      fontSize: copyStyle.fontSize,
    }
    const caretStyle = {
      top: y + 'px',
      left: x + 'px',
      height: lineHeight,
      fontSize: copyStyle.fontSize,
      background: copyStyle.color,
    }
    styleSet(this.input, inputStyle)
    styleSet(this.caret, caretStyle)
  }
  // 设置自定义光标位置
  setCaret(x, y, parentNode) {
    const copyStyle = getComputedStyle(parentNode)
    const lineHeight = multiplication(copyStyle.fontSize, 1.3)
    const caretStyle = {
      top: y + 'px',
      left: x + 'px',
      height: lineHeight,
      fontSize: copyStyle.fontSize,
      background: copyStyle.color,
    }
    styleSet(this.caret, caretStyle)
  }
  // 聚焦到模拟输入
  focus() {
    this.input.focus()
    this.show()
  }
  // 自定义光标跟随系统光标
  followSysCaret() {
    // console.trace()
    this.getMeta()
    const { x, y, range } = this.meta
    this.setPosition(x, y, range.endContainer.parentNode)
  }
  // 设置系统光标，设置系统光标位置会使模拟输入框失焦
  setSysCaret(offset, relative = true) {
    const { selection, range, end } = this.meta
    const newOffset = relative ? end + offset : offset
    range.setStart(range.endContainer, newOffset)
    range.setEnd(range.endContainer, newOffset)
    selection.removeAllRanges()
    selection.addRange(range)
  }
  getMeta() {
    if (this.selection.selection.rangeCount === 0) {
      return this.meta
    }
    const range = this.selection.getRange()
    const endContainer = range.endContainer
    // if (endContainer.nodeName !== '#text' && endContainer.nodeName !== 'P' && endContainer.nodeName !== 'DIV') {
    if (endContainer.nodeName !== '#text' && endContainer.nodeName !== 'P') {
      return this.meta
    }

    const end = range.endOffset
    this.meta.range = range
    this.meta.end = end
    this.meta.start = range.startOffset
    this.meta.selection = this.selection
    if (endContainer.nodeName !== '#text') {
      if (endContainer.hasChildNodes()) {
        range.setStart(endContainer.childNodes[0], 0)
        range.setEnd(endContainer.childNodes[0], 0)
        selection.removeAllRanges()
        selection.addRange(range)
        this.getMeta()
        return
      }
    } else {
      const endNode = endContainer.splitText(end)
      console.log(endNode, endContainer, endContainer.nextSibling)
      console.log(endContainer.parentNode.childNodes)
      endContainer.parentNode.insertBefore(endNode, endContainer.nextSibling)
      endContainer.parentNode.insertBefore(this.caretMarker, endNode)
    }
    const { offsetLeft: x, offsetTop: y } = this.caretMarker
    this.meta.x = x
    this.meta.y = y
    // endContainer.parentNode.removeChild(this.caretMarker)
    this.caretMarker.remove()
    // 修复行首选区丢失的bug
    console.log('normalize', end)
    end && endContainer.parentNode.normalize()
  }
  show() {
    this.caret.style.display = 'inline-block'
    this.isShow = true
  }
  hidden() {
    this.caret.style.display = 'none'
    this.isShow = false
  }
  removeAllRanges() {
    this.selection && this.selection.removeAllRanges()
  }
}
