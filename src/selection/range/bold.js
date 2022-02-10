export default function bold() {
  log('bold')
  if (this.collapsed) {
    return
  }
  const from = { node: this.endContainer.vnode, pos: this.endOffset }
  const to = { node: this.startContainer.vnode, pos: this.startOffset }
  this.vm.dispatch('bold', from, to)
}
