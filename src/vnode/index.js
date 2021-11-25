import { styleSet, attrSet } from '../utils/index'
function createVnode(vnode, parent = null, position = '0') {
  if (!vnode.tag) throw 'arguments vnode.tag is required'
  let dom = null
  vnode.parent = parent
  if (!vnode.position) vnode.position = parent ? (parent.position ? parent.position + '-' + position : position) : position
  if (vnode.tag !== 'text' && vnode.tag !== 'br') {
    dom = document.createElement(vnode.tag)
    dom.vnode = vnode
    vnode.dom = dom
    vnode.childrens &&
      vnode.childrens.forEach((element, index) => {
        dom.appendChild(createVnode(element, vnode, index))
      })
  } else {
    dom = vnode.tag === 'text' ? document.createTextNode(vnode.context) : document.createElement(vnode.tag)
    dom.vnode = vnode
    vnode.dom = dom
  }
  if (vnode.style) styleSet(dom, vnode.style)
  if (vnode.attr) attrSet(dom, vnode.attr)
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
  mount(id) {
    this.rootId = id
    const parent = document.getElementById(id)
    this.vnode.parent = { dom: parent, isRoot: true }
    return parent.appendChild(this.dom)
  }
  update(vnode) {
    this.vnode = vnode
    const dom = createVnode(vnode, null)
    const parent = document.getElementById(this.rootId)
    this.vnode.parent = { dom: parent, isRoot: true }
    document.getElementById(this.rootId).replaceChild(dom, this.dom)
    this.dom = dom
  }
}
