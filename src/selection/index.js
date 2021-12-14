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
  getRangeAt(index=0) {
    // this.ranges = []
    while(this.ranges.length){
      const range = this.ranges.pop()
      range && range.caret.dom.remove()
    }
    const count = this.nativeSelection.rangeCount
    for (let i = 0; i < count; i++) {
      const nativeRange = this.nativeSelection.getRangeAt(i)
      this.ranges.push(new Range(nativeRange.cloneRange(),this.vm))
    }
    return this.ranges[index]
  }
  removeAllRanges() {
    this.nativeSelection.removeAllRanges()
    this.ranges = []
  }
  addRange(nativeRange) {
    this.nativeSelection.addRange(nativeRange)
    this.ranges.push(new Range(nativeRange.cloneRange()))
  }
  collapse(parentNode,offset){
    this.nativeSelection.collapse(parentNode,offset)
    this.getRangeAt()
  }
}
