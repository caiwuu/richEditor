export default function del() {
  // console.log(22)
  if (this.collapsed) {
    return {
      type: 'del',
      startPos: this.startContainer.vnode.position,
      startOffset: this.startOffset - 1,
      endPos: this.endContainer.vnode.position,
      endOffset: this.endOffset,
      range: this,
    }
  } else {
    console.log('uncollapsed is unsupported')
  }
}
