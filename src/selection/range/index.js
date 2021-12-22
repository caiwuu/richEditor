import Caret from '../caret'
import { getPrevLeafNode, getNextLeafNode, getIndex, getLeafL, getLeafR, isSameLine } from '../../utils'
import { blockTag } from '../../type'
import del from './del'
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
    this.remove = () => {
      const index = this.vm.selection.ranges.findIndex((i) => i === this)
      this.caret.remove()
      this.vm.selection.ranges.splice(index, 1)
    }
    this.right = (shiftKey) => {
      const collapsed = this.collapsed
      let isEnd = false
      if (this.endContainer.vnode.tag !== 'text') {
        isEnd = this.endContainer.vnode.childrens.length === this.endOffset
      } else {
        isEnd = this.endContainer.vnode.context.length === this.endOffset
      }
      if (isEnd) {
        // 向下寻找
        let endContainer, endOffset
        const { vnode, layer } = getNextLeafNode(this.endContainer.vnode)
        if (!vnode) return false
        if (vnode.tag === 'text') {
          endContainer = vnode.ele
          endOffset = 0
        } else {
          endContainer = vnode.parent.ele
          endOffset = getIndex(vnode)
        }
        this.setEnd(endContainer, endOffset)
        collapsed && this.collapse(false)
        if (!blockTag.includes(layer.tag)) {
          return this.right()
        }
        return layer
      } else {
        let vnode
        if (this.endContainer.vnode.childrens) {
          vnode = getLeafL(this.endContainer.vnode.childrens[this.endOffset]).vnode
        } else {
          vnode = this.endContainer.vnode
        }
        if (this.endContainer.vnode.tag !== 'text' && vnode.tag === 'text') {
          this.setEnd(vnode.ele, 1)
        } else {
          this.setEnd(this.endContainer, this.endOffset + 1)
        }
        collapsed && this.collapse(false)
        return true
      }
    }

    this.left = (shiftKey) => {
      console.log(this)
      const collapsed = this.collapsed
      if (!this.startOffset) {
        // 向上寻找
        let startContainer, startOffset
        const { vnode, layer } = getPrevLeafNode(this.startContainer.vnode)
        // 到头了
        if (!vnode) return false
        if (vnode.tag === 'text') {
          startContainer = vnode.ele
          startOffset = vnode.context.length
        } else {
          startContainer = vnode.parent.ele
          startOffset = getIndex(vnode) + 1
        }
        this.setStart(startContainer, startOffset)
        collapsed && this.collapse(true)
        if (!blockTag.includes(layer.tag)) {
          return this.left()
        }
        return layer
      } else {
        let vnode
        if (this.startContainer.vnode.childrens) {
          vnode = getLeafR(this.startContainer.vnode.childrens[this.startOffset - 1]).vnode
        } else {
          vnode = this.startContainer.vnode
        }
        if (this.startContainer.vnode.tag !== 'text' && vnode.tag === 'text') {
          this.setStart(vnode.ele, vnode.context.length - 1)
        } else {
          this.setStart(this.startContainer, this.startOffset - 1)
        }
        collapsed && this.collapse(true)
        return true
      }
    }

    this.up = (shiftKey) => {
      // 记录初时x坐标
      const initialRect = { ...this.caret.rect }
      const prevRect = { ...this.caret.rect }
      this._loop('left', initialRect, prevRect, shiftKey)
      this.updateCaret(true)
    }
    this.down = (shiftKey) => {
      const initialRect = { ...this.caret.rect }
      const prevRect = { ...this.caret.rect }
      this._loop('right', initialRect, prevRect, shiftKey)
      this.updateCaret(true)
    }
    // 光标寻路算法
    this._loop = (direct, initialRect, prevRect, lineChanged = false, shiftKey) => {
      let result = true
      if (!lineChanged) {
        result = direct === 'left' ? this.left(shiftKey) : this.right(shiftKey)
        if (!result) return
        this.updateCaret(false)
      } else {
        result = direct === 'left' ? this.left(shiftKey) : this.right(shiftKey)
        if (!result) return
        this.updateCaret(false)
        const currRect = { ...this.caret.rect }
        const preDistance = Math.abs(prevRect.x - initialRect.x)
        const currDistance = Math.abs(currRect.x - initialRect.x)
        const sameLine = isSameLine(initialRect, prevRect, currRect, result)
        if (!(currDistance < preDistance && sameLine)) {
          direct === 'left' ? this.right(shiftKey) : this.left(shiftKey)
          this.updateCaret(false)
          return
        }
      }
      const currRect = { ...this.caret.rect }
      const sameLine = isSameLine(initialRect, prevRect, currRect, result)
      if (!sameLine) {
        lineChanged = true
      }
      this._loop(direct, initialRect, currRect, lineChanged, shiftKey)
    }
    this.del = del.bind(this)
  }
}
