import { renderDom, delVnode, updateNode, setRange, preLeafNode } from '../utils/index'
import { inlineTag, blockTag } from '../type'
export default function del(vm) {
  const { range, end, start } = vm.cursor.meta
  console.log(range.endContainer.vnode)
  let orgText = range.endContainer.vnode.context
  // 非选区删除
  if (range.collapsed) {
    orgText = orgText.slice(0, end - 1) + orgText.slice(end)
    if (end === 0) {
      const { vnode: prevVnode, layer } = preLeafNode(range.endContainer.vnode)
      console.log(layer.tag)
      // 当前节点内容被清空，则删除当前节点
      if (orgText === '') {
        updateNode(delVnode(range.endContainer.vnode))
        setRange(vm, prevVnode.dom, prevVnode.dom.data.length)
      } else if (blockTag.includes(layer.tag)) {
        // 跨块级，将改块级子元素移动到prevVnode之后，并删除该节点
        // TODO
        const prevVnode2 = prevVnode.parent
        prevVnode2.parent.childrens = [...prevVnode2.parent.childrens, ...layer.childrens]
        const shouldUpdate = delVnode(range.endContainer.vnode)
        console.log(shouldUpdate)
        updateNode(shouldUpdate)
        // updateNode(prevVnode2.parent.parent)
        if (!prevVnode2.parent.position.includes(shouldUpdate.position)) {
          updateNode(prevVnode2.parent)
        }
        // TODO
        setRange(vm, layer.childrens[0].dom, 0)
      }
      // setRange(vm, prevVnode.dom, prevVnode.dom.data.length)
      // 跨行内dom删除
      if (!blockTag.includes(layer.tag)) {
        setRange(vm, prevVnode.dom, prevVnode.dom.data.length)
        del(vm)
      }
      console.log([prevVnode])
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
    setRange(vm, dom, start)
  }
}
