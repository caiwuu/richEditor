import { getPrevLeafNode, delVnode, getIndex, recoverRange, isEmptyBlock } from '../../utils'
import { blockTag } from '../../type'
import createVnode from '../../ui/createVnode'

export default function del(force = false) {
  if (this.inputState.isComposing && !force) return
  log('字符删除')
  if (this.collapsed) {
    // 行内操作
    if (this.endOffset) {
      log('行内del')
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
      // 添加br防止行塌陷
      if (isEmptyBlock(this.endContainer.vnode) && !this.endContainer.vnode.parent.childrens.some((vnode) => vnode.virtual)) {
        const br = createVnode({ type: 'br', virtual: true })
        this.endContainer.vnode.parent.insert(br, 1)
      }
      // 需要跨标签操作
    } else {
      // 获取上一个光标容器节点和跨越的节点
      const { vnode: prevVnode, layer } = getPrevLeafNode(this.endContainer.vnode)
      log(prevVnode)
      if (!prevVnode) return
      // 缓存改变前的状态
      const caches = this.vm.selection.ranges
        .filter((range) => range.endContainer === this.endContainer)
        .map((range) => ({
          endContainer: prevVnode.atom ? prevVnode.parent.ele : prevVnode.ele,
          offset:
            prevVnode.type === 'text' ? range.endOffset + prevVnode.length : prevVnode.atom ? getIndex(prevVnode) + 1 : range.endOffset,
          range,
        }))
      // 如果当前节点为空则递归向上删除空节点
      if (this.endContainer.vnode.isEmpty) {
        this.endContainer.vnode.parent.childrens.filter((vnode) => vnode.virtual).forEach((item) => item.remove())
        delVnode(this.endContainer.vnode)
      }
      recoverRange(caches)
      // 行内跨块级自动执行一步
      !blockTag.includes(layer.type) && this.del()
    }
  }
}
