import { setStyle, setAttr, setEvent } from '../utils/index'
import { leafTag } from '../type/index'
import action from '../actions'
/**
 * 节点操作类型 insert delete move
 */
const handle = {
  set(target, key, newValue) {
    return Reflect.set(target, key, newValue)
  },
  get(target, key, receiver) {
    if (key === '') {
      return function () {
        console.log('remove')
      }
    }
    switch (key) {
      case 'insert':
        console.log('insert')
      case 'delete':
        return function (offset, count) {
          const start = offset - count <= 0 ? 0 : offset - count
          if (target.tag === 'text') {
            target.context = target.context.slice(0, start) + target.context.slice(offset)
            target.ele.data = target.context
          }
        }
      case 'move':
        console.log('move')
      case 'remove':
        console.log('remove')
      default:
        return Reflect.get(target, key, receiver)
    }
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
  vnode.root = parent ? parent.root : vnode
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
