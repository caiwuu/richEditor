import { setStyle, setAttr, setEvent } from '../utils/index'
import { leafTag } from '../type/index'
import action from '../actions'
import operBar from './operBar'

function createVnode(vnode, parent = null, position = '0') {
  if (!vnode.tag) throw 'arguments vnode.tag is required'
  let dom = null
  vnode.parent = parent
  if (!vnode.position) vnode.position = parent ? (parent.position ? parent.position + '-' + position : position) : position
  if (!leafTag.includes(vnode.tag)) {
    dom = document.createElement(vnode.tag)
    dom.vnode = vnode
    vnode.dom = dom
    if (vnode.tag === 'a') {
      dom.onclick = () => {
        action.emit('test', 'vnode-value')
      }
    }
    vnode.childrens &&
      vnode.childrens.forEach((element, index) => {
        dom.appendChild(createVnode(element, vnode, index))
      })
  } else {
    dom = vnode.tag === 'text' ? document.createTextNode(vnode.context) : document.createElement(vnode.tag)
    dom.vnode = vnode
    vnode.dom = dom
  }
  if (vnode.style) setStyle(dom, vnode.style)
  if (vnode.attr) setAttr(dom, vnode.attr)
  if (vnode.event) setEvent(dom, vnode.event)
  return dom
}

export { createVnode }
export default class VNode {
  vnode
  dom
  rootId
  constructor(vnode) {
    this.vnode = vnode
    this.dom = createVnode(vnode, null)
  }
  initOperBar() {
    return createVnode(operBar)
  }
  mount(id) {
    this.rootId = id
    const root = document.getElementById(id)
    const editorContainer = document.createElement('div')
    this.vnode.parent = { dom: editorContainer, isRoot: true }
    root.appendChild(this.initOperBar())
    editorContainer.appendChild(this.dom)
    root.appendChild(editorContainer)
    return { editorContainer, editorBody: this.dom }
  }
  update(vnode, vm) {
    this.vnode = vnode
    const dom = createVnode(vnode, null)
    const parent = document.getElementById(this.rootId)
    this.vnode.parent = { dom: parent, isRoot: true }
    document.getElementById(this.rootId).replaceChild(dom, this.dom)
    this.dom = vm.editorBody = dom
  }
}
