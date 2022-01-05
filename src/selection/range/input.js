import { recoverRange } from '../../utils'
import createVnode from '../../ui/createVnode'
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
    console.log(this.endOffset)
    let caches = null,
      targetVnode = null,
      targetOffset = 0,
      flag = 0
    if (this.endContainer.vnode.childrens[this.endOffset] && this.endContainer.vnode.childrens[this.endOffset].tag === 'text') {
      targetVnode = this.endContainer.vnode.childrens[this.endOffset]
      targetOffset = inputData.length
      flag = 2
    } else if (
      this.endContainer.vnode.childrens[this.endOffset - 1] &&
      this.endContainer.vnode.childrens[this.endOffset - 1].tag === 'text'
    ) {
      targetVnode = this.endContainer.vnode.childrens[this.endOffset - 1]
      targetOffset = targetVnode.length + inputData.length
      flag = 1
    } else {
      targetVnode = createVnode({ tag: 'text', context: inputData }, this.endContainer.vnode)
      targetOffset = inputData.length
      flag = 0
    }
    switch (flag) {
      case 2:
        caches = this.vm.selection.ranges
          .filter((range) => range.endContainer === targetVnode.ele)
          .map((range) => ({
            endContainer: targetVnode.ele,
            offset: range.endOffset + targetOffset,
            range,
          }))
        caches.push({
          endContainer: targetVnode.ele,
          offset: targetOffset,
          range: this,
        })
        targetVnode.context = inputData + targetVnode.context
        recoverRange(caches)
        break
      case 1:
        caches = [
          {
            endContainer: targetVnode.ele,
            offset: targetOffset,
            range: this,
          },
        ]
        targetVnode.context = targetVnode.context + inputData
        recoverRange(caches)
        break
      case 0:
        caches = [
          {
            endContainer: targetVnode.ele,
            offset: targetOffset,
            range: this,
          },
        ]
        this.endContainer.vnode.insert(this.endOffset, targetVnode)
        recoverRange(caches)
    }
  }
}

export default function input(event) {
  if (!this.collapsed) {
    this.del()
  } else if (event.type === 'input') {
    // 键盘字符输入
    if (!this.inputState.isComposing && event.data) {
      console.log('键盘输入：', event.data)
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
      this.endContainer.vnode.context =
        this.endContainer.vnode.context.slice(0, this.endOffset - oldValue.length) +
        this.inputState.value +
        this.endContainer.vnode.context.slice(this.endOffset)
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
