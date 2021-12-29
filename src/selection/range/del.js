export default function del() {
  if (this.collapsed) {
    if (this.endOffset) {
      const caches = this.vm.selection.ranges
        .filter((range) => range.endContainer === this.endContainer)
        .map((range) => ({
          endContainer: range.endContainer,
          offset: range.endOffset >= this.endOffset ? range.endOffset - 1 : range.endOffset,
          range,
        }))
      this.endContainer.vnode.delete(this.endOffset, 1)
      caches.forEach((cache) => {
        cache.range.setEnd(cache.endContainer, cache.offset)
        cache.range.collapse(false)
        cache.range.updateCaret()
      })
    }
  }
}
