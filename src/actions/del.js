import {
  getPrevPoint,
  getNextPoint,
  deleteNode,
  getIndex,
  getNode,
  getLayer,
  recoverRangePoint,
  isEmptyBlock,
  comparePosition,
} from '../utils'
import createVnode from '../vnode'
export default function del(args) {
  const [from, to] = transToNode.call(this, args)
  const prev = getPrevPoint(from.node, from.pos)
  if (typeof to === 'number') {
    // 行内操作
    if (prev.flag <= 0) {
      console.log('节点内删除')
      innerDel.call(this, from, to)
      // 需要跨标签操作
    } else {
      crossNodeDel.call(this, from, to, prev)
    }
  } else {
    // 区间删除
    if (from.node === to.node) {
      console.log('节点内删除')
      innerDel.call(this, from, from.pos - to.pos)
    } else {
      const commonAncestorContainer = getCommonAncestorContainer.call(this, from, to)
      console.log(commonAncestorContainer)
      rangeDel(commonAncestorContainer, to.node, from.node)
    }
  }
}

// position类型节点转化
function transToNode(args) {
  args.forEach((ele) => {
    if (typeof ele.node === 'string') {
      ele.node = getNode(this.ui.editableArea.vnode, ele.node)
    }
  })
  return args
}
/**
 * 单点删除
 */
// 节点内删除
function innerDel(from, to) {
  // 重新计算受影响的range端点
  // 先移动range在执行删除
  const points = this.selection
    .getRangePoints()
    .filter((point) => point.container === from.node.ele && point.offset >= from.pos)
    .map((point) => ({
      container: point.container,
      offset: point.offset - to,
      range: point.range,
      flag: point.flag,
    }))
  console.log(points)
  recoverRangePoint(points)
  from.node.delete(from.pos, to, true)
  // 添加br防止行塌陷
  if (isEmptyBlock(from.node)) {
    const brContainer = from.node.type === 'text' ? from.node.parent : from.node
    const brPos = from.node.type === 'text' ? getIndex(from.node) + 1 : from.pos
    if (!brContainer.childrens.some((vnode) => vnode.belong('placeholder'))) {
      const br = createVnode({ type: 'br', kind: 'placeholder' })
      brContainer.insert(br, brPos)
    }
  }
}
function clearBlock(block) {
  console.log(block.childrens.length)
  block.childrens.slice(0).forEach((node) => {
    node.remove()
  })
}
// 跨节点
function crossNodeDel(from, to, prev) {
  console.log('跨节点')
  // 首行删除
  // 404 没有找到前位点
  if (prev.flag === 404) {
    console.log('404')
    const block = getLayer(from.node)
    let points = this.selection.getRangePoints().filter((point) => point.container === from.node.ele)
    //  段落为空则初始化段落
    if (block.isEmpty) {
      clearBlock(block)
      const br = createVnode({ type: 'br', kind: 'placeholder' })
      block.insert(br, 1)
      points = points.map((point) => ({
        container: block.ele,
        offset: 0,
        range: point.range,
        flag: point.flag,
      }))
    } else if (from.node.isEmpty) {
      const next = getNextPoint(from.node, from.pos)
      points = points.map((point) => ({
        container: next.node.ele,
        offset: 0,
        range: point.range,
        flag: point.flag,
      }))
      deleteNode(from.node)
    }
    recoverRangePoint(points)
    return
  }
  // 重新计算受影响的range端点
  // 先移动range在执行删除
  console.log(`上一个叶子节点${prev.node.position}:`, prev.node)
  const points = this.selection
    .getRangePoints()
    .filter((point) => point.container === from.node.ele && point.offset === from.pos)
    .map((point) => {
      return {
        container: prev.node.ele,
        offset: prev.pos,
        range: point.range,
        flag: point.flag,
      }
    })
  console.log(points)
  recoverRangePoint(points)
  // 跨节点自动执行一步删除
  if (prev.flag === 1 || prev.flag === -1) {
    console.log('自动执行一步删除')
    // debugger
    const from = {
      node: prev.node,
      pos: prev.flag === 1 ? prev.pos + 1 : prev.pos,
    }
    del.call(this, [prev, 1])
    // 如果当前节点为空则递归向上删除空节点
    from.node.isEmpty && prev.flag === 1 && deleteNode(from.node)
  } else if (isEmptyBlock(from.node)) {
    deleteNode(from.node)
  } else {
    // 合并块
    console.log('合并块', to)
    const fromBlock = getLayer(from.node)
    const toBlock = getLayer(prev.node)
    fromBlock.childrens.slice(0).forEach((node, index) => {
      console.log(getIndex(prev.node), index)
      node.moveTo(toBlock, prev.pos + index)
    })
    fromBlock.remove()
  }
  this.selection.nativeSelection.removeAllRanges()
}
/**
 * 区间删除
 */
function getCommonAncestorContainer(from, to) {
  const toPos = to.node.position
  const fromPos = from.node.position
  for (let index = 0; index < toPos.length; index++) {
    const toLetter = toPos[index]
    const fromLetter = fromPos[index]
    if (toLetter !== fromLetter) {
      return getNode(this.ui.editableArea.vnode, toPos.slice(0, [(index || 1) - 1]))
    }
  }
}

function compareStart(vnode, start, end, samebranch = false) {
  const compareRes = comparePosition(vnode.position, start.position)
  if (compareRes === 0 && vnode.position !== start.position) {
    for (let index = vnode.childrens.length - 1; index >= 0; index--) {
      const element = vnode.childrens[index]
      compareStart(element, start, end, true)
    }
  } else if (compareRes == -1) {
    if (samebranch) {
      deleteNode(vnode)
    } else {
      compareEnd(vnode, end, false)
    }
  }
}
function compareEnd(vnode, end) {
  const compareRes = comparePosition(vnode.position, end.position)
  if (compareRes === 0 && vnode.position !== end.position) {
    for (let index = vnode.childrens.length - 1; index >= 0; index--) {
      const element = vnode.childrens[index]
      compareEnd(element, end)
    }
  } else if (compareRes == 1) {
    deleteNode(vnode)
  }
}
// 选区删除，删除两个节点之间的节点
export function rangeDel(commonAncestorContainer, startContainer, endContainer) {
  for (let index = commonAncestorContainer.childrens.length - 1; index >= 0; index--) {
    const element = commonAncestorContainer.childrens[index]
    compareStart(element, startContainer, endContainer)
  }
}
