import { styleSet } from '../utils/styleOp'
import { multiplication } from '../utils/pixelsCalc'
import Selection from '../selection'
export default class Cursor {
  cursor = null
  selection = null
  meta = {
    x: 0,
    y: 0,
    offset: 0,
    range: null,
    selection: null,
    container: null,
    text: null,
  }
  constructor() {
    const cursor = document.createElement('input')
    cursor.id = 'custom-cursor'
    const styleObj = {
      top: '-100px',
      left: 0,
      position: 'absolute',
      width: '0.5px',
      background: 'transparent',
      border: 'none',
      padding: 0,
    }
    styleSet(cursor, styleObj)
    document.body.appendChild(cursor)
    this.cursor = cursor
    this.selection = new Selection()
  }

  /**
   * @param {*} meta {x,y,container}
   * @memberof Cursor
   */
  setPosition(meta) {
    this.getMeta()
    let metaPointer = meta || this.meta
    const copyStyle = getComputedStyle(metaPointer.container)
    const lineHeight = multiplication(copyStyle.fontSize, 1.3)
    const styleObj = {
      top: metaPointer.y + 'px',
      left: metaPointer.x + 'px',
      lineHeight,
      fontSize: copyStyle.fontSize,
      color: copyStyle.color,
    }
    styleSet(this.cursor, styleObj)
  }
  focus() {
    this.cursor.focus()
  }
  getMeta() {
    const range = this.selection.getRange()
    const text = range.endContainer
    // 相对于 focusTaget 的偏移量
    const offset = range.endOffset
    this.meta.range = range
    this.meta.text = text
    this.meta.offset = offset
    this.meta.selection = this.selection
    this.meta.container = range.endContainer.parentNode
    // 模拟光标
    const virtualCursor = document.createElement('span')
    const endNode = text.splitText(offset)
    text.parentNode.insertBefore(endNode, text.nextSibling)
    text.parentNode.insertBefore(virtualCursor, endNode)
    const { offsetLeft: x, offsetTop: y } = virtualCursor
    this.meta.x = x
    this.meta.y = y
    text.parentNode.removeChild(virtualCursor)
    text.parentNode.normalize()
    return this.meta
  }
}
