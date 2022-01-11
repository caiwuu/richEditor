import Caret from '../caret'
import { getPrevLeafNode, getNextLeafNode, getIndex, getLeafL, getLeafR, isSameLine } from '../../utils'
import { blockTag } from '../../type'
import del from './del'
import input from './input'
import enter from './enter'
export default class Range {
  constructor(nativeRange, vm) {
    nativeRange.vm = vm
    this.factory.call(nativeRange)
    return nativeRange
  }
  connect() {}
  unconnect() {}
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
    this.right = (shiftKey) => {
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
      if (container.vnode.type !== 'text') {
        isEnd = container.vnode.childrens.length === offset
      } else {
        isEnd = container.vnode.context.length === offset
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
        return layer
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
        return true
      }
    }

    this.left = (shiftKey) => {
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
    /**
     * 上下移动可以分解成多次向右向左移动
     * 在逆向移动中（_d===2）,有两种情况：
     * 1.选区首尾相交，
     * 2.选区首尾不相交
     * 首位相交的情况需要进行新旧位点互换，互换逻辑参考代码
     *
     */
    this.up = (shiftKey) => {
      // 记录初时x坐标
      const initialRect = { ...this.caret.rect },
        prevRect = { ...this.caret.rect },
        oldCon = this.startContainer,
        oldOffset = this.startOffset
      const flag = this._loop('left', initialRect, prevRect, false, shiftKey)
      if (this._d === 2 && flag) {
        const newCon = this.endContainer,
          newOffset = this.endOffset
        this.setEnd(oldCon, oldOffset)
        this.setStart(newCon, newOffset)
        this._d = 1
      }
      this.updateCaret(true)
    }
    this.down = (shiftKey) => {
      const initialRect = { ...this.caret.rect },
        prevRect = { ...this.caret.rect },
        oldCon = this.endContainer,
        oldOffset = this.endOffset
      const flag = this._loop('right', initialRect, prevRect, false, shiftKey)
      if (this._d === 1 && flag) {
        const newCon = this.startContainer,
          newOffset = this.startOffset
        this.setStart(oldCon, oldOffset)
        this.setEnd(newCon, newOffset)
        this._d = 2
      }
      this.updateCaret(true)
    }
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
