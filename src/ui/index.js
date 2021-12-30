// import render from './render'
import createVnode from './createVnode'

export default class UI {
  constructor(editableAreaOps, actionBarOps) {
    this.editableArea = createVnode(editableAreaOps, null).ele
    this.actionBar = createVnode(actionBarOps, null).ele
    this.editorContainer = document.createElement('div')
  }
  mount(id) {
    const root = document.getElementById(id)
    root.appendChild(this.actionBar)
    this.editorContainer.appendChild(this.editableArea)
    root.appendChild(this.editorContainer)
    this.root = root
  }
  update(editableAreaOps) {
    const ele = createVnode(editableAreaOps, null).ele
    document.getElementById(this.rootId).replaceChild(ele, this.editableArea)
    this.editableArea = ele
  }
}
