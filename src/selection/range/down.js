export default function down(shiftKey) {
  const initialRect = { ...this.caret.rect },
    prevRect = { ...this.caret.rect },
    oldCon = this.endContainer,
    oldOffset = this.endOffset
  const flag = this._loop('right', initialRect, prevRect, false, shiftKey)
  if (this._d === 1 && flag) {
    const newCon = this.startContainer,
      newOffset = this.startOffset
    this.setStart(oldCon, oldOffset)
    this.setEnd(newCon, newOffset)
    this._d = 2
  }
  this.updateCaret(true)
}
