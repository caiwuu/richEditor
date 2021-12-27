// import { setStyle, setAttr, setEvent } from '../utils/index'
// import { leafTag } from '../type/index'
// import action from '../actions'
// export default function render(vnode, parent = null, position = '0') {
//   if (!vnode.tag) throw 'arguments vnode.tag is required'
//   vnode.parent = parent
//   vnode.isRoot = !parent
//   if (!vnode.position) vnode.position = parent ? (parent.position ? parent.position + '-' + position : position) : position
//   if (!leafTag.includes(vnode.tag)) {
//     vnode.ele = document.createElement(vnode.tag)
//     vnode.ele.vnode = vnode
//     if (vnode.tag === 'a') {
//       vnode.ele.onclick = () => {
//         action.emit('test', 'vnode-value')
//       }
//     }
//     vnode.childrens &&
//       vnode.childrens.forEach((element, index) => {
//         vnode.ele.appendChild(render(element, vnode, index))
//       })
//   } else {
//     vnode.ele = vnode.tag === 'text' ? document.createTextNode(vnode.context) : document.createElement(vnode.tag)
//     vnode.ele.vnode = vnode
//   }
//   if (vnode.style) setStyle(vnode.ele, vnode.style)
//   if (vnode.attr) setAttr(vnode.ele, vnode.attr)
//   if (vnode.event) setEvent(vnode.ele, vnode.event)
//   return vnode.ele
// }

// const handle = {
//   set(target, key, newValue) {
//     console.log('set')
//     return Reflect.set(target, key, newValue)
//   },
//   get(target, key, receiver) {
//     console.log('get')
//     if (key === 'remove') {
//       return function () {
//         console.log('remove')
//       }
//     }
//     return Reflect.get(target, key)
//   },
// }
// function createVnode(ops, parent = null, position = '0') {
//   if (ops.tag) {
//     ops._isVnode = true
//     ops.parent = parent
//     ops.isRoot = !parent
//     if (!ops.position) ops.position = parent ? (parent.position ? parent.position + '-' + position : position) : position

//     if (!leafTag.includes(ops.tag)) {
//       ops.ele = document.createElement(ops.tag)
//       ops.ele.vnode = ops
//       if (ops.tag === 'a') {
//         ops.ele.onclick = () => {
//           action.emit('test', 'vnode-value')
//         }
//       }
//       ops.childrens &&
//         ops.childrens.forEach((element, index) => {
//           ops.ele.appendChild(createVnode(element, ops, index).ele)
//         })
//     } else {
//       ops.ele = ops.tag === 'text' ? document.createTextNode(ops.context) : document.createElement(ops.tag)
//       ops.ele.vnode = ops
//     }
//     if (ops.style) setStyle(ops.ele, ops.style)
//     if (ops.attr) setAttr(ops.ele, ops.attr)
//     if (ops.event) setEvent(ops.ele, ops.event)
//   }
//   for (const key in ops) {
//     if (ops.hasOwnProperty.call(ops, key)) {
//       const element = ops[key]
//       if (typeof element === 'object' && !['ele', 'style', 'attr', 'event', 'parent'].includes(key)) {
//         ops[key] = createVnode(element)
//       }
//     }
//   }
//   return new Proxy(ops, handle)
// }
// let test = createVnode({
//   tag: 'p',
//   childrens: [
//     {
//       tag: 'span',
//       childrens: [
//         {
//           tag: 'text',
//           context: 'hhha',
//         },
//       ],
//     },
//   ],
// })

// console.log(test)
