import { getPrevPoint, deleteNode, getIndex, getNode, getLayer, recoverRangePoint, isEmptyBlock, comparePosition } from '../utils'
import createVnode from '../vnode'
export default function del(args) {
  const [from, to] = transToNode.call(this, args)
  console.log(from, to)
  if (typeof to === 'number') {
    // 行内操作
    if (from.pos && !from.node.isEmpty) {
      innerDel.call(this, from, to)
      // 需要跨标签操作
    } else {
      crossNodeDel.call(this, from, to)
    }
  } else {
    // 区间删除
    if (from.node === to.node) {
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
  console.log(from)
  console.log('节点内删除')
  // 重新计算受影响的range端点
  // 先移动range在执行删除
  const points = this.selection
    .getRangePoints()
    .filter((point) => point.container === from.node.ele)
    .map((point) => ({
      container: point.container,
      offset: point.offset >= from.pos ? point.offset - to : point.offset,
      range: point.range,
      flag: point.flag,
    }))
  recoverRangePoint(points)
  from.node.delete(from.pos, to, true)
  // 添加br防止行塌陷
  if (isEmptyBlock(from.node) && !from.node.parent.childrens.some((vnode) => vnode.belong('placeholder'))) {
    const br = createVnode({ type: 'br', kind: 'placeholder' })
    from.node.parent.insert(br, 1)
  }
}
function clearBlock(block) {
  console.log(block.childrens.length)
  block.childrens.slice(0).forEach((node) => {
    node.remove()
  })
}
// 跨节点
function crossNodeDel(from, to) {
  console.log('跨节点')
  // 获取上一个光标容器节点和跨越的节点
  const { vnode: prevVnode, pos, flag } = getPrevPoint(from.node)
  // 首行删除
  if (flag === 404) {
    const block = getLayer(from.node)
    //  清空段落增加br
    if (block.isEmpty) {
      clearBlock(block)
      const br = createVnode({ type: 'br', kind: 'placeholder' })
      block.insert(br, 1)
      const points = this.selection
        .getRangePoints()
        .filter((point) => point.container === from.node.ele)
        .map((point) => ({
          container: block.ele,
          offset: 1,
          range: point.range,
          flag: point.flag,
        }))
      recoverRangePoint(points)
    }
    return
  }
  // 重新计算受影响的range端点
  // 先移动range在执行删除
  console.log(`上一个叶子节点${prevVnode.position}:`, prevVnode)
  const points = this.selection
    .getRangePoints()
    .filter((point) => point.container === from.node.ele && point.offset === from.pos)
    .map((point) => {
      console.log(prevVnode)
      return {
        container: prevVnode.belong('atom') ? prevVnode.parent.ele : prevVnode.ele,
        offset: prevVnode.type === 'text' ? prevVnode.length : getIndex(prevVnode) + 1,
        range: point.range,
        flag: point.flag,
      }
    })
  recoverRangePoint(points)
  // 跨行级节点自动执行一步删除
  if (flag === 1 || flag === -1) {
    const from = {
      node: prevVnode.belong('atom') ? prevVnode.parent : prevVnode,
      pos: prevVnode.belong('atom') ? getIndex(prevVnode) + 1 : prevVnode.length,
    }
    del.call(this, [from, 1])
    // 如果当前节点为空则递归向上删除空节点
    from.node.isEmpty && deleteNode(from.node)
  } else if (isEmptyBlock(from.node)) {
    from.node.isEmpty && deleteNode(from.node)
  } else {
    // 合并块
    console.log('合并块', to)
    const fromBlock = getLayer(from.node)
    const toBlock = getLayer(prevVnode)
    fromBlock.childrens.slice(0).forEach((node, index) => {
      console.log(getIndex(prevVnode), index)
      node.moveTo(toBlock, getIndex(prevVnode) + 1 + index)
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
