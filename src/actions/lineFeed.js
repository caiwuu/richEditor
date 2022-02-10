import { recoverRangePoint, getHead, isEmptyBlock } from '../utils'
import createVnode from '../vnode'
/**
 * // 节点分裂算法
 * @param {*} vnode
 * @param {*} pos
 * @returns
 */
function splitNode(vnode, pos, caches, isEnd = false) {
  if (!pos && !vnode.belong('block')) {
    return { parent: vnode.parent, pos: vnode.index, isEnd: false }
  } else if (pos === vnode.length && !vnode.belong('block')) {
    this.selection
      .getRangePoints()
      .filter((point) => point.container === vnode.ele && point.offset >= pos)
      .forEach((ele) => caches.push(ele))
    return { parent: vnode.parent, pos: vnode.index + 1, isEnd: true }
  }
  if (vnode.type === 'text') {
    const restText = vnode.context.slice(0, pos)
    const splitedText = vnode.context.slice(pos)
    const index = vnode.index
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
    const index = vnode.index
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
    return { parent: vnode.parent, pos: index + 1, vnode: newVnode, isEnd: false }
  } else if (vnode.belong('block')) {
    const index = vnode.index
    const parent = vnode.parent
    let newBlock = null
    let fn = (ele) => {
      caches.push({ container: newBlock.ele, offset: ele.offset - pos, flag: ele.flag, range: ele.range })
    }
    if (vnode.isRoot) {
      const parent = createVnode({ type: 'p' }, vnode)
      newBlock = parent
      vnode.insert(parent)
      const br = createVnode({ type: 'br', kind: 'placeholder' })
      parent.insert(br)
    } else {
      const ops = { type: vnode.type, childrens: [] }
      newBlock = createVnode(ops, parent)
      const needMoveNodes = vnode.length ? vnode.childrens.slice(pos) : []
      if (isEmptyBlock(vnode) || pos === 0) {
        const br = createVnode({ type: 'br', kind: 'placeholder' })
        newBlock.insert(br)
        parent.insert(newBlock, index)
        fn = () => null
      } else if (needMoveNodes.length > 0) {
        needMoveNodes.forEach((node) => {
          node.moveTo(newBlock)
        })
        parent.insert(newBlock, index + 1)
      } else {
        const br = createVnode({ type: 'br', kind: 'placeholder' })
        newBlock.insert(br)
        console.log(vnode)
        parent.insert(newBlock, index + 1)
        fn = (ele) => {
          caches.push({ container: newBlock.ele, offset: 0, flag: ele.flag, range: ele.range })
        }
      }
    }

    this.selection
      .getRangePoints()
      .filter((point) => point.container === vnode.ele && point.offset >= pos)
      .forEach(fn)
    isEnd &&
      caches.forEach((ele) => {
        ele.container = getHead(newBlock, 0, 0).node.ele
        ele.offset = 0
      })
    return { parent: parent, pos: index + 1, vnode: newBlock }
  }
}
export default function lineFeed(args) {
  const [from] = args
  // if (from.node.isRoot) return
  from.caches = from.caches || []
  const { parent, pos, isEnd } = splitNode.call(this, from.node, from.pos, from.caches, from.isEnd)
  if (!from.node.belong('block')) {
    lineFeed.call(this, [{ node: parent, pos, caches: from.caches, isEnd }])
  } else {
    recoverRangePoint(from.caches)
  }
}
