import { times } from '../../utils'
export default function input(event) {
  if (!this.collapsed) {
    this.del()
  }
  if (event.type === 'input') {
    let prevInputValue,
      inputData = event.data === ' ' ? '\u00A0' : event.data || ''
    // 键盘字符输入
    if (!this.inputState.isComposing && event.data) {
      log('键盘输入：', event.data)
      prevInputValue = this.inputState.value
    } else {
      log('聚合输入:', event.data)
      prevInputValue = this.inputState.value
      this.inputState.value = inputData
    }
    times(prevInputValue.length, this.del, this, true)
    this.vm.dispatch('insert', { node: this.endContainer.vnode, pos: this.endOffset, R: this }, inputData)
  } else if (event.type === 'compositionstart') {
    log('开始聚合输入:', event.data)
    this.inputState.isComposing = true
  } else if (event.type === 'compositionend') {
    log('结束聚合输入:', event.data)
    // TODO 接收聚合输入
    this.inputState.isComposing = false
    event.target.value = ''
    // 改变执行顺序（失焦input事件是微任务，需要在它之后执行） 消除失焦意外插入的bug（腾讯文档和google文档都存在此bug）
    setTimeout(() => {
      this.inputState.value = ''
    })
  }
}
