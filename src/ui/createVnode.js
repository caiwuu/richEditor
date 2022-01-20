import { setStyle, setAttr, setEvent, getIndex, isEmptyNode, normalize, reArrangement } from '../utils/index'
import { leafTag } from '../type/index'
/**
 * 节点操作代理 vnode update ----> dom update
 */
const handle = {
  set(target, key, newValue) {
    // ui 更新
    switch (key) {
      case 'context':
        target.ele.data = newValue
        break
    }
    return Reflect.set(target, key, newValue)
  },
  get(target, key, receiver) {
    switch (key) {
      case 'insert':
        log('insert')
        return function (vnode, pos) {
          log(target, pos)
          pos = pos === undefined ? receiver.length : pos
          if (target.childrens.length > pos) {
            if (pos === 0) {
              target.ele.insertBefore(vnode.ele, target.ele.childNodes[0])
            } else {
              target.ele.insertBefore(vnode.ele, target.ele.childNodes[pos - 1].nextSibling)
            }
          } else {
            target.ele.appendChild(vnode.ele)
          }
          target.childrens.splice(pos, 0, vnode)
          receiver.reArrangement()
        }
      case 'delete':
        return function (offset, count, isNormalize = true) {
          const start = offset - count <= 0 ? 0 : offset - count
          if (target.type === 'text') {
            target.context = target.context.slice(0, start) + target.context.slice(offset)
            target.ele.data = target.context
          } else {
            target.childrens.splice(start, offset - start).forEach((vnode) => vnode.ele.remove())
            receiver.reArrangement()
          }
        }
      case 'moveTo':
        log('moveTo')
        return function (T, pos) {
          const index = getIndex(target)
          // removeNodes reArrangement必须在执行insert之前，因为inset之后会改变parent
          const removeNodes = target.parent.childrens.splice(index, 1)
          receiver.parent.reArrangement()
          removeNodes.forEach((vnode) => {
            T.insert(vnode, pos)
          })
        }
      case 'normalize':
        return function () {
          receiver.childrens && normalize(receiver)
        }
      case 'remove':
        return function (isNormalize = true) {
          const index = getIndex(target)
          target.parent.childrens.splice(index, 1).forEach((i) => i.ele.remove())
          isNormalize && target.parent.normalize()
          reArrangement(target.parent)
        }
      case 'isEmpty':
        return isEmptyNode(target)
      case 'length':
        try {
          return target.type === 'text' ? target.context.length : target.childrens.filter((ele) => !ele.virtual).length
        } catch (error) {
          throw new Error('atom node is no length attribute')
        }
      case 'reArrangement':
        return function () {
          reArrangement(receiver)
        }
      default:
        return Reflect.get(target, key, receiver)
    }
  },
}
/**
 * 节点字段说明：
 * position 标识节点的位置层级信息
 * isRoot 是否根节点
 * virtual 非实体节点，不描述具体内容，充当支撑文档结构的作用
 * style 样式
 * attr 属性
 * event dom事件
 * type 节点类型
 * ele 真实dom
 * atom 原子节点 无子集，内容不可分割
 */
export default function createVnode(ops, parent = null, position = '0') {
  if (ops.type) {
    ops.parent = parent
    ops._isVnode = true
    ops.isRoot = !parent
    if (!ops.position) ops.position = parent ? (parent.position ? parent.position + '-' + position : position) : position
    if (!leafTag.includes(ops.type)) {
      ops.ele = document.createElement(ops.type)
    } else {
      ops.ele = ops.type === 'text' ? document.createTextNode(ops.context) : document.createElement(ops.type)
    }
    if (ops.style) setStyle(ops.ele, ops.style)
    if (ops.attr) setAttr(ops.ele, ops.attr)
    if (ops.event) setEvent(ops.ele, ops.event)
    // if (ops.type === 'img') {
    if (['br', 'img'].includes(ops.type)) {
      ops.atom = true
    }
  }
  const vnode = new Proxy(ops, handle)
  if (ops.listen) {
    const fn =
      ops.listen.onMessage ||
      ((vnode, args) => {
        // TODO
        console.log('这里写默认行为', vnode, args)
      })
    ops.listen.emitter.on(ops.listen.key, (args) => {
      fn(vnode, args)
    })
  }
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
