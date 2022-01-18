import { recoverRangePoint, getIndex } from '../utils'
import createVnode from '../ui/createVnode'
import { blockTag } from '../type'
/**
 * // 节点分裂算法
 * @param {*} vnode
 * @param {*} pos
 * @returns
 */
function splitNode(vnode, pos, caches) {
  switch (vnode.type) {
    case 'text':
      if (!pos) {
        return { parent: vnode.parent, pos: getIndex(vnode) }
      } else {
        const restText = vnode.context.slice(0, pos),
          splitedText = vnode.context.slice(pos),
          index = getIndex(vnode),
          ops = { type: 'text', context: splitedText },
          newVnode = createVnode(ops, vnode.parent),
          points = this.selection.getRangePoints()
        points
          .filter((point) => point.container === vnode.ele && point.offset >= pos)
          .forEach((ele) => {
            caches.push({ container: newVnode.ele, offset: ele.offset - pos, flag: ele.flag, range: ele.range })
          })
        vnode.context = restText
        vnode.parent.insert(newVnode, index + 1)
        return { parent: vnode.parent, pos: index + 1, vnode: newVnode }
      }
    case 'span':
    case 'a': {
      const index = getIndex(vnode),
        ops = { type: vnode.type, childrens: [], style: vnode.style },
        newVnode = createVnode(ops, vnode.parent),
        needMoveNodes = vnode.childrens.slice(pos),
        points = this.selection.getRangePoints()
      points
        .filter((point) => point.container === vnode.ele && point.offset >= pos)
        .forEach((ele) => {
          caches.push({ container: newVnode.ele, offset: ele.offset - pos, flag: ele.flag, range: ele.range })
        })
      needMoveNodes.forEach((node) => {
        node.moveTo(newVnode)
      })
      vnode.parent.insert(newVnode, index + 1)
      return { parent: vnode.parent, pos: index + 1, vnode: newVnode }
    }
    case 'li':
    case 'p':
    case 'div': {
      const index = getIndex(vnode),
        ops = { type: vnode.type, childrens: [] },
        newVnode = createVnode(ops, vnode.parent),
        needMoveNodes = vnode.childrens.slice(pos),
        points = this.selection.getRangePoints()
      points
        .filter((point) => point.container === vnode.ele && point.offset >= pos)
        .forEach((ele) => {
          caches.push({ container: newVnode.ele, offset: ele.offset - pos, flag: ele.flag, range: ele.range })
        })
      needMoveNodes.forEach((node) => {
        node.moveTo(newVnode)
      })
      vnode.parent.insert(newVnode, index + 1)
      return { parent: vnode.parent, pos: index + 1, vnode: newVnode }
    }
  }
}
export default function lineFeed(args) {
  const [from] = args
  from.caches = from.caches || []
  const { parent, pos } = splitNode.call(this, from.node, from.pos, from.caches)
  if (!blockTag.includes(from.node.type)) {
    lineFeed.call(this, [{ node: parent, pos, caches: from.caches }])
  } else {
    console.log(from.caches)
    recoverRangePoint(from.caches)
  }
}
