import { updateNode, setRange, reArrangement } from '../utils'
export default function input({ vm, inputData }) {
  const { range, end } = vm.cursor.meta
  log(range.endContainer.vnode)
  if (range.endContainer.vnode.tag == 'text') {
    let orgText = range.endContainer.vnode.context
    orgText = orgText.slice(0, end) + inputData + orgText.slice(end)
    range.endContainer.vnode.context = orgText
    setRange(vm, updateNode(range.endContainer.vnode), end + inputData.length)
  } else {
    log(inputData)
    const insertTextNode = { tag: 'text', context: inputData }
    if (range.endContainer.vnode.childrens[end]) {
      range.endContainer.vnode.childrens.splice(end, 0, insertTextNode)
      reArrangement(range.endContainer.vnode)
    } else {
      range.endContainer.vnode.childrens.push(insertTextNode)
    }
    updateNode(range.endContainer.vnode)
    setRange(vm, insertTextNode.dom, inputData.length)
  }
}
