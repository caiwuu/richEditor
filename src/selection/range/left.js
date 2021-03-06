import { isEmptyBlock, getPrevPoint } from '../../utils'
export default function left(shiftKey) {
  let container, offset
  if (shiftKey) {
    switch (this._d) {
      case 1:
      case 0:
        container = this.startContainer
        offset = this.startOffset
        this._d = 1
        break
      case 2:
        container = this.endContainer
        offset = this.endOffset
        break
    }
  } else {
    container = this.startContainer
    offset = this.startOffset
  }
  const { node, pos, flag } = getPrevPoint(container.vnode, offset)
  if (flag === 404) return flag
  if (shiftKey) {
    switch (this._d) {
      case 0:
      case 1:
        this.setStart(node.ele, pos)
        this._d = 1
        break
      case 2:
        this.setEnd(node.ele, pos)
        break
    }
  } else {
    this.setStart(node.ele, pos)
    this.collapse(true)
    this._d = 0
  }
  // 穿越空块
  if (isEmptyBlock(container.vnode) && flag !== 2) {
    return this.left(shiftKey)
  }
  if (flag === 1) {
    return this.left(shiftKey)
  }
  return flag
}
