import render from './render'

export default class UI {
  constructor(editableAreaVnode, actionBarVnode) {
    this.editableAreaVnode = editableAreaVnode
    this.actionBarVnode = editableAreaVnode
    this.editableArea = render(editableAreaVnode, null)
    this.actionBar = render(actionBarVnode, null)
    this.editorContainer = document.createElement('div')
  }
  mount(id) {
    const root = document.getElementById(id)
    this.editableAreaVnode.parent = { ele: this.editorContainer, isRoot: true }
    root.appendChild(this.actionBar)
    this.editorContainer.appendChild(this.editableArea)
    root.appendChild(this.editorContainer)
    this.root = root
  }
  update(editableAreaVnode) {
    this.editableAreaVnode = editableAreaVnode
    const ele = render(editableAreaVnode, null)
    this.editableAreaVnode.parent = { ele: this.root, isRoot: true }
    document.getElementById(this.rootId).replaceChild(ele, this.editableAreaVnode)
    this.editableArea = ele
  }
}
