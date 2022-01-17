export default function del(force = false) {
  if (this.inputState.isComposing && !force) return
  const from = { node: this.endContainer.vnode, pos: this.endOffset },
    to = this.collapsed ? 1 : { node: this.startContainer.vnode, pos: this.startOffset }
  this.vm.dispatch('del', from, to, force)
}
