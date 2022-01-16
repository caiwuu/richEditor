import { getPrevLeafNode, delVnode, getIndex, recoverRange, isEmptyBlock } from '../utils'
import { blockTag } from '../type'
import createVnode from '../ui/createVnode'

export default function del(args) {
  console.log(args)
  // 不在此处
  // if (this.inputState.isComposing && !force) return
  const [from, to] = args
  console.log(from)
  console.log(to)
  if (typeof to === 'number') {
    // 行内操作
    if (from.pos) {
      log('行内del')
      // 缓存改变前的状态
      const caches = this.selection.ranges
        .filter((range) => range.endContainer === from.node.ele)
        .map((range) => ({
          endContainer: range.endContainer,
          offset: range.endOffset >= from.pos ? range.endOffset - 1 : range.endOffset,
          range,
        }))
      from.node.delete(from.pos, 1)
      recoverRange(caches)
      // 添加br防止行塌陷
      if (isEmptyBlock(from.node) && !from.node.parent.childrens.some((vnode) => vnode.virtual)) {
        const br = createVnode({ type: 'br', virtual: true })
        from.node.parent.insert(br, 1)
      }
      // 需要跨标签操作
    } else {
      // 获取上一个光标容器节点和跨越的节点
      console.log(from)
      const { vnode: prevVnode, layer } = getPrevLeafNode(from.node)
      log(prevVnode)
      if (!prevVnode) return
      // 缓存改变前的状态
      const caches = this.selection.ranges
        .filter((range) => range.endContainer === from.node.ele)
        .map((range) => ({
          endContainer: prevVnode.atom ? prevVnode.parent.ele : prevVnode.ele,
          offset: prevVnode.type === 'text' ? range.endOffset + prevVnode.length : prevVnode.atom ? getIndex(prevVnode) + 1 : range.endOffset,
          range,
        }))
      // 如果当前节点为空则递归向上删除空节点
      if (from.node.isEmpty) {
        from.node.parent.childrens.filter((vnode) => vnode.virtual).forEach((item) => item.remove())
        delVnode(from.node)
      }
      recoverRange(caches)
      // 行内跨块级自动执行一步
      if (!blockTag.includes(layer.type)) {
        console.log(prevVnode, prevVnode.length - 1)
        const from = { node: prevVnode, pos: prevVnode.length },
          to = 1
        del.call(this, [from, to])
      }
    }
  }
}
