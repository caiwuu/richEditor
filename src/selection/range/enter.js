import { recoverRange, getIndex } from '../../utils'
import createVnode from '../../ui/createVnode'
import { blockTag } from '../../type'
export default function enter() {
  log('enter')
  splitNode(this.endContainer.vnode, this.endOffset)
}
function handleSplit(vnode, pos) {
  console.log(vnode.type)
  switch (vnode.type) {
    case 'text':
      if (!pos) {
        return { vnode: vnode.parent, pos: getIndex(vnode) }
      } else {
        const restText = vnode.context.slice(0, pos),
          splitedText = vnode.context.slice(pos)
        let index = getIndex(vnode),
          ops = { type: 'text', context: splitedText },
          newVnode = createVnode(ops, vnode.parent)
        vnode.context = restText
        vnode.parent.insert(newVnode, index + 1)
        return { vnode: vnode.parent, pos: index + 1 }
      }
    case 'span': {
      var ops = { type: 'span', childrens: [] },
        index = getIndex(vnode),
        newVnode = createVnode(ops, vnode.parent)
      vnode.childrens.forEach((n, i) => {
        if (i >= pos) {
          n.moveTo(newVnode)
        }
      })
      vnode.parent.insert(newVnode, index + 1)
      return { vnode: vnode.parent, pos: index + 1 }
    }
    case 'li':
    case 'p':
    case 'div': {
      // debugger
      const index = getIndex(vnode),
        ops = { type: vnode.type, childrens: [] },
        newVnode = createVnode(ops, vnode.parent)
      // let len = vnode.length
      // for (let i = 0; i < len; i++) {
      //   if (i >= pos) {
      //     console.log(vnode.childrens[i])
      //     vnode.childrens[i].moveTo(newVnode)
      //     len--
      //     i--
      //   }
      // }
      console.log(vnode.childrens.slice(pos))
      vnode.childrens.slice(pos).forEach((node) => {
        console.log(node)
        node.moveTo(newVnode)
      })
      vnode.parent.insert(newVnode, index + 1)
      return { vnode: vnode.parent, pos: index + 1 }
    }
  }
}
// 节点分裂算法
function splitNode(node, offset) {
  const { vnode, pos } = handleSplit(node, offset)
  console.log(node, offset)
  if (!blockTag.includes(node.type)) {
    splitNode(vnode, pos)
  }
}
