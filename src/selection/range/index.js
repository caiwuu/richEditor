import Caret from '../caret'
import { getPrevLeafNode, getNextLeafNode, getIndex, getLeafL, getLeafR, isSameLine } from '../../utils'
import { blockTag } from '../../type'
export default class Range {
  constructor(nativeRange, vm) {
    nativeRange.vm = vm
    this.factory.call(nativeRange)
    return nativeRange
  }
  factory() {
    this.caret = new Caret()
    this.updateCaret = (drawCaret = true) => {
      this.caret.update(this, drawCaret)
    }
    this.right = () => {
      let isEnd = false
      if (this.startContainer.vnode.tag !== 'text') {
        isEnd = this.startContainer.vnode.childrens.length === this.startOffset
      } else {
        isEnd = this.startContainer.vnode.context.length === this.startOffset
      }
      if (isEnd) {
        // 向下寻找
        let endContainer, startOffset
        const { vnode, layer } = getNextLeafNode(this.endContainer.vnode)
        if (!vnode) return false
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
        return true
      }
    }
    this.left = () => {
      if (!this.endOffset) {
        // 向上寻找
        let endContainer, endOffset
        const { vnode, layer } = getPrevLeafNode(this.endContainer.vnode)
        // 到头了
        if (!vnode) return false
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
        return true
      }
    }
    this.up = () => {
      // 记录初时x坐标
      const initialRect = { ...this.caret.rect }
      const prevRect = { ...this.caret.rect }
      this.loop('left', initialRect, prevRect)
      this.updateCaret(true)
    }
    this.down = () => {
      const initialRect = { ...this.caret.rect }
      const prevRect = { ...this.caret.rect }
      this.loop('right', initialRect, prevRect)
      this.updateCaret(true)
    }
    // 光标寻路算法
    this.loop = (direct, initialRect, prevRect, lineChanged = false) => {
      const oldContainer = this.endContainer
      // let { x, y, h } = this.caret.rect
      let result = true
      if (!lineChanged) {
        result = direct === 'left' ? this.left() : this.right()
        if (!result) return
        this.updateCaret(false)
      } else {
        result = direct === 'left' ? this.left() : this.right()
        if (!result) return
        this.updateCaret(false)
        const currRect = { ...this.caret.rect }
        const preDistance = Math.abs(prevRect.x - initialRect.x)
        const currDistance = Math.abs(currRect.x - initialRect.x)
        const sameLine = isSameLine(initialRect, prevRect, currRect, result)
        if (!(currDistance < preDistance && sameLine)) {
          console.log('rollback', currDistance, preDistance, sameLine)
          direct === 'left' ? this.right() : this.left()
          this.updateCaret(false)
          return
        }
      }
      const currRect = { ...this.caret.rect }
      const sameLine = isSameLine(initialRect, prevRect, currRect, result)
      if (!sameLine) {
        lineChanged = true
      }
      this.loop(direct, initialRect, currRect, lineChanged)
    }
  }
}
