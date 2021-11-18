import { renderDom, delVnode, updateNode, setRange, preLeafNode } from '../utils/index'
export default function del(vm) {
  const { range, end, start } = vm.cursor.meta
  let orgText = range.endContainer.vnode.context
  // 非选区删除
  if (range.collapsed) {
    orgText = orgText.slice(0, end - 1) + orgText.slice(end)
    if (end === 0) {
      // 当前节点被全删除
      if (orgText === '') {
        const shouldUpdateNode = delVnode(range.endContainer.vnode)
        updateNode(shouldUpdateNode)
      } else {
        const prevVnode = preLeafNode(range.endContainer.vnode)
        console.log(prevVnode)
        // 去上一个节点中删除
      }
    } else {
      range.endContainer.vnode.context = orgText
      const dom = renderDom(range.endContainer.vnode)
      range.endContainer.parentNode.replaceChild(dom, range.endContainer)
      setRange(vm, dom, end - 1)
    }
  } else {
    orgText = orgText.slice(0, start) + orgText.slice(end)
    range.endContainer.vnode.context = orgText
    const dom = renderDom(range.endContainer.vnode)
    range.endContainer.parentNode.replaceChild(dom, range.endContainer)
    console.log(start, end)
    setRange(vm, dom, start)
  }
}
