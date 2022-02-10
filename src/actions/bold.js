import { recoverRangePoint, transToNode, getCommonAncestorNode } from '../utils'
export default function bold(args) {
  console.log('bold action')
  const [from, to] = transToNode.call(this, args)
  const commonAncestorNode = getCommonAncestorNode(this.ui.editableArea.vnode, from, to)
  console.log(commonAncestorNode)
  const fromSplit = from.node.split(from.pos)
  const toSplit = to.node.split(to.pos)
  const points = this.selection
    .getRangePoints()
    .filter((point) => point.container === from.node.ele && point.offset >= from.pos)
    .map((point) => ({
      container: fromSplit.ele,
      offset: point.offset - from.pos,
      range: point.range,
      flag: point.flag,
    }))
  const strong = commonAncestorNode.h({ type: 'strong', childrens: [] })
  console.log(fromSplit, toSplit)
  toSplit.moveTo(strong)
  commonAncestorNode.insert(strong, fromSplit.index)
  recoverRangePoint(points)
  this.selection.drawRangeBg()
}
