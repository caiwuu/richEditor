import { recoverRange } from '../utils'
import createVnode from '../ui/createVnode'
function removeVirtual(vnode) {
  vnode.childrens.filter((vnode) => vnode.virtual).forEach((vnode) => vnode.remove())
}
const handleInsert = {
  betweenTextAndEle: (from, inputData, newRangePos) => {
    removeVirtual(from.node)
    newRangePos.targetVnode.context = newRangePos.targetVnode.context + inputData
  },
  betweenEleAndText: (from, inputData, newRangePos) => {
    removeVirtual(from.node)
    newRangePos.targetVnode.context = inputData + newRangePos.targetVnode.context
  },
  betweenEleAndEle: (from, inputData, newRangePos) => {
    removeVirtual(from.node)
    from.node.insert(newRangePos.targetVnode, from.pos)
  },
  betweenTextAndText: (from, inputData, newRangePos) => {
    let orgText = from.node.context
    orgText = orgText.slice(0, from.pos) + inputData + orgText.slice(from.pos)
    removeVirtual(from.node.parent)
    from.node.context = orgText
  },
}
const handleRangePosition = {
  betweenTextAndEle: (from, inputData) => {
    const targetVnode = from.node.childrens[from.pos - 1]
    return {
      targetVnode: targetVnode,
      targetOffset: targetVnode.length + inputData.length,
    }
  },
  betweenEleAndText: (from, inputData) => {
    return {
      targetVnode: from.node.childrens[from.pos],
      targetOffset: inputData.length,
    }
  },
  betweenEleAndEle: (from, inputData) => {
    return {
      targetVnode: createVnode({ type: 'text', context: inputData }, from.node),
      targetOffset: inputData.length,
    }
  },
  betweenTextAndText: (from, inputData) => {
    return {
      targetVnode: from.node,
      targetOffset: from.pos + inputData.length,
    }
  },
}
const cacheRanges = {
  betweenTextAndEle: (from, inputData, newRangePos) => {
    return from.R
      ? [
          {
            endContainer: newRangePos.targetVnode.ele,
            offset: newRangePos.targetOffset,
            range: from.R,
          },
        ]
      : []
  },
  betweenEleAndText: (from, inputData, newRangePos, vm) => {
    const caches = vm.selection.ranges
      .filter((range) => range.endContainer === newRangePos.targetVnode.ele)
      .map((range) => ({
        endContainer: newRangePos.targetVnode.ele,
        offset: range.endOffset + newRangePos.targetOffset,
        range: range,
      }))
    from.R &&
      caches.push({
        endContainer: newRangePos.targetVnode.ele,
        offset: newRangePos.targetOffset,
        range: from.R,
      })
    return caches
  },
  betweenEleAndEle: (from, inputData, newRangePos) => {
    return from.R
      ? [
          {
            endContainer: newRangePos.targetVnode.ele,
            offset: newRangePos.targetOffset,
            range: from.R,
          },
        ]
      : []
  },
  betweenTextAndText: (from, inputData, newRangePos, vm) => {
    const caches = vm.selection.ranges
      .filter((range) => range.endContainer === from.node.ele && range.endOffset >= from.pos)
      .map((range) => ({
        endContainer: range.endContainer,
        offset: range.endOffset + inputData.length,
        range: range,
      }))
    return caches
  },
}
function getInsertType(from) {
  if (from.node.type == 'text') {
    return 'betweenTextAndText'
  } else if (from.node.childrens[from.pos] && from.node.childrens[from.pos].type === 'text') {
    return 'betweenEleAndText'
  } else if (from.node.childrens[from.pos - 1] && from.node.childrens[from.pos - 1].type === 'text') {
    return 'betweenTextAndEle'
  } else {
    return 'betweenEleAndEle'
  }
}
export default function insert(args) {
  const [from, inputData] = args,
    insertType = getInsertType(from),
    newRangePos = handleRangePosition[insertType](from, inputData),
    caches = cacheRanges[insertType](from, inputData, newRangePos, this)
  handleInsert[insertType](from, inputData, newRangePos)
  console.log(caches)
  recoverRange(caches)
}
