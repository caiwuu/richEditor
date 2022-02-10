import { isSameLine, lookUpEmptyInline, isEmptyBlock } from '../../utils'
import Caret from '../caret'
import del from './del'
import input from './input'
import enter from './enter'
import bold from './bold'
import left from './left'
import right from './right'
import up from './up'
import down from './down'
function removeEmpty(container) {
  if (!container.vnode.isEmpty) return
  if (isEmptyBlock(container.vnode)) {
    // 块格式化 暂不处理 del中已经格式化
  } else {
    const emptyInlineNode = lookUpEmptyInline(container.vnode)
    if (emptyInlineNode.removed) return
    emptyInlineNode.remove()
  }
}
export default class Range {
  inputState = {
    // 输入框状态
    value: '',
    isComposing: false,
  }
  _d = 0
  collapsed = true
  constructor(ops, vm) {
    console.log(ops)
    this.endContainer = ops.endContainer
    this.startContainer = ops.startContainer
    this.endOffset = ops.endOffset
    this.startOffset = ops.startOffset
    this.collapsed = ops.collapsed
    this.vm = vm
    this._init()
  }
  _init() {
    this.caret = new Caret(this)
    this.right = right.bind(this)
    this.left = left.bind(this)
    this.up = up.bind(this)
    this.down = down.bind(this)
    this.del = del.bind(this)
    this.input = input.bind(this)
    this.enter = enter.bind(this)
    this.bold = bold.bind(this)
  }
  _updateStatus() {
    this.collapsed = this.endContainer === this.startContainer && this.endOffset === this.startOffset
  }
  setEnd(endNode, endOffset) {
    removeEmpty(this.endContainer)
    this.endContainer = endNode
    this.endOffset = endOffset
    this._updateStatus()
  }
  setStart(startNode, startOffset) {
    removeEmpty(this.startContainer)
    this.startContainer = startNode
    this.startOffset = startOffset
    this._updateStatus()
  }
  collapse(toStart) {
    if (toStart) {
      removeEmpty(this.endContainer)
      this.endContainer = this.startContainer
      this.endOffset = this.startOffset
      this.collapsed = true
    } else {
      removeEmpty(this.startContainer)
      this.startOffset = this.endOffset
      this.startContainer = this.endContainer
      this.collapsed = true
    }
  }
  updateCaret(drawCaret = true) {
    this.caret.update(this, drawCaret)
  }
  remove() {
    const index = this.vm.selection.ranges.findIndex((i) => i === this)
    this.caret.remove()
    this.vm.selection.ranges.splice(index, 1)
  }
  _loop(direct, initialRect, prevRect, lineChanged = false, shiftKey) {
    if (this.collapsed) {
      this._d = 0
    }
    const flag = direct === 'left' ? this.left(shiftKey) : this.right(shiftKey)
    if (!lineChanged) {
      if (flag === 404) return
      this.updateCaret(false)
    } else {
      if (flag === 404) return
      this.updateCaret(false)
      const currRect = { ...this.caret.rect },
        preDistance = Math.abs(prevRect.x - initialRect.x),
        currDistance = Math.abs(currRect.x - initialRect.x),
        sameLine = isSameLine(initialRect, prevRect, currRect, flag, this.vm)
      if (!(currDistance <= preDistance && sameLine)) {
        direct === 'left' ? this.right(shiftKey) : this.left(shiftKey)
        this.updateCaret(false)
        return
      }
    }
    const currRect = { ...this.caret.rect },
      sameLine = isSameLine(initialRect, prevRect, currRect, flag, this.vm)
    if (!sameLine) {
      lineChanged = true
    }
    return this._loop(direct, initialRect, currRect, lineChanged, shiftKey)
  }
}
