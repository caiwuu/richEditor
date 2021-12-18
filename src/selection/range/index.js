import Caret from '../caret'
import { getPrevLeafNode, getNextLeafNode, getIndex, getLeafL, getLeafR } from '../../utils'
import { blockTag } from '../../type'
export default class Range {
  constructor(nativeRange, vm) {
    nativeRange.vm = vm
    this.factory.call(nativeRange)
    return nativeRange
  }
  factory() {
    this.caret = new Caret()
    this.updateCaret = () => {
      this.caret.update(this)
    }
    this.right = () => {
      let isEnd = false
      if (this.startContainer.vnode.tag !== 'text') {
        isEnd = this.startContainer.vnode.childrens.length === this.startOffset
      } else {
        isEnd = this.startContainer.vnode.context.length === this.startOffset
      }
      console.log(isEnd)
      if (isEnd) {
        // 向下寻找
        let endContainer, startOffset
        const { vnode, layer } = getNextLeafNode(this.endContainer.vnode)
        console.log(layer)
        if (!vnode) return
        if (vnode.tag === 'text') {
          endContainer = vnode.ele
          startOffset = 0
        } else {
          endContainer = vnode.parent.ele
          startOffset = getIndex(vnode)
        }
        this.setStart(endContainer, startOffset)
        if (!blockTag.includes(layer.tag)) {
          return this.right()
        }
        return layer
      } else {
        let vnode
        if (this.startContainer.vnode.childrens) {
          vnode = getLeafL(this.startContainer.vnode.childrens[this.startOffset]).vnode
        } else {
          vnode = this.startContainer.vnode
        }
        if (this.startContainer.vnode.tag !== 'text' && vnode.tag === 'text') {
          this.setStart(vnode.ele, 1)
        } else {
          this.setStart(this.startContainer, this.startOffset + 1)
        }
      }
    }
    this.left = () => {
      if (!this.endOffset) {
        // 向上寻找
        let endContainer, endOffset
        const { vnode, layer } = getPrevLeafNode(this.endContainer.vnode)
        // 到头了
        if (!vnode) return
        if (vnode.tag === 'text') {
          endContainer = vnode.ele
          endOffset = vnode.context.length
        } else {
          endContainer = vnode.parent.ele
          endOffset = getIndex(vnode) + 1
        }
        this.setEnd(endContainer, endOffset)
        if (!blockTag.includes(layer.tag)) {
          return this.left()
        }
        return layer
      } else {
        let vnode
        if (this.endContainer.vnode.childrens) {
          vnode = getLeafR(this.endContainer.vnode.childrens[this.endOffset - 1]).vnode
        } else {
          vnode = this.endContainer.vnode
        }
        if (this.endContainer.vnode.tag !== 'text' && vnode.tag === 'text') {
          this.setEnd(vnode.ele, vnode.context.length - 1)
        } else {
          this.setEnd(this.endContainer, this.endOffset - 1)
        }
      }
    }
  }
}
