export default function enter() {
  log('enter')
  if (!this.collapsed) {
    this.del()
  }
  this.vm.dispatch('lineFeed', { node: this.endContainer.vnode, pos: this.endOffset })
}
