import { getPrevLeafNode, deleteEmptyNode, getIndex, getNode, getLayer, recoverRangePoint, isEmptyBlock } from '../utils'
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
function clearBlock(block) {
  console.log(block.childrens.length)
  block.childrens.slice(0).forEach((node) => {
    console.log(node)
    node.remove()
  })
}
// 跨节点
function crossNodeDel(from, to) {
  console.log('跨节点')
  // 获取上一个光标容器节点和跨越的节点
  const { vnode: prevVnode, layer } = getPrevLeafNode(from.node)
  if (!prevVnode) {
    const block = getLayer(from.node)
    // 首行删除逻辑 清空段落增加br
    if (block.isEmpty) {
      clearBlock(block)
      const br = createVnode({ type: 'br', virtual: true })
      block.insert(br, 1)
      const points = this.selection
        .getRangePoints()
        .filter((point) => point.container === from.node.ele)
        .map((point) => ({
          container: block.ele,
          offset: 0,
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
    .map((point) => ({
      container: prevVnode.atom ? prevVnode.parent.ele : prevVnode.ele,
      offset: prevVnode.type === 'text' ? prevVnode.length : getIndex(prevVnode) + 1,
      range: point.range,
      flag: point.flag,
    }))
  recoverRangePoint(points)

  // 跨行级节点自动执行一步删除
  if (!blockTag.includes(layer.type)) {
    const from = {
      node: prevVnode.atom ? prevVnode.parent : prevVnode,
      pos: prevVnode.atom ? getIndex(prevVnode) + 1 : prevVnode.length,
    }
    del.call(this, [from, 1])
  }
  // 如果当前节点为空则递归向上删除空节点
  if (from.node.isEmpty) {
    deleteEmptyNode(from.node)
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
