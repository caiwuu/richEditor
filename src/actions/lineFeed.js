import { getIndex, recoverRangePoint, getHead, isEmptyBlock } from '../utils'
import createVnode from '../vnode'
/**
 * // 节点分裂算法
 * @param {*} vnode
 * @param {*} pos
 * @returns
 */
function splitNode(vnode, pos, caches) {
  if (!pos && !vnode.belong('block')) {
    return { parent: vnode.parent, pos: getIndex(vnode) }
  } else if (pos === vnode.length && !vnode.belong('block')) {
    this.selection
      .getRangePoints()
      .filter((point) => point.container === vnode.ele && point.offset >= pos)
      .forEach((ele) => caches.push(ele))
    return { parent: vnode.parent, pos: getIndex(vnode) + 1 }
  }
  if (vnode.type === 'text') {
    const restText = vnode.context.slice(0, pos)
    const splitedText = vnode.context.slice(pos)
    const index = getIndex(vnode)
    const ops = { type: 'text', context: splitedText }
    const newVnode = createVnode(ops, vnode.parent)
    this.selection
      .getRangePoints()
      .filter((point) => point.container === vnode.ele && point.offset >= pos)
      .forEach((ele) => {
        caches.push({ container: newVnode.ele, offset: ele.offset - pos, flag: ele.flag, range: ele.range })
      })
    vnode.context = restText
    vnode.parent.insert(newVnode, index + 1)
    return { parent: vnode.parent, pos: index + 1, vnode: newVnode }
  } else if (vnode.belong('inline')) {
    const index = getIndex(vnode)
    const ops = { type: vnode.type, childrens: [], style: vnode.style, attr: vnode.attr, event: vnode.event }
    const newVnode = createVnode(ops, vnode.parent)
    const needMoveNodes = vnode.childrens.slice(pos)
    this.selection
      .getRangePoints()
      .filter((point) => point.container === vnode.ele && point.offset >= pos)
      .forEach((ele) => {
        caches.push({ container: newVnode.ele, offset: ele.offset - pos, flag: ele.flag, range: ele.range })
      })
    needMoveNodes.forEach((node) => {
      node.moveTo(newVnode)
    })
    vnode.parent.insert(newVnode, index + 1)
    return { parent: vnode.parent, pos: index + 1, vnode: newVnode }
  } else if (vnode.belong('block')) {
    const index = getIndex(vnode)
    const ops = { type: vnode.type, childrens: [] }
    const newVnode = createVnode(ops, vnode.parent)
    const needMoveNodes = vnode.length ? vnode.childrens.slice(pos) : []
    const endflag = caches.length > 0

    this.selection
      .getRangePoints()
      .filter((point) => point.container === vnode.ele && point.offset >= pos)
      .forEach((ele) => {
        caches.push({ container: newVnode.ele, offset: ele.offset - pos, flag: ele.flag, range: ele.range })
      })
    if (needMoveNodes.length > 0) {
      needMoveNodes.forEach((node) => {
        node.moveTo(newVnode)
      })
    } else if (!isEmptyBlock(vnode)) {
      const br = createVnode({ type: 'br', kind: 'placeholder' })
      newVnode.insert(br)
    }
    if (pos === 0 && needMoveNodes.length) {
      const br = createVnode({ type: 'br', kind: 'placeholder' })
      vnode.insert(br)
    }
    vnode.parent.insert(newVnode, index + 1)
    endflag &&
      caches.forEach((ele) => {
        ele.container = getHead(newVnode, 0, 0).node.ele
        ele.offset = 0
      })
    return { parent: vnode.parent, pos: index + 1, vnode: newVnode }
  }
}
export default function lineFeed(args) {
  const [from] = args
  from.caches = from.caches || []
  const { parent, pos } = splitNode.call(this, from.node, from.pos, from.caches)
  if (!from.node.belong('block')) {
    lineFeed.call(this, [{ node: parent, pos, caches: from.caches }])
  } else {
    recoverRangePoint(from.caches)
  }
}
