import { recoverRange, times } from '../../utils'
import createVnode from '../../ui/createVnode'
const handleInsert = {
  betweenTextAndEle: (R, inputData, newRangePos) => {
    newRangePos.targetVnode.context = newRangePos.targetVnode.context + inputData
  },
  betweenEleAndText: (R, inputData, newRangePos) => {
    newRangePos.targetVnode.context = inputData + newRangePos.targetVnode.context
  },
  betweenEleAndEle: (R, inputData, newRangePos) => {
    R.endContainer.vnode.insert(R.endOffset, newRangePos.targetVnode)
  },
  betweenTextAndText: (R, inputData, newRangePos) => {
    let orgText = R.endContainer.vnode.context
    orgText = orgText.slice(0, R.endOffset) + inputData + orgText.slice(R.endOffset)
    R.endContainer.vnode.context = orgText
  },
}
const handleRangePosition = {
  betweenTextAndEle: (R, inputData) => {
    return {
      targetVnode: R.endContainer.vnode.childrens[R.endOffset - 1],
      targetOffset: targetVnode.length + inputData.length,
    }
  },
  betweenEleAndText: (R, inputData) => {
    return {
      targetVnode: R.endContainer.vnode.childrens[R.endOffset],
      targetOffset: inputData.length,
    }
  },
  betweenEleAndEle: (R, inputData) => {
    return {
      targetVnode: createVnode({ tag: 'text', context: inputData }, R.endContainer.vnode),
      targetOffset: inputData.length,
    }
  },
  betweenTextAndText: (R, inputData) => {
    return {
      targetVnode: R.endContainer.vnode,
      targetOffset: R.endOffset + inputData.length,
    }
  },
}
const cacheRanges = {
  betweenTextAndEle: (R, inputData, newRangePos) => {
    return [
      {
        endContainer: newRangePos.targetVnode.ele,
        offset: newRangePos.targetOffset,
        range: R,
      },
    ]
  },
  betweenEleAndText: (R, inputData, newRangePos) => {
    const caches = R.vm.selection.ranges
      .filter((range) => range.endContainer === newRangePos.targetVnode.ele)
      .map((range) => ({
        endContainer: newRangePos.targetVnode.ele,
        offset: range.endOffset + newRangePos.targetOffset,
        range: range,
      }))
    caches.push({
      endContainer: newRangePos.targetVnode.ele,
      offset: newRangePos.targetOffset,
      range: R,
    })
    return caches
  },
  betweenEleAndEle: (R, inputData, newRangePos) => {
    return [
      {
        endContainer: newRangePos.targetVnode.ele,
        offset: newRangePos.targetOffset,
        range: R,
      },
    ]
  },
  betweenTextAndText: (R, inputData, newRangePos) => {
    const caches = R.vm.selection.ranges
      .filter((range) => range.endContainer === R.endContainer)
      .map((range) => ({
        endContainer: range.endContainer,
        offset: range.endOffset >= R.endOffset ? range.endOffset + inputData.length : range.endOffset,
        range: range,
      }))
    return caches
  },
}
function getInsertType(R) {
  if (R.endContainer.vnode.tag == 'text') {
    return 'betweenTextAndText'
  } else if (R.endContainer.vnode.childrens[R.endOffset] && R.endContainer.vnode.childrens[R.endOffset].tag === 'text') {
    return 'betweenEleAndText'
  } else if (R.endContainer.vnode.childrens[R.endOffset - 1] && R.endContainer.vnode.childrens[R.endOffset - 1].tag === 'text') {
    return 'betweenTextAndEle'
  } else {
    return 'betweenEleAndEle'
  }
}
function insert(R, inputData) {
  const insertType = getInsertType(R)
  const newRangePos = handleRangePosition[insertType](R, inputData)
  const caches = cacheRanges[insertType](R, inputData, newRangePos)
  handleInsert[insertType](R, inputData, newRangePos)
  recoverRange(caches)
}
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
    insert(this, inputData)
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
