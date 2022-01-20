import { getPrevLeafNode, deleteEmptyNode, getIndex, getNode, recoverRangePoint, isEmptyBlock } from '../utils'
import { blockTag } from '../type'
import createVnode from '../ui/createVnode'
export default function del(args) {
  const [from, to] = transToNode.call(this, args)
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
    rangeDel.call(this, from, to)
  }
}

function computeOffset(prevVnode, point, from) {
  if (prevVnode.type === 'text') {
    return point.offset + prevVnode.length
  } else {
    return getIndex(prevVnode) + 1
  }
}
// position类型节点转化
function transToNode(args) {
  console.log(args)
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
  if (isEmptyBlock(from.node) && !from.node.parent.childrens.some((vnode) => vnode.virtual)) {
    const br = createVnode({ type: 'br', virtual: true })
    from.node.parent.insert(br, 1)
  }
}
// 跨节点
function crossNodeDel(from, to) {
  console.log('行级跨节点')
  // 获取上一个光标容器节点和跨越的节点
  const { vnode: prevVnode, layer } = getPrevLeafNode(from.node)
  console.log(`上一个叶子节点${prevVnode.position}:`, prevVnode.root)
  if (!prevVnode) return
  // 重新计算受影响的range端点
  // 先移动range在执行删除
  const points = this.selection
    .getRangePoints()
    .filter((point) => point.container === from.node.ele && point.offset === from.pos)
    .map((point) => ({
      container: prevVnode.atom ? prevVnode.parent.ele : prevVnode.ele,
      offset: prevVnode.type === 'text' ? prevVnode.length : getIndex(prevVnode) + 1,
      range: point.range,
      flag: point.flag,
    }))
  recoverRangePoint(points)
  // 如果当前节点为空则递归向上删除空节点
  if (from.node.isEmpty) {
    deleteEmptyNode(from.node)
  }
  // 跨行级节点自动执行一步删除
  if (!blockTag.includes(layer.type)) {
    const from = {
      node: prevVnode.atom ? prevVnode.parent : prevVnode,
      pos: prevVnode.atom ? getIndex(prevVnode) + 1 : prevVnode.length,
    }
    del.call(this, [from, 1])
  }
}
/**
 * 区间删除
 */
function rangeDel(from, to) {
  console.log('区间删除')
  // 节点内区间转化成单点
  if (from.node === to.node) {
    innerDel.call(this, from, from.pos - to.pos)
  }
}
