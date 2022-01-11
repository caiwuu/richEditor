export default function down(shiftKey) {
  const initialRect = { ...this.caret.rect },
    prevRect = { ...this.caret.rect }
  this._loop('right', initialRect, prevRect, false, shiftKey)
  this.updateCaret(true)
}
