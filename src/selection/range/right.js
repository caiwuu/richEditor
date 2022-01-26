import { isEmptyBlock, getNextPoint } from '../../utils'
export default function right(shiftKey) {
  let container, offset
  if (shiftKey) {
    switch (this._d) {
      case 2:
      case 0:
        container = this.endContainer
        offset = this.endOffset
        this._d = 2
        break
      case 1:
        container = this.startContainer
        offset = this.startOffset
        break
    }
  } else {
    container = this.endContainer
    offset = this.endOffset
  }
  const { node, pos, flag } = getNextPoint(container.vnode, offset)
  if (flag === 404) return flag
  if (shiftKey) {
    switch (this._d) {
      case 0:
      case 2:
        this.setEnd(node.ele, pos)
        this._d = 2
        break
      case 1:
        this.setStart(node.ele, pos)
        break
    }
  } else {
    this.setEnd(node.ele, pos)
    this.collapse(false)
    this._d = 0
  }
  if (isEmptyBlock(container.vnode) && flag !== 2) {
    return this.right(shiftKey)
  }
  if (flag === 1) {
    return this.right(shiftKey)
  }
  return flag
}
