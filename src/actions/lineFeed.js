import { recoverRange, getIndex } from '../utils'
import createVnode from '../ui/createVnode'
import { blockTag } from '../type'
/**
 * // 节点分裂算法
 * @param {*} vnode
 * @param {*} pos
 * @returns
 */
function splitNode(vnode, pos) {
  console.log(vnode.type)
  switch (vnode.type) {
    case 'text':
      if (!pos) {
        return { parent: vnode.parent, pos: getIndex(vnode) }
      } else {
        const restText = vnode.context.slice(0, pos),
          splitedText = vnode.context.slice(pos),
          index = getIndex(vnode),
          ops = { type: 'text', context: splitedText },
          newVnode = createVnode(ops, vnode.parent)
        vnode.context = restText
        vnode.parent.insert(newVnode, index + 1)
        return { parent: vnode.parent, pos: index + 1, vnode: newVnode }
      }
    case 'span':
    case 'a': {
      const index = getIndex(vnode),
        ops = { type: vnode.type, childrens: [], style: vnode.style },
        newVnode = createVnode(ops, vnode.parent),
        needMoveNodes = vnode.childrens.slice(pos)
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
        needMoveNodes = vnode.childrens.slice(pos)
      needMoveNodes.forEach((node) => {
        node.moveTo(newVnode)
      })
      vnode.parent.insert(newVnode, index + 1)
      return { parent: vnode.parent, pos: index + 1, vnode: newVnode }
    }
  }
}
export default function lineFeed(args) {
  const [from] = args,
    { parent, pos } = splitNode(from.node, from.pos)
  if (!blockTag.includes(from.node.type)) {
    lineFeed([{ node: parent, pos }])
  }
}