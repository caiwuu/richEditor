export default function up(shiftKey) {
  console.log(shiftKey, this._d)
  // 记录初时x坐标
  const initialRect = { ...this.caret.rect },
    prevRect = { ...this.caret.rect }
  this._loop('left', initialRect, prevRect, false, shiftKey)
  this.updateCaret(true)
}
