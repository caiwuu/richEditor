import { setStyle, setAttr, setEvent } from '../utils/index'
import { leafTag } from '../type/index'
import action from '../actions'
const handle = {
  set(target, key, newValue) {
    console.log('set')
    Reflect.set(target, key, newValue)
  },
  get(target, key, receiver) {
    console.log('get')
    if (key === 'remove') {
      return function () {
        console.log('remove')
      }
    }
    return Reflect.get(target, key)
  },
}
function createVnode(ops, parent = null, position = '0') {
  ops._isVnode = true
  ops.parent = parent
  ops.isRoot = !parent
  if (!ops.position) ops.position = parent ? (parent.position ? parent.position + '-' + position : position) : position

  if (!leafTag.includes(ops.tag)) {
    ops.ele = document.createElement(vnode.tag)
    ops.ele.vnode = ops
    if (ops.tag === 'a') {
      ops.ele.onclick = () => {
        action.emit('test', 'vnode-value')
      }
    }
    ops.childrens &&
      ops.childrens.forEach((element, index) => {
        ops.ele.appendChild(createVnode(element, ops, index).ele)
      })
  } else {
    ops.ele = ops.tag === 'text' ? document.createTextNode(ops.context) : document.createElement(ops.tag)
    ops.ele.vnode = ops
  }
  if (ops.style) setStyle(ops.ele, ops.style)
  if (ops.attr) setAttr(ops.ele, ops.attr)
  if (ops.event) setEvent(ops.ele, ops.event)

  // for (const key in ops) {
  //   if (ops.hasOwnProperty.call(ops, key)) {
  //     const element = ops[key]
  //     if (typeof element === 'object' && !['ele', 'style', 'attr', 'event', 'parent'].includes(key)) {
  //       ops[key] = createVnode(element)
  //     }
  //   }
  // }
  return new Proxy(ops, handle)
}
createVnode({
  tag: 'p',
  childrens: [
    {
      tag: 'span',
      childrens: [
        {
          tag: 'text',
          context: 'hhha',
        },
      ],
    },
  ],
})
