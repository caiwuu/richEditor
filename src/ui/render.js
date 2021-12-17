import { setStyle, setAttr, setEvent } from '../utils/index'
import { leafTag } from '../type/index'
import action from '../actions'
export default function render(vnode, parent = null, position = '0') {
  if (!vnode.tag) throw 'arguments vnode.tag is required'
  vnode.parent = parent
  if (!vnode.position) vnode.position = parent ? (parent.position ? parent.position + '-' + position : position) : position
  if (!leafTag.includes(vnode.tag)) {
    vnode.ele = document.createElement(vnode.tag)
    vnode.ele.vnode = vnode
    if (vnode.tag === 'a') {
      vnode.ele.onclick = () => {
        action.emit('test', 'vnode-value')
      }
    }
    vnode.childrens &&
      vnode.childrens.forEach((element, index) => {
        vnode.ele.appendChild(render(element, vnode, index))
      })
  } else {
    vnode.ele = vnode.tag === 'text' ? document.createTextNode(vnode.context) : document.createElement(vnode.tag)
    vnode.ele.vnode = vnode
  }
  if (vnode.style) setStyle(vnode.ele, vnode.style)
  if (vnode.attr) setAttr(vnode.ele, vnode.attr)
  if (vnode.event) setEvent(vnode.ele, vnode.event)
  return vnode.ele
}
