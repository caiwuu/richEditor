import { setStyle, setAttr, setEvent } from '../utils/index'
import { leafTag } from '../type/index'
import action from '../actions'
import operBar from './operBar'

export function createVnode(vnode, parent = null, position = '0') {
  if (!vnode.tag) throw 'arguments vnode.tag is required'
  let ele = null
  vnode.parent = parent
  if (!vnode.position) vnode.position = parent ? (parent.position ? parent.position + '-' + position : position) : position
  if (!leafTag.includes(vnode.tag)) {
    ele = document.createElement(vnode.tag)
    ele.vnode = vnode
    vnode.ele = ele
    if (vnode.tag === 'a') {
      ele.onclick = () => {
        action.emit('test', 'vnode-value')
      }
    }
    vnode.childrens &&
      vnode.childrens.forEach((element, index) => {
        ele.appendChild(createVnode(element, vnode, index))
      })
  } else {
    ele = vnode.tag === 'text' ? document.createTextNode(vnode.context) : document.createElement(vnode.tag)
    ele.vnode = vnode
    vnode.ele = ele
  }
  if (vnode.style) setStyle(ele, vnode.style)
  if (vnode.attr) setAttr(ele, vnode.attr)
  if (vnode.event) setEvent(ele, vnode.event)
  return ele
}
export default class VNode {
  vnode
  ele
  rootId
  constructor(vnode) {
    this.vnode = vnode
    this.ele = createVnode(vnode, null)
  }
  initOperBar() {
    return createVnode(operBar)
  }
  mount(id) {
    this.rootId = id
    const root = document.getElementById(id)
    const editorContainer = document.createElement('div')
    this.vnode.parent = { ele: editorContainer, isRoot: true }
    root.appendChild(this.initOperBar())
    editorContainer.appendChild(this.ele)
    root.appendChild(editorContainer)
    return { editorContainer, editorBody: this.ele }
  }
  update(vnode, vm) {
    this.vnode = vnode
    const ele = createVnode(vnode, null)
    const parent = document.getElementById(this.rootId)
    this.vnode.parent = { ele: parent, isRoot: true }
    document.getElementById(this.rootId).replaceChild(ele, this.ele)
    this.ele = vm.editorBody = ele
  }
}
