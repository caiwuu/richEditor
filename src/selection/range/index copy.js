import Caret from '../caret'
import { getPrevLeafNode, getNextLeafNode, getIndex, getLeafL, getLeafR, isSameLine } from '../../utils'
import { blockTag } from '../../type'
import del from './del'
import input from './input'
import enter from './enter'
import left from './left'
import right from './right'
import up from './up'
import down from './down'
export default class Range {
  constructor(nativeRange, vm) {
    nativeRange.vm = vm
    this.factory.call(nativeRange)
    return nativeRange
  }
  factory() {
    this.inputState = {
      // 输入框状态
      value: '',
      isComposing: false,
    }
    this.caret = new Caret(this)
    this.updateCaret = (drawCaret = true) => {
      this.caret.update(this, drawCaret)
    }
    this.remove = () => {
      const index = this.vm.selection.ranges.findIndex((i) => i === this)
      this.caret.remove()
      this.vm.selection.ranges.splice(index, 1)
    }
    this.right = right.bind(this)

    this.left = left.bind(this)
    /**
     * 上下移动可以分解成多次向右向左移动
     * 在逆向移动中（_d===2）,有两种情况：
     * 1.选区首尾相交，
     * 2.选区首尾不相交
     * 首位相交的情况需要进行新旧位点互换，互换逻辑参考代码
     *
     */
    this.up = up.bind(this)
    this.down = down.bind(this)
    /**
     * 光标寻路算法 flag标识start和end是否相交，在按住shift调整调整选区范围中用到
     * relust 是每移动一次的反馈,false表示不能再移动了，true表示还在同一节点内移动，返回object则表示移动跨越的节点
     */
    this._loop = (direct, initialRect, prevRect, lineChanged = false, shiftKey) => {
      const flag = this.endContainer === this.startContainer && this.endOffset === this.startOffset
      let result = true
      if (!lineChanged) {
        result = direct === 'left' ? this.left(shiftKey) : this.right(shiftKey)
        if (!result) return flag
        this.updateCaret(false)
      } else {
        result = direct === 'left' ? this.left(shiftKey) : this.right(shiftKey)
        if (!result) return flag
        this.updateCaret(false)
        const currRect = { ...this.caret.rect },
          preDistance = Math.abs(prevRect.x - initialRect.x),
          currDistance = Math.abs(currRect.x - initialRect.x),
          sameLine = isSameLine(initialRect, prevRect, currRect, result)
        if (!(currDistance < preDistance && sameLine)) {
          direct === 'left' ? this.right(shiftKey) : this.left(shiftKey)
          this.updateCaret(false)
          return flag
        }
      }
      const currRect = { ...this.caret.rect },
        sameLine = isSameLine(initialRect, prevRect, currRect, result)
      if (!sameLine) {
        lineChanged = true
      }
      return this._loop(direct, initialRect, currRect, lineChanged, shiftKey)
    }
    this.del = del.bind(this)
    this.input = input.bind(this)
    this.enter = enter.bind(this)
  }
}
