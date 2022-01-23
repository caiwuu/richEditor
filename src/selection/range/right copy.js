import { getNextLeafNode, getIndex, getLeafL, isEmptyBlock } from '../../utils'
import { blockTag } from '../../type'
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
  let isEnd = false
  if (isEmptyBlock(container.vnode)) {
    isEnd = true
  } else if (container.vnode.type !== 'text') {
    // 非文本不能使用length，因为虚节点会被忽略，这里要用绝对长度
    isEnd = container.vnode.childrens.length === offset
  } else {
    isEnd = container.vnode.length === offset
  }
  if (isEnd) {
    // 向下寻找
    const { vnode, layer } = getNextLeafNode(container.vnode)
    if (!vnode) return false
    if (vnode.type === 'text') {
      container = vnode.ele
      offset = 0
    } else {
      container = vnode.parent.ele
      offset = getIndex(vnode)
    }
    if (shiftKey) {
      switch (this._d) {
        case 0:
        case 2:
          this.setEnd(container, offset)
          this._d = 2
          break
        case 1:
          this.setStart(container, offset)
          break
      }
    } else {
      this.setEnd(container, offset)
      this.collapse(false)
      this._d = 0
    }
    if (!blockTag.includes(layer.type)) {
      return this.right(shiftKey)
    }
    return vnode.type === 'br' ? 'br' : layer
  } else {
    let vnode
    if (container.vnode.childrens) {
      vnode = getLeafL(container.vnode.childrens[offset]).vnode
    } else {
      vnode = container.vnode
    }
    if (container.vnode.type !== 'text' && vnode.type === 'text') {
      if (shiftKey) {
        switch (this._d) {
          case 0:
          case 2:
            this.setEnd(vnode.ele, 1)
            this._d = 2
            break
          case 1:
            this.setStart(vnode.ele, 1)
            break
        }
      } else {
        this.setEnd(vnode.ele, 1)
        this.collapse(false)
        this._d = 0
      }
    } else {
      if (shiftKey) {
        switch (this._d) {
          case 0:
          case 2:
            this.setEnd(container, offset + 1)
            this._d = 2
            break
          case 1:
            this.setStart(container, offset + 1)
            break
        }
      } else {
        this.setEnd(container, offset + 1)
        this.collapse(false)
        this._d = 0
      }
    }
    return vnode.type === 'br' ? 'br' : true
  }
}
