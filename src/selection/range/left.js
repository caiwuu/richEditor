import { getPrevLeafNode, getIndex, getLeafR } from '../../utils'
import { blockTag } from '../../type'
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
  if (!offset) {
    // 向上寻找
    const { vnode, layer } = getPrevLeafNode(container.vnode)
    // 到头了
    if (!vnode) return false
    if (vnode.type === 'text') {
      container = vnode.ele
      offset = vnode.context.length
    } else {
      container = vnode.parent.ele
      offset = getIndex(vnode) + 1
    }
    if (shiftKey) {
      switch (this._d) {
        case 0:
        case 1:
          this.setStart(container, offset)
          this._d = 1
          break
        case 2:
          this.setEnd(container, offset)
          break
      }
    } else {
      this.setStart(container, offset)
      this.collapse(true)
      this._d = 0
    }
    if (!blockTag.includes(layer.type)) {
      return this.left(shiftKey)
    }
    return layer
  } else {
    let vnode
    if (container.vnode.childrens) {
      vnode = getLeafR(container.vnode.childrens[offset - 1]).vnode
    } else {
      vnode = container.vnode
    }
    if (container.vnode.type !== 'text' && vnode.type === 'text') {
      if (shiftKey) {
        switch (this._d) {
          case 0:
          case 1:
            this.setStart(vnode.ele, vnode.context.length - 1)
            this._d = 1
            break
          case 2:
            this.setEnd(vnode.ele, vnode.context.length - 1)
            break
        }
      } else {
        this.setStart(vnode.ele, vnode.context.length - 1)
        this.collapse(true)
        this._d = 0
      }
    } else {
      if (shiftKey) {
        switch (this._d) {
          case 0:
          case 1:
            this.setStart(container, offset - 1)
            this._d = 1
            break
          case 2:
            this.setEnd(container, offset - 1)
            break
        }
      } else {
        this.setStart(container, offset - 1)
        this.collapse(true)
        this._d = 0
      }
    }
    return true
  }
}
