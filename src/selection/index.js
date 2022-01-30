import { lookUpEmptyInline, isEmptyBlock } from '../utils'
import Range from './range'
import inputor from './inputor'
function removeEmpty(container) {
  if (!container.vnode.isEmpty) return
  if (!isEmptyBlock(container.vnode)) {
    const emptyInlineNode = lookUpEmptyInline(container.vnode)
    if (emptyInlineNode.removed) return
    emptyInlineNode.remove()
  }
  // 块格式化 无需处理 del中已经格式化
}
export default class Selection {
  nativeSelection = document.getSelection()
  ranges = []
  constructor(editor) {
    this.editor = editor
    this.inputor = new inputor(this)
    this._addListeners()
  }
  getCount() {
    return this.ranges.length
  }
  getRangePoints() {
    const points = []
    this.ranges.forEach((range) => {
      points.push(
        {
          container: range.startContainer,
          offset: range.startOffset,
          range,
          flag: 'start',
        },
        {
          container: range.endContainer,
          offset: range.endOffset,
          range,
          flag: 'end',
        }
      )
    })
    return points
  }
  _resetRanges() {
    this.clearRanges()
    const count = this.nativeSelection.rangeCount
    for (let i = 0; i < count; i++) {
      const nativeRange = this.nativeSelection.getRangeAt(i)
      this.pushRange(nativeRange)
    }
  }
  getRangeAt(index = 0) {
    return this.ranges[index]
  }
  removeAllRanges() {
    this.nativeSelection.removeAllRanges()
    this.clearRanges()
  }
  clearRanges() {
    while (this.ranges.length) {
      const range = this.ranges.pop()
      removeEmpty(range.endContainer)
      removeEmpty(range.startContainer)
      range.caret.remove()
    }
  }
  // 多选区支持
  _extendRanges() {
    const count = this.nativeSelection.rangeCount
    if (count > 0) {
      const nativeRange = this.nativeSelection.getRangeAt(count - 1)
      let flag = false
      this.ranges.forEach((i) => {
        if (i.endContainer === nativeRange.endContainer && i.startOffset === nativeRange.startOffset) {
          flag = true
          removeEmpty(i.endContainer)
          removeEmpty(i.startContainer)
          i.remove()
        }
      })
      if (flag) return
      this.pushRange(nativeRange)
    }
  }
  createNativeRange({ startContainer, startOffset, endContainer, endOffset }) {
    const range = document.createRange()
    range.setStart(startContainer, startOffset)
    range.setEnd(endContainer, endOffset)
    return range
  }
  pushRange(nativeRange) {
    const { focusNode, focusOffset } = this.nativeSelection
    const cloneRange = new Range(nativeRange, this.editor)
    if (cloneRange.collapsed) {
      cloneRange._d = 0
    } else if (focusNode === cloneRange.endContainer && focusOffset === cloneRange.endOffset) {
      cloneRange._d = 2
    } else {
      cloneRange._d = 1
    }
    this.ranges.push(cloneRange)
  }
  // 注意chrome不支持多选区,需要在此之前调用 removeAllRanges
  addRange(nativeRange) {
    this.nativeSelection.addRange(nativeRange)
    this.pushRange(nativeRange)
  }
  collapse(parentNode, offset) {
    this.nativeSelection.collapse(parentNode, offset)
    this._resetRanges()
  }
  updateRanges(multiple) {
    // 选区的创建结果需要在宏任务中获取.
    setTimeout(() => {
      if (multiple) {
        this._extendRanges()
      } else {
        this._resetRanges()
      }
      this.ranges.forEach((range) => range.updateCaret())
      this._drawRangeBg()
    })
  }
  _isCoverd(rectA, rectB) {
    return rectA.y < rectB.y ? rectA.y + rectA.ch >= rectB.y + rectB.ch : rectB.y + rectB.ch >= rectA.y + rectA.ch
  }
  // 高性能去重;
  distinct() {
    let tempObj = {}
    let len = this.ranges.length
    for (let index = 0; index < len; index++) {
      const range = this.ranges[index]
      const key = range.startContainer.vnode.position + range.caret.rect.x + range.caret.rect.y
      if (!tempObj[key]) {
        // 这里解决当两个光标在同一行又不在同一个节点上却又重合的情况，通常在跨行内节点会出现，这时应该当作重复光标去重
        const covereds = Object.entries(tempObj).filter((item) => range.caret.rect.x === item[1].caret.rect.x)
        if (covereds.length === 0) {
          tempObj[key] = range
        } else if (this._isCoverd(range.caret.rect, covereds[0][1].caret.rect)) {
          range.caret.remove()
          this.ranges.splice(index, 1)
          len--
          index--
        } else {
          tempObj[key] = range
        }
      } else {
        range.caret.remove()
        this.ranges.splice(index, 1)
        len--
        index--
      }
    }
    tempObj = null
  }
  _drawRangeBg() {
    const currRange = this.ranges[0]
    this.nativeSelection.removeAllRanges()
    this.nativeSelection.addRange(this.createNativeRange(currRange))
  }
  move(direction, drawCaret = true, shiftKey) {
    // 支持多光标但是目前还不支持多选区；这里禁止多光标拖蓝
    if (shiftKey && this.ranges.length > 1) {
      return
    }
    const nativeRange = this.nativeSelection.rangeCount > 0 ? this.nativeSelection.getRangeAt(0) : null
    this.ranges.forEach((range) => {
      // 没按shift 并且 存在选区,取消选区，左右不移动光标，上下可移动光标
      if (!shiftKey && !range.collapsed) {
        const collapseToStart = range._d === 1
        nativeRange && nativeRange.collapse(collapseToStart)
        range.collapse(collapseToStart)
        range._d = 0
        range.updateCaret()
        if (direction === 'up' || direction === 'down') {
          range[direction](shiftKey)
          drawCaret && range.updateCaret()
        }
      } else {
        if (range.collapsed) {
          range._d = 0
        }
        range[direction](shiftKey)
        drawCaret && range.updateCaret()
      }
    })
    this.distinct()
    this.inputor.focus()
    // 按住shit时同步到真实原生range绘制拖蓝
    if (shiftKey) {
      this._drawRangeBg()
    }
  }
  del() {
    this.editor.execCommand('delete')
    this.distinct()
  }
  input(event) {
    this.editor.execCommand('input', null, event)
    this.distinct()
  }
  enter() {
    this.editor.execCommand('enter')
  }
  destroy() {
    this.inputor.destroy()
    this.editor.ui.editorContainer.removeEventListener('mouseup', this._handMouseup.bind(this))
    this.editor.ui.editorContainer.removeEventListener('mousedown', this._handMousedown.bind(this))
  }
  _addListeners() {
    this.editor.ui.editorContainer.addEventListener('mouseup', this._handMouseup.bind(this))
    this.editor.ui.editorContainer.addEventListener('mousedown', this._handMousedown.bind(this))
  }
  _handMousedown(event) {
    if (!event.shiftKey) {
      const count = this.nativeSelection.rangeCount
      for (let i = 0; i < count; i++) {
        const nativeRange = this.nativeSelection.getRangeAt(i)
        nativeRange.collapse(true)
      }
      this.updateRanges(event.altKey)
    }
  }
  _handMouseup(event) {
    // 有选区
    if (!this.nativeSelection.isCollapsed || event.shiftKey) {
      this.updateRanges(event.altKey)
    }
    this.inputor.focus()
  }
}
