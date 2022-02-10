import { setStyle, setAttr, setEvent } from '../utils/index'
import handle from './proxyHandle'
function getKind(ops) {
  // placeholder 类型需要手动指定
  if (ops.kind) return ops.kind
  if (['p', 'div', 'li', 'ul', 'ol'].includes(ops.type)) return 'block'
  if (['span', 'a', 'text', 'sub', 'sup', 'code', 'strong', 'u', 'del', 'em'].includes(ops.type)) return 'inline'
  if (['img', 'br'].includes(ops.type)) return 'atom'
}

/**
 * 节点字段说明：
 * position 标识节点的位置层级信息
 * isRoot 是否根节点
 * style 样式
 * attr 属性
 * event dom事件
 * type 节点类型
 * ele 真实dom
 * atom 原子节点 无子集，内容不可分割
 */
export default function createVnode(ops, parent = null, position = '0') {
  if (ops.type) {
    ops.h = createVnode
    ops.index = position / 1
    ops.parent = parent
    ops._isVnode = true
    ops.isRoot = !parent
    ops.kind = getKind(ops) || 'unknow'
    if (!ops.position) ops.position = parent ? (parent.position ? parent.position + '-' + position : position) : position
    if (typeof ops.render === 'function') {
      ops.ele = ops.render()
      delete ops.render
    } else if (ops.type === 'text') {
      ops.ele = document.createTextNode(ops.context)
    } else {
      ops.ele = document.createElement(ops.type)
    }
    if (ops.style) setStyle(ops.ele, ops.style)
    if (ops.attr) setAttr(ops.ele, ops.attr)
    if (ops.event) setEvent(ops.ele, ops.event)
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
  } else if (vnode.belong('block')) {
    vnode.childrens = []
  }
  return vnode
}
