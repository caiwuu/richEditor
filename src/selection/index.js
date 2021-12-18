import Range from './range'
import { throttle } from '../utils'
export default class Selection {
  nativeSelection = document.getSelection()
  ranges = []
  caretStatus = true
  mouseStatus = 'up'
  constructor(vm) {
    this.vm = vm
    this._addListeners()
  }
  getCount() {
    return this.ranges.length
  }
  _resetRanges() {
    this.clearRanges()
    const count = this.nativeSelection.rangeCount
    // console.log(count)
    for (let i = 0; i < count; i++) {
      const nativeRange = this.nativeSelection.getRangeAt(i)
      this.ranges.push(new Range(nativeRange.cloneRange(), this.vm))
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
      range.caret.dom.remove()
    }
  }
  // 多选区支持
  _extendRanges() {
    const count = this.nativeSelection.rangeCount
    for (let i = 0; i < count; i++) {
      const nativeRange = this.nativeSelection.getRangeAt(i)
      this.ranges.push(new Range(nativeRange.cloneRange(), this.vm))
    }
  }
  // 注意chrome不支持多选区,需要在此之前调用 removeAllRanges
  addRange(nativeRange) {
    this.nativeSelection.addRange(nativeRange)
    this.ranges.push(new Range(nativeRange.cloneRange(), this.vm))
  }
  collapse(parentNode, offset) {
    this.nativeSelection.collapse(parentNode, offset)
    this._resetRanges()
  }
  updateRanges(multiple) {
    // 选区的创建结果需要在宏任务中获取
    setTimeout(() => {
      if (multiple) {
        this._extendRanges()
      } else {
        this._resetRanges()
      }
      this.ranges.forEach((range) => range.updateCaret())
    })
  }
  move(direction) {
    if (!this.caretStatus) return
    this.ranges.forEach((range) => {
      range[direction]()
      range.updateCaret()
    })
  }
  destroy() {
    this.vm.ui.editorContainer.removeEventListener('mouseup', this._handMouseup.bind(this))
    this.vm.ui.editorContainer.removeEventListener('mousedown', this._handMousedown.bind(this))
    document.removeEventListener('keydown', this._handGolobalKeydown.bind(this))
    this.vm.ui.editorContainer.removeEventListener('mousemove', this._handMousemove.bind(this))
  }
  _addListeners() {
    this.vm.ui.editorContainer.addEventListener('mouseup', this._handMouseup.bind(this))
    this.vm.ui.editorContainer.addEventListener('mousedown', this._handMousedown.bind(this))
    document.addEventListener('keydown', this._handGolobalKeydown.bind(this))
    this.vm.ui.editorContainer.addEventListener('mousemove', this._handMousemove.bind(this))
  }
  _handMousemove() {
    if (this.mouseStatus === 'up') return
    if (!this.nativeSelection.isCollapsed && this.caretStatus) {
      this.caretStatus = false
      this.updateRanges()
    } else if (this.nativeSelection.isCollapsed && !this.caretStatus) {
      this.caretStatus = true
      this.updateRanges()
    }
  }
  _handMousedown(event) {
    this.mouseStatus = 'down'
    this.caretStatus = true
    const count = this.nativeSelection.rangeCount
    for (let i = 0; i < count; i++) {
      const nativeRange = this.nativeSelection.getRangeAt(i)
      nativeRange.collapse(true)
    }
    this.updateRanges(event.altKey)
  }
  _handMouseup(event) {
    this.mouseStatus = 'up'
    if (!this.nativeSelection.isCollapsed) {
      this.caretStatus = false
      this.updateRanges(event.altKey)
    }
  }
  _handGolobalKeydown(event) {
    const key = event.key
    switch (key) {
      case 'ArrowRight':
        this.move('right')
        break
      case 'ArrowLeft':
        this.move('left')
        break
    }
  }
}
