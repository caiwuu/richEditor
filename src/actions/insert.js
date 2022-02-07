import { recoverRangePoint } from '../utils'
import createVnode from '../vnode'
function removeVirtual(from, insertType) {
  let vnode
  if (insertType === 'betweenTextAndText') {
    vnode = from.node.parent
  } else {
    vnode = from.node
  }
  vnode.childrens.filter((vnode) => vnode.belong('placeholder')).forEach((vnode) => vnode.remove())
}
const handleInsert = {
  betweenTextAndEle: (from, inputData, newRangePos) => {
    newRangePos.targetVnode.context = newRangePos.targetVnode.context + inputData
  },
  betweenEleAndText: (from, inputData, newRangePos) => {
    newRangePos.targetVnode.context = inputData + newRangePos.targetVnode.context
  },
  betweenEleAndEle: (from, inputData, newRangePos) => {
    from.node.insert(newRangePos.targetVnode, from.pos)
  },
  betweenTextAndText: (from, inputData, newRangePos) => {
    let orgText = from.node.context
    orgText = orgText.slice(0, from.pos) + inputData + orgText.slice(from.pos)
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
            container: newRangePos.targetVnode.ele,
            offset: newRangePos.targetOffset,
            range: from.R,
            flag: 'end',
          },
          {
            container: newRangePos.targetVnode.ele,
            offset: newRangePos.targetOffset,
            range: from.R,
            flag: 'start',
          },
        ]
      : []
  },
  betweenEleAndText: (from, inputData, newRangePos, vm) => {
    const caches = vm.selection
      .getRangePoints()
      .filter((point) => point.container === newRangePos.targetVnode.ele)
      .map((point) => ({
        container: newRangePos.targetVnode.ele,
        offset: point.endOffset + newRangePos.targetOffset,
        range: point.range,
        flag: point.flag,
      }))
    from.R &&
      caches.push(
        {
          container: newRangePos.targetVnode.ele,
          offset: newRangePos.targetOffset,
          range: from.R,
          flag: 'start',
        },
        {
          container: newRangePos.targetVnode.ele,
          offset: newRangePos.targetOffset,
          range: from.R,
          flag: 'end',
        }
      )
    return caches
  },
  betweenEleAndEle: (from, inputData, newRangePos) => {
    return from.R
      ? [
          {
            container: newRangePos.targetVnode.ele,
            offset: newRangePos.targetOffset,
            range: from.R,
            flag: 'start',
          },
          {
            container: newRangePos.targetVnode.ele,
            offset: newRangePos.targetOffset,
            range: from.R,
            flag: 'end',
          },
        ]
      : []
  },
  betweenTextAndText: (from, inputData, newRangePos, vm) => {
    const caches = vm.selection
      .getRangePoints()
      .filter((point) => point.container === from.node.ele && point.offset >= from.pos)
      .map((point) => ({
        container: point.container,
        offset: point.offset + inputData.length,
        range: point.range,
        flag: point.flag,
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
    //获取插入类型
    insertType = getInsertType(from),
    // 光标新位置
    newRangePos = handleRangePosition[insertType](from, inputData)
  // 执行插入
  handleInsert[insertType](from, inputData, newRangePos)
  const caches = cacheRanges[insertType](from, inputData, newRangePos, this)
  // 绘制光标
  recoverRangePoint(caches)
  // 删除 占位节点
  removeVirtual(from, insertType)
}
