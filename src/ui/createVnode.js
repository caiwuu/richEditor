import { setStyle, setAttr, setEvent } from '../utils/index'
import { leafTag } from '../type/index'
import action from '../actions'
const handle = {
  set(target, key, newValue) {
    if (key === 'context') {
      console.log(target.ele)
      target.ele.data = newValue
    }
    return Reflect.set(target, key, newValue)
  },
  get(target, key, receiver) {
    if (key === 'remove') {
      return function () {
        console.log('remove')
      }
    }
    return Reflect.get(target, key, receiver)
  },
}
export default function createVnode(ops, parent = null, position = '0') {
  if (ops.tag) {
    ops._isVnode = true
    ops.parent = parent
    ops.isRoot = !parent
    if (!ops.position) ops.position = parent ? (parent.position ? parent.position + '-' + position : position) : position

    if (!leafTag.includes(ops.tag)) {
      ops.ele = document.createElement(ops.tag)
      if (ops.tag === 'a') {
        ops.ele.onclick = () => {
          action.emit('test', 'vnode-value')
        }
      }
    } else {
      ops.ele = ops.tag === 'text' ? document.createTextNode(ops.context) : document.createElement(ops.tag)
    }
    if (ops.style) setStyle(ops.ele, ops.style)
    if (ops.attr) setAttr(ops.ele, ops.attr)
    if (ops.event) setEvent(ops.ele, ops.event)
  }
  const vnode = new Proxy(ops, handle)
  if (vnode.ele) vnode.ele.vnode = vnode
  if (vnode.childrens) {
    vnode.childrens = vnode.childrens.map((element, index) => {
      const itemVnode = createVnode(element, vnode, index)
      vnode.ele.appendChild(itemVnode.ele)
      return itemVnode
    })
  }
  return vnode
}
