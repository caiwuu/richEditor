import { getVnode, delVnode, updateNode, setRange, preLeafNode, getLayer, rangeDel } from '../utils/index'
import { blockTag } from '../type'
export default function del(vm) {
  const { range, end, start } = vm.cursor.meta
  let orgText = range.endContainer.vnode.context
  // 非选区删除
  if (range.collapsed) {
    orgText = orgText.slice(0, end - 1) + orgText.slice(end)
    if (end === 0) {
      console.log(range.endContainer.vnode)
      const { vnode: prevVnode, layer } = preLeafNode(range.endContainer.vnode)
      // 当前节点内容被清空，则删除当前节点
      if (orgText === '') {
        const shouldUpdate = delVnode(range.endContainer.vnode)
        console.log(shouldUpdate, prevVnode)
        // !shouldUpdate.parent.isRoot && updateNode(shouldUpdate)
        updateNode(shouldUpdate)
        setRange(vm, prevVnode.dom, prevVnode.dom.data ? prevVnode.dom.data.length : 0)
      } else if (blockTag.includes(layer.tag)) {
        // 跨块级，将改块级子元素移动到prevVnode之后，并删除该节点
        const newLayer = getLayer(prevVnode)
        newLayer.childrens = [...newLayer.childrens, ...layer.childrens]
        const shouldUpdate = delVnode(range.endContainer.vnode)
        // 如果newLayer和shouldUpdate不是在同一树分支则两个都需要更新
        updateNode(shouldUpdate)
        if (!newLayer.position.includes(shouldUpdate.position)) {
          updateNode(newLayer)
        }
        setRange(vm, layer.childrens[0].dom, 0)
      }
      // 跨行内dom删除
      if (!blockTag.includes(layer.tag)) {
        setRange(vm, prevVnode.dom, prevVnode.dom.data.length)
        del(vm)
      }
    } else {
      range.endContainer.vnode.context = orgText
      setRange(vm, updateNode(range.endContainer.vnode), end - 1)
    }
  } else {
    const { startContainer, endContainer, commonAncestorContainer } = range
    // 选区删除-同一标签
    if (startContainer === endContainer) {
      orgText = orgText.slice(0, start) + orgText.slice(end)
      range.endContainer.vnode.context = orgText
      setRange(vm, updateNode(range.endContainer.vnode), start)
    } else {
      // 跨标签删除
      rangeDel(commonAncestorContainer.vnode, startContainer.vnode, endContainer.vnode)
      startContainer.vnode.context = startContainer.vnode.context.slice(0, start)
      endContainer.vnode.context = endContainer.vnode.context.slice(end)
      !endContainer.vnode.context && delVnode(endContainer.vnode)
      const position = startContainer.vnode.position
      updateNode(commonAncestorContainer.vnode)
      setRange(vm, getVnode(vm, position), start)
    }
  }
}
