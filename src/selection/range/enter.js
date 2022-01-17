export default function enter() {
  log('enter')
  this.vm.dispatch('lineFeed', { node: this.endContainer.vnode, pos: this.endOffset })
}
