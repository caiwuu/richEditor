// import render from './render'
import createVnode from './createVnode'

export default class UI {
  constructor(editableAreaVnode, actionBarVnode) {
    this.editableAreaVnode = createVnode(editableAreaVnode, null)
    this.actionBarVnode = createVnode(actionBarVnode, null)
    this.editableArea = this.editableAreaVnode.ele
    this.actionBar = this.actionBarVnode.ele
    this.editorContainer = document.createElement('div')
  }
  mount(id) {
    const root = document.getElementById(id)
    // this.editableAreaVnode.parent = { ele: this.editorContainer, isRoot: true }
    root.appendChild(this.actionBar)
    this.editorContainer.appendChild(this.editableArea)
    root.appendChild(this.editorContainer)
    this.root = root
  }
  update(editableAreaVnode) {
    this.editableAreaVnode = createVnode(editableAreaVnode, null)
    const ele = this.editableAreaVnode.ele
    // this.editableAreaVnode.parent = { ele: this.editorContainer, isRoot: true }
    document.getElementById(this.rootId).replaceChild(ele, this.editableArea)
    this.editableArea = ele
  }
}
