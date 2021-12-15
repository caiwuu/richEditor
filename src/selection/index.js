import Range from './range'
export default class Selection {
  nativeSelection = document.getSelection()
  ranges = []
  constructor(vm) {
    this.vm = vm
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
      range && range.caret.dom.remove()
    }
  }
  // 多选区支持
  extendRanges() {
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
    this.ranges.forEach((range) => {
      range[direction]()
      range.updateCaret()
    })
    console.log(this.ranges)
  }
}
