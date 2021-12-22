import Range from './range'
import Input from './input'
export default class Selection {
  nativeSelection = document.getSelection()
  ranges = []
  caretStatus = true
  mouseStatus = 'up'
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
  move(direction, drawCaret = true) {
    if (!this.caretStatus) return
    this.ranges.forEach((range) => {
      range[direction]()
      drawCaret && range.updateCaret()
    })
    this.distinct()
    this.input.focus()
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
    if (event.shiftKey) {
      this.caretStatus = false
    } else {
      this.caretStatus = true
      const count = this.nativeSelection.rangeCount
      for (let i = 0; i < count; i++) {
        const nativeRange = this.nativeSelection.getRangeAt(i)
        nativeRange.collapse(true)
      }
      this.updateRanges(event.altKey)
    }
  }
  _handMouseup(event) {
    this.mouseStatus = 'up'
    // 有选区
    if (!this.nativeSelection.isCollapsed || event.shiftKey) {
      this.caretStatus = false
      this.updateRanges(event.altKey)
    } else {
      console.log('ss')
      this.input.focus()
    }
    console.log(this.ranges)
  }
  del() {
    this.ranges.forEach((range) => {
      range.del()
      range.updateCaret()
    })
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
      case 'ArrowUp':
        event.preventDefault()
        this.move('up', false)
        break
      case 'ArrowDown':
        event.preventDefault()
        this.move('down', false)
        break
      case 'Backspace':
        event.preventDefault()
        this.del()
    }
  }
}
