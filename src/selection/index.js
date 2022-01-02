import Range from './range'
import Input from './input'
import exec from '../operation'
export default class Selection {
  nativeSelection = document.getSelection()
  ranges = []
  constructor(vm) {
    this.vm = vm
    this.input = new Input(this)
    this._addListeners()
  }
  getCount() {
    return this.ranges.length
  }
  _resetRanges() {
    this.clearRanges()
    const count = this.nativeSelection.rangeCount
    for (let i = 0; i < count; i++) {
      const nativeRange = this.nativeSelection.getRangeAt(i)
      this.pushRange(nativeRange)
    }
  }
  getRangeAt(index = 0) {
    return this.ranges[index]
  }
  removeAllRanges() {
    this.nativeSelection.removeAllRanges()
    this.clearRanges()
  }
  clearRanges() {
    while (this.ranges.length) {
      const range = this.ranges.pop()
      range.caret.remove()
    }
  }
  // 多选区支持
  _extendRanges() {
    const count = this.nativeSelection.rangeCount
    if (count > 0) {
      const nativeRange = this.nativeSelection.getRangeAt(count - 1)
      let flag = false
      this.ranges.forEach((i) => {
        if (i.endContainer === nativeRange.endContainer && i.startOffset === nativeRange.startOffset) {
          flag = true
          i.remove()
        }
      })
      if (flag) return
      this.pushRange(nativeRange)
    }
  }
  createRange({ startContainer, startOffset, endContainer, endOffset }) {
    const range = document.createRange()
    range.setStart(startContainer, startOffset)
    range.setEnd(endContainer, endOffset)
    return range
  }
  pushRange(nativeRange) {
    const cloneRange = new Range(nativeRange.cloneRange(), this.vm)
    if (nativeRange.collapsed) {
      cloneRange._d = 0
    } else if (this.nativeSelection.focusNode === nativeRange.endContainer && this.nativeSelection.focusOffset === nativeRange.endOffset) {
      cloneRange._d = 2
    } else {
      cloneRange._d = 1
    }
    this.ranges.push(cloneRange)
  }
  // 注意chrome不支持多选区,需要在此之前调用 removeAllRanges
  addRange(nativeRange) {
    this.nativeSelection.addRange(nativeRange)
    this.pushRange(nativeRange)
  }
  collapse(parentNode, offset) {
    this.nativeSelection.collapse(parentNode, offset)
    this._resetRanges()
  }
  updateRanges(multiple) {
    // 选区的创建结果需要在宏任务中获取.
    setTimeout(() => {
      if (multiple) {
        this._extendRanges()
      } else {
        this._resetRanges()
      }
      this.ranges.forEach((range) => range.updateCaret())
    })
  }
  // 高性能去除重;
  distinct() {
    let tempObj = {}
    let len = this.ranges.length
    for (let index = 0; index < len; index++) {
      const range = this.ranges[index]
      const key = range.startContainer.vnode.position + range.caret.rect.x + range.caret.rect.y
      if (!tempObj[key]) {
        tempObj[key] = range
      } else {
        range.caret.remove()
        this.ranges.splice(index, 1)
        len--
        index--
      }
    }
    tempObj = null
  }
  _setNativeRange() {
    const currRange = this.ranges[0]
    this.nativeSelection.removeAllRanges()
    this.nativeSelection.addRange(currRange)
  }
  move(direction, drawCaret = true, shiftKey) {
    // 支持多光标但是目前还不支持多选区；这里取消掉其他光标
    if (shiftKey) {
      while (this.ranges.length > 1) {
        this.ranges.pop().caret.remove()
      }
    }
    const nativeRange = this.nativeSelection.getRangeAt(0)
    this.ranges.forEach((range) => {
      // 没按shift 并且 存在选区,取消选区，左右不移动光标，上下可移动光标
      if (!shiftKey && !range.collapsed) {
        const collapseToStart = range._d === 1
        nativeRange.collapse(collapseToStart)
        range.collapse(collapseToStart)
        range._d = 0
        range.updateCaret()
        if (direction === 'up' || direction === 'down') {
          range[direction](shiftKey)
          drawCaret && range.updateCaret()
        }
      } else {
        if (range.collapsed) {
          range._d = 0
        }
        range[direction](shiftKey)
        drawCaret && range.updateCaret()
      }
    })
    this.distinct()
    this.input.focus()
    if (shiftKey) {
      this._setNativeRange(direction)
    }
  }
  del() {
    this.vm.command.delete()
    this.distinct()
    console.log(this.ranges)
  }
  destroy() {
    this.input.destroy()
    this.vm.ui.editorContainer.removeEventListener('mouseup', this._handMouseup.bind(this))
    this.vm.ui.editorContainer.removeEventListener('mousedown', this._handMousedown.bind(this))
  }
  _addListeners() {
    this.vm.ui.editorContainer.addEventListener('mouseup', this._handMouseup.bind(this))
    this.vm.ui.editorContainer.addEventListener('mousedown', this._handMousedown.bind(this))
  }
  _handMousedown(event) {
    if (!event.shiftKey) {
      const count = this.nativeSelection.rangeCount
      for (let i = 0; i < count; i++) {
        const nativeRange = this.nativeSelection.getRangeAt(i)
        nativeRange.collapse(true)
      }
      this.updateRanges(event.altKey)
    }
  }
  _handMouseup(event) {
    // 有选区
    if (!this.nativeSelection.isCollapsed || event.shiftKey) {
      this.updateRanges(event.altKey)
    }
    this.input.focus()
  }
}
