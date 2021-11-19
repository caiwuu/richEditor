import { renderDom, delVnode, updateNode, setRange, preLeafNode } from '../utils/index'
export default function del(vm) {
  const { range, end, start } = vm.cursor.meta
  console.log(range.endContainer.vnode)
  let orgText = range.endContainer.vnode.context
  // 非选区删除
  if (range.collapsed) {
    orgText = orgText.slice(0, end - 1) + orgText.slice(end)
    if (end === 0) {
      // 当前节点被全删除
      const prevVnode = preLeafNode(range.endContainer.vnode)
      if (orgText === '') {
        const shouldUpdateNode = delVnode(range.endContainer.vnode)
        console.log(shouldUpdateNode)
        if (shouldUpdateNode.parent) {
          updateNode(shouldUpdateNode)
        } else {
          vm.vnode.update(shouldUpdateNode)
        }
      }
      setRange(vm, prevVnode.dom, prevVnode.dom.data.length)
      console.log(prevVnode.dom)
      //   del(vm)
    } else {
      console.log(orgText)
      range.endContainer.vnode.context = orgText
      const dom = renderDom(range.endContainer.vnode)
      range.endContainer.parentNode.replaceChild(dom, range.endContainer)
      setRange(vm, dom, end - 1)
      console.log([range.endContainer.parentNode])
    }
  } else {
    orgText = orgText.slice(0, start) + orgText.slice(end)
    range.endContainer.vnode.context = orgText
    const dom = renderDom(range.endContainer.vnode)
    range.endContainer.parentNode.replaceChild(dom, range.endContainer)
    setRange(vm, dom, start)
  }
}
