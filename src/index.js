// import Cursor from './cursor'
import VNode from './vnode'
import Selection from './selection'
import testData from './test'
class Editor {
  constructor(id){
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
  }
  handMousedown() {
    setTimeout(()=>{
      const range = this.selection.getRangeAt(0)
      range&&range.updateCaret()
    })
  }
}
window.editor = new Editor('editor-root')
