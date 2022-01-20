import { getPrevLeafNode, delVnode, getIndex, recoverRangePoint, isEmptyBlock } from '../utils'
import { blockTag } from '../type'
import createVnode from '../ui/createVnode'
export default function del(args) {
  const [from, to] = args
  if (!to) {
    // 行内操作
    if (from.pos && !from.node.isEmpty) {
      console.log(from.pos)
      console.log('行内del')
      // 缓存改变前的状态
      const points = this.selection
        .getRangePoints()
        .filter((point) => point.container === from.node.ele)
        .map((point) => ({
          container: point.container,
          offset: point.offset >= from.pos ? point.offset - 1 : point.offset,
          range: point.range,
          flag: point.flag,
        }))
      from.node.delete(from.pos, 1, false)
      console.log(points)
      recoverRangePoint(points)
      from.node.normalize()
      // 添加br防止行塌陷
      if (isEmptyBlock(from.node) && !from.node.parent.childrens.some((vnode) => vnode.virtual)) {
        const br = createVnode({ type: 'br', virtual: true })
        from.node.parent.insert(br, 1)
      }
      // 需要跨标签操作
    } else {
      console.log('跨标签')
      // 获取上一个光标容器节点和跨越的节点
      const { vnode: prevVnode, layer } = getPrevLeafNode(from.node)
      console.log(prevVnode)
      if (!prevVnode) return
      // 缓存改变前的状态
      const points = this.selection
        .getRangePoints()
        .filter((point) => point.container === from.node.ele && point.offset === from.pos)
        .map((point) => ({
          container: prevVnode.atom ? prevVnode.parent.ele : prevVnode.ele,
          offset: computeOffset(prevVnode, point, from),
          range: point.range,
          flag: point.flag,
        }))
      // 如果当前节点为空则递归向上删除空节点
      if (from.node.isEmpty) {
        from.node.parent.childrens.filter((vnode) => vnode.virtual).forEach((item) => item.remove())
        delVnode(from.node)
      }
      console.log(points)
      recoverRangePoint(points)
      // 行内跨块级自动执行一步
      if (!blockTag.includes(layer.type)) {
        const from = {
          node: prevVnode.atom ? prevVnode.parent : prevVnode,
          pos: prevVnode.atom ? getIndex(prevVnode) + 1 : prevVnode.length,
        }
        del.call(this, [from, null])
      }
    }
  }
}

function computeOffset(prevVnode, point, from) {
  if (from.node.isEmpty) {
    return prevVnode.length
  } else if (prevVnode.type === 'text') {
    return point.offset + prevVnode.length
  } else if (prevVnode.atom) {
    return getIndex(prevVnode) + 1
  }
}
