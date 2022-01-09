import { setStyle } from '../utils/index'
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
    log(`--->${event.type}: ${event.data}--${event.isComposing}--${event.target.value}\n`)
    // selected时释放掉一次输入，因为不能调起中文输入法 折中做法 暂时没有好的解决办法
    if (!this.meta.range.collapsed) {
      action.emit('del', this.vm)
      this.meta.range.collapse(true)
    } else if (event.type === 'input') {
      // 键盘字符输入
      log('键盘字符输入')
      if (!this.inputState.isComposing && event.data) {
        const inputData = event.data === ' ' ? '\u00A0' : event.data
        // mvc
        action.emit('input', { vm: this.vm, inputData })
      } else {
        // 聚合输入， 非键盘输入，如中文输入，ui变化但不会同步vnode
        this.inputState.value = event.data || ''
        this.meta.range.endContainer.data = this.meta.range.endContainer.data.slice(0, this.meta.end) + this.inputState.value
        const { offsetLeft: x, offsetTop: y } = this.caretMarker
        this.setCaret(x, y, this.meta.range.endContainer)
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
      if (!this.meta.range.end) {
        this.meta.range.endContainer.data = this.meta.range.endContainer.nextSibling.data
        this.meta.range.endContainer.nextSibling.data = ''
      } else {
        this.meta.range.endContainer.parentNode.normalize()
      }

      action.emit('input', { vm: this.vm, inputData: event.data })
      // 等待dom更新
      setTimeout(() => {
        event.target.value = ''
        this.inputState.value = ''
      })
    }
  }
  // 设置自定义光标位置
  setCaret(x, y, container) {
    if (!container) return
    if (!(container instanceof Element)) {
      container = container.parentNode
    }
    const copyStyle = getComputedStyle(container)
    const height = multiplication(copyStyle.fontSize, 1.3)
    const caretStyle = {
      top: y + 'px',
      left: x + 'px',
      height: height,
      fontSize: copyStyle.fontSize,
      background: copyStyle.color,
    }
    setStyle(this.input, caretStyle)
    setStyle(this.caret, caretStyle)
  }
  // 聚焦到模拟输入
  focus() {
    this.input.focus()
    this.show()
    // 恢复滚动条
    document.documentElement.scrollTop = this.vm.scrollTop
    document.body.scrollTop = this.vm.scrollTop
  }
  // 自定义光标跟随系统光标
  followSysCaret() {
    this.updateMeta()
    const { x, y, range } = this.meta
    range && this.setCaret(x, y, range.endContainer)
  }
  updateMeta() {
    if (this.selection.selection.rangeCount === 0) {
      return this.meta
    }
    const range = this.selection.getRange()
    this.meta.range = range
    this.meta.end = range.endOffset
    this.meta.start = range.startOffset
    this.meta.selection = this.selection
    // 点击图片中间阻止执行
    if (!range.endContainer.vnode) return
    const { tag, dom } = range.endContainer.vnode
    // 处理光标在img和br之间的游走
    if (tag === 'text') {
      dom.parentNode.insertBefore(this.caretMarker, dom.splitText(range.endOffset))
    } else {
      if (range.endContainer.vnode.childrens[range.endOffset]) {
        dom.insertBefore(this.caretMarker, dom.childNodes[range.endOffset])
      } else {
        dom.appendChild(this.caretMarker)
      }
    }
    const { offsetLeft: x, offsetTop: y } = this.caretMarker
    this.meta.x = x
    this.meta.y = y
    this.caretMarker.remove()
    // normalize 非空合并内容到首节点，而空节点会直接删除，我们需要始终保持首节点的引用，故end为0时交互数据
    // 在首节点内容为空时，首位都是空节点，用normalize会全删，故只需手动删除首节点后一个节点即可
    if (tag === 'text') {
      if (!range.endOffset && range.endContainer.nextSibling) {
        range.endContainer.data = range.endContainer.nextSibling.data
        range.endContainer.nextSibling.data = ''
      }
      if (!this.meta.range.endContainer.vnode.context && range.endContainer.nextSibling) {
        range.endContainer.nextSibling.remove()
      } else {
        dom.parentNode.normalize()
      }
    }
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
