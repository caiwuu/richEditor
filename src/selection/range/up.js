export default function up(shiftKey) {
  // 记录初时x坐标
  const initialRect = { ...this.caret.rect },
    prevRect = { ...this.caret.rect },
    oldCon = this.startContainer,
    oldOffset = this.startOffset
  const flag = this._loop('left', initialRect, prevRect, false, shiftKey)
  if (this._d === 2 && flag) {
    const newCon = this.endContainer,
      newOffset = this.endOffset
    this.setEnd(oldCon, oldOffset)
    this.setStart(newCon, newOffset)
    this._d = 1
  }
  this.updateCaret(true)
}
