import { recoverRange } from '../../utils'
const inputState = {
  // 输入框状态
  value: '',
  isComposing: false,
}

function insert(inputData) {
  if (this.endContainer.vnode.tag == 'text') {
    let orgText = this.endContainer.vnode.context
    orgText = orgText.slice(0, this.endOffset) + inputData + orgText.slice(this.endOffset)
    const caches = this.vm.selection.ranges
      .filter((range) => range.endContainer === this.endContainer)
      .map((range) => ({
        endContainer: range.endContainer,
        offset: range.endOffset >= this.endOffset ? range.endOffset + 1 : range.endOffset,
        range,
      }))
    this.endContainer.vnode.context = orgText
    recoverRange(caches)
  } else {
    console.log(inputData)
    const insertTextNode = { tag: 'text', context: inputData }
    if (range.endContainer.vnode.childrens[end]) {
      range.endContainer.vnode.childrens.splice(end, 0, insertTextNode)
      reArrangement(range.endContainer.vnode)
    } else {
      range.endContainer.vnode.childrens.push(insertTextNode)
    }
    updateNode(range.endContainer.vnode)
    setRange(vm, insertTextNode.dom, inputData.length)
  }
}

export default function input(event) {
  if (!this.collapsed) {
    this.del()
  } else if (event.type === 'input') {
    // 键盘字符输入
    console.log('键盘字符输入')
    if (!inputState.isComposing && event.data) {
      const inputData = event.data === ' ' ? '\u00A0' : event.data
      // mvc
      insert.call(this, inputData)
    } else {
      // 聚合输入， 非键盘输入，如中文输入，ui变化但不会同步vnode
      inputState.value = event.data || ''
      this.endContainer.data = this.endContainer.data.slice(0, this.endOffset) + inputState.value
    }
  } else if (event.type === 'compositionstart') {
    // 开始聚合输入 插入光标标记dom
    inputState.isComposing = true
    const endContainer = this.endContainer
    const endNode = endContainer.splitText(this.endOffset)
    // endContainer.parentNode.insertBefore(endNode, endContainer.nextSibling)
    // endContainer.parentNode.insertBefore(this.caretMarker, endNode)
  } else if (event.type === 'compositionend') {
    // 结束聚合输入 删除光标标记dom，执行输入同步vnode
    inputState.isComposing = false
    this.caretMarker.remove()
    if (!this.meta.range.end) {
      this.meta.range.endContainer.data = this.meta.range.endContainer.nextSibling.data
      this.meta.range.endContainer.nextSibling.data = ''
    } else {
      this.meta.range.endContainer.parentNode.normalize()
    }

    action.emit('input', { vm: this.vm, inputData: event.data })
    // 等待dom更新
    setTimeout(() => {
      event.target.value = ''
      this.inputState.value = ''
    })
  }
}
