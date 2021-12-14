import Caret from '../caret'
export default class Range {
  start = null
  end = null
  commonAncestor = null
  startOffset = 0
  endOffset = 0
  caret = null
  collapsed = true
  startRect = null
  constructor(nativeRange) {
    this.caret = new Caret()
    this.start = nativeRange.startContainer
    this.end = nativeRange.endContainer
    this.commonAncestor = nativeRange.commonAncestorContainer
    this.startOffset = nativeRange.startOffset
    this.endOffset = nativeRange.endOffset
  }
}
