import Range from './range'
export default class Selection {
  nativeSelection = document.getSelection()
  ranges = []
  constructor() {
    this.setRanges()
  }
  getRange(index) {
    return this.ranges[index]
  }
  getCount() {
    return this.ranges.length
  }
  setRanges() {
    this.ranges = []
    const count = this.nativeSelection.rangeCount
    for (let index = 0; index < count; index++) {
      const nativeRange = this.nativeSelection.getRangeAt(index)
      this.ranges.push(new Range(nativeRange.cloneRange()))
    }
  }
  removeAllRanges() {
    this.nativeSelection.removeAllRanges()
    this.ranges = []
  }
  addRange(nativeRange) {
    this.nativeSelection.addRange(nativeRange)
    this.ranges.push(new Range(nativeRange.cloneRange()))
  }
}
