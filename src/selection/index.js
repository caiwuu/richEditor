import Range from './range'
import { throttle } from '../utils'
export default class Selection {
  nativeSelection = document.getSelection()
  ranges = []
  caretStatus = true
  constructor(vm) {
    this.vm = vm
    this.addListeners()
  }
  getCount() {
    return this.ranges.length
  }
  resetRanges() {
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
      range.caret.dom.remove()
    }
  }
  // 多选区支持
  extendRanges() {
    const count = this.nativeSelection.rangeCount
    console.log(count)
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
    this.resetRanges()
  }
  updateRanges(multiple) {
    // 选区的创建结果需要在宏任务中获取
    setTimeout(() => {
      if (multiple) {
        this.extendRanges()
      } else {
        this.resetRanges()
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
    console.log(this.ranges)
  }
  destroy() {
    this.vm.ui.editorContainer.removeEventListener('mouseup', this.handMouseup.bind(this))
    this.vm.ui.editorContainer.removeEventListener('mousedown', this.handMousedown.bind(this))
    document.removeEventListener('keydown', this.handGolobalKeydown.bind(this))
    // this.vm.ui.editorContainer.removeEventListener('mousemove', this.handMousemove.bind(this))
  }
  addListeners() {
    this.vm.ui.editorContainer.addEventListener('mouseup', this.handMouseup.bind(this))
    this.vm.ui.editorContainer.addEventListener('mousedown', this.handMousedown.bind(this))
    document.addEventListener('keydown', this.handGolobalKeydown.bind(this))
    // this.vm.ui.editorContainer.addEventListener('mousemove', this.handMousemove.bind(this))
    // document.addEventListener('keydown', throttle(this.handGolobalKeydown, 1000, this))
  }
  // handMousemove() {
  //   // 选择内容时隐藏光标
  //   if (this.mouseStats === 'down') {
  //     this.cursor.hidden()
  //   }
  // }
  handMousedown(event) {
    this.caretStatus = true
    this.updateRanges(event.altKey)
  }
  handMouseup(event) {
    console.log(this.nativeSelection.isCollapsed)
    if (!this.nativeSelection.isCollapsed) {
      this.caretStatus = false
      this.updateRanges(event.altKey)
    }
    console.log(this.ranges)
  }
  handGolobalKeydown(event) {
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
