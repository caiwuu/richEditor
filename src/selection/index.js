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
  getRangeAt(index = 0) {
    this.clearRanges()
    const count = this.nativeSelection.rangeCount
    console.log(count)
    for (let i = 0; i < count; i++) {
      const nativeRange = this.nativeSelection.getRangeAt(i)
      this.ranges.push(new Range(nativeRange.cloneRange(), this.vm))
    }
    return this.ranges[index]
  }
  removeAllRanges() {
    this.nativeSelection.removeAllRanges()
    this.clearRanges()
  }
  clearRanges() {
    return
    while (this.ranges.length) {
      const range = this.ranges.pop()
      range && range.caret.dom.remove()
    }
  }
  addRange(nativeRange) {
    this.nativeSelection.addRange(nativeRange)
    // TODO 多光标这里不要add
    this.ranges.push(new Range(nativeRange.cloneRange(), this.vm))
  }
  collapse(parentNode, offset) {
    this.nativeSelection.collapse(parentNode, offset)
    this.getRangeAt()
  }
  updateRanges() {
    setTimeout(() => {
      this.getRangeAt()
      this.ranges.forEach((range) => range.updateCaret())
    })
  }
  move(direction) {
    this.nativeSelection.removeAllRanges()
    this.ranges.forEach((range) => {
      range[direction]()
      // this.addRange(range)
      range.updateCaret()
    })
    // this.updateRanges()
    console.log(this.ranges)
  }
}
