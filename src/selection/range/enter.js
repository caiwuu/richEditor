import { recoverRange, getIndex } from '../../utils'
import createVnode from '../../ui/createVnode'
export default function enter() {
  log('enter')
  splitNode(this.endContainer.vnode, this.endOffset)
}
function handleSplit(vnode, pos) {
  switch (vnode.type) {
    case 'text':
      if (!pos) {
        return { vnode: vnode.parent, pos: getIndex(vnode) }
      } else {
        const restText = vnode.context.slice(0, pos),
          splitedText = vnode.context.slice(pos),
          index = getIndex(vnode),
          segm = { type: 'text', context: splitedText },
          newVnode = createVnode(segm, vnode.parent)
        vnode.context = restText
        vnode.parent.insert(newVnode, index)
        return { vnode: vnode.parent, pos: index + 1 }
      }
      break
    case 'span':
      break
    default:
  }
}
function splitNode(node, offset) {
  const { vnode, pos } = handleSplit(node, offset)
  console.log(vnode, pos)
}
