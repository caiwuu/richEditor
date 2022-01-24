import { getIndex, recoverRangePoint } from '../utils'
import createVnode from '../vnode'
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
      } else if (pos === vnode.length) {
        return { parent: vnode.parent, pos: getIndex(vnode) + 1 }
      } else {
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
      }
    case 'span':
    case 'a': {
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
    }
    case 'li':
    case 'p':
    case 'div': {
      const index = getIndex(vnode)
      const ops = { type: vnode.type, childrens: [] }
      const newVnode = createVnode(ops, vnode.parent)
      const needMoveNodes = vnode.length ? vnode.childrens.slice(pos) : []
      console.log(needMoveNodes)
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
      } else {
        const br = createVnode({ type: 'br', kind: 'placeholder' })
        newVnode.insert(br)
      }

      vnode.parent.insert(newVnode, index + 1)
      return { parent: vnode.parent, pos: index + 1, vnode: newVnode }
    }
  }
}
export default function lineFeed(args) {
  const [from] = args
  from.caches = from.caches || []
  const { parent, pos } = splitNode.call(this, from.node, from.pos, from.caches)
  console.log(parent, pos)
  if (!blockTag.includes(from.node.type)) {
    lineFeed.call(this, [{ node: parent, pos, caches: from.caches }])
  } else {
    console.log(from.caches)
    recoverRangePoint(from.caches)
  }
}
