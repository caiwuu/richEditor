import { getPrevLeafNode, delVnode, getIndex, recoverRange } from '../../utils'
import { blockTag } from '../../type'

export default function del() {
  if (this.inputState.isComposing) return
  console.log('字符删除')
  if (this.collapsed) {
    // 行内操作
    if (this.endOffset) {
      // 缓存改变前的状态
      const caches = this.vm.selection.ranges
        .filter((range) => range.endContainer === this.endContainer)
        .map((range) => ({
          endContainer: range.endContainer,
          offset: range.endOffset >= this.endOffset ? range.endOffset - 1 : range.endOffset,
          range,
        }))
      this.endContainer.vnode.delete(this.endOffset, 1)
      recoverRange(caches)
      // 需要跨标签操作
    } else {
      // 获取上一个光标容器节点和跨越的节点
      const { vnode: prevVnode, layer } = getPrevLeafNode(this.endContainer.vnode)
      console.log(prevVnode)
      // 缓存改变前的状态
      const caches = this.vm.selection.ranges
        .filter((range) => range.endContainer === this.endContainer)
        .map((range) => ({
          endContainer: prevVnode.atom ? prevVnode.parent.ele : prevVnode.ele,
          offset: prevVnode.tag === 'text' ? range.endOffset + prevVnode.length : prevVnode.atom ? getIndex(prevVnode) + 1 : range.endOffset,
          range,
        }))
      // 如果当前节点为空则递归向上删除空节点
      if (this.endContainer.vnode.isEmpty) {
        delVnode(this.endContainer.vnode)
      }
      recoverRange(caches)
      // 行内跨块级自动执行一步
      !blockTag.includes(layer.tag) && this.del()
    }
  }
}
