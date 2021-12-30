import { getPrevLeafNode } from '../../utils'
export default function del() {
  if (this.collapsed) {
    // 行内操作
    if (this.endOffset) {
      const caches = this.vm.selection.ranges
        .filter((range) => range.endContainer === this.endContainer)
        .map((range) => ({
          endContainer: range.endContainer,
          offset: range.endOffset >= this.endOffset ? range.endOffset - 1 : range.endOffset,
          range,
        }))
      console.log(caches)
      this.endContainer.vnode.delete(this.endOffset, 1)
      caches.forEach((cache) => {
        cache.range.setEnd(cache.endContainer, cache.offset)
        cache.range.collapse(false)
        cache.range.updateCaret()
      })
      // 需要跨标签操作
    } else {
      const { vnode: prevVnode, layer } = getPrevLeafNode(this.endContainer.vnode)
      console.log('====')
      if (this.endContainer.vnode.isEmpty) {
        console.log('isEmpty')
        this.endContainer.vnode.remove()
      }
    }
    console.log(this.endContainer.vnode)
  }
}
