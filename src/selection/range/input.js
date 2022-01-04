import { recoverRange } from '../../utils'
function insert(inputData) {
  if (this.endContainer.vnode.tag == 'text') {
    let orgText = this.endContainer.vnode.context
    orgText = orgText.slice(0, this.endOffset) + inputData + orgText.slice(this.endOffset)
    const caches = this.vm.selection.ranges
      .filter((range) => range.endContainer === this.endContainer)
      .map((range) => ({
        endContainer: range.endContainer,
        offset: range.endOffset >= this.endOffset ? range.endOffset + inputData.length : range.endOffset,
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
  console.log('字符输入')
  if (!this.collapsed) {
    this.del()
  } else if (event.type === 'input') {
    // 键盘字符输入
    if (!this.inputState.isComposing && event.data) {
      console.log('键盘字符输入')
      const inputData = event.data === ' ' ? '\u00A0' : event.data
      insert.call(this, inputData)
    } else {
      console.log('聚合输入:', event.data)
      const oldValue = this.inputState.value
      this.inputState.value = event.data || ''
      const caches = this.vm.selection.ranges
        .filter((range) => range.endContainer === this.endContainer)
        .map((range) => ({
          endContainer: range.endContainer,
          offset: range.endOffset >= this.endOffset ? range.endOffset - oldValue.length + this.inputState.value.length : range.endOffset,
          range,
        }))
      this.endContainer.vnode.context = this.endContainer.vnode.context.slice(0, this.endOffset - oldValue.length) + this.inputState.value + this.endContainer.vnode.context.slice(this.endOffset)
      recoverRange(caches)
    }
  } else if (event.type === 'compositionstart') {
    console.log('开始聚合输入')
    this.inputState.isComposing = true
  } else if (event.type === 'compositionend') {
    console.log('结束聚合输入')
    this.inputState.isComposing = false
    event.target.value = ''
    this.inputState.value = ''
  }
}
