export default function del() {
  // console.log(22)
  return {
    type: 'del',
    startPos: this.startContainer.vnode,
    startOffset: this.startOffset - 1,
    endPos: this.endContainer.vnode,
    endOffset: this.endOffset,
    rootTree: this.vm.ui.editableAreaVnode,
  }
}
