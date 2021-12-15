// import Cursor from './cursor'
import VNode from './vnode'
import Selection from './selection'
import testData from './test'
class Editor {
  constructor(id) {
    this.vnode = new VNode(testData)
    const { editorContainer, editorBody } = this.vnode.mount(id)
    this.editorBody = editorBody
    this.editorContainer = editorContainer
    this.root = document.getElementById(id)
    this.selection = new Selection(this)
    this.addListeners()
  }
  addListeners() {
    this.editorContainer.addEventListener('mousedown', this.handMousedown.bind(this))
    document.addEventListener('keydown', this.handGolobalKeydown.bind(this))
  }
  handMousedown(event) {
    console.log(event.altKey)
    this.selection.updateRanges(event.altKey)
  }
  handGolobalKeydown(event) {
    const key = event.key
    console.log(key)
    switch (key) {
      case 'ArrowRight':
        this.selection.move('right')
        break
      case 'ArrowLeft':
        this.selection.move('left')
        break
    }
  }
}
window.editor = new Editor('editor-root')
