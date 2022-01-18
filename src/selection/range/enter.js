export default function enter() {
  log('enter')
  this.editor.dispatch('lineFeed', { node: this.endContainer.vnode, pos: this.endOffset })
}
