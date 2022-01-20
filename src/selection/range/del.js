export default function del(force = false) {
  if (this.inputState.isComposing && !force) return
  const from = { node: this.endContainer.vnode, pos: this.endOffset }
  const to = this.collapsed ? 1 : { node: this.startContainer.vnode, pos: this.startOffset }
  this.editor.dispatch('del', from, to, force)
}
