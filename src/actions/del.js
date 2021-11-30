import {
  getNode,
  delVnode,
  updateNode,
  setRange,
  preLeafNode,
  getLayer,
  rangeDel,
  reArrangement,
  normalize,
  blockIsEmptyCheck,
} from '../utils/index'
import { blockTag } from '../type'
export default function del(vm) {
  const { range, end, start } = vm.cursor.meta
  let orgText = range.endContainer.vnode.context
  // console.log([range.endContainer])
  /*
    删除分为 选区删除和非选区删除
  */
  if (range.collapsed) {
    orgText = orgText.slice(0, end - 1) + orgText.slice(end)
    // 删除线在节点开头
    if (end === 0) {
      console.log(range.endContainer.vnode)
      const { vnode: prevVnode, layer } = preLeafNode(range.endContainer.vnode)
      console.log(layer)
      const prevVnodeLen = prevVnode.context.length
      const preLayer = getLayer(range.endContainer.vnode)
      // 同一块内
      if (preLayer === layer) {
      }
      // console.log(blockIsEmptyCheck(range.endContainer.vnode))
      // 当前节点内容被清空，则删除当前节点
      if (orgText === '' && blockIsEmptyCheck(range.endContainer.vnode)) {
        // 删空:清除本节点且光标定位到上一个叶子末尾
        const shouldUpdate = delVnode(range.endContainer.vnode)
        updateNode(shouldUpdate)
        if (!prevVnode) {
          return setRange(vm, shouldUpdate.childrens[0].dom, 0)
        }
      } else if (prevVnode && blockTag.includes(layer.tag)) {
        // 跨块级，将改块级子元素移动到prevVnode之后，并删除该节点
        // 未清空，但是光标即将离开块元素,将该块元素的子元素移动到上一个叶子块元素的末尾
        const newLayer = getLayer(prevVnode)
        newLayer.childrens = [...newLayer.childrens, ...layer.childrens]
        reArrangement(newLayer)
        normalize(newLayer)
        const shouldUpdate = delVnode(layer)
        updateNode(shouldUpdate)
        // 性能优化，如果newLayer和shouldUpdate不是在同一树分支才更新两个分支
        if (!newLayer.position.includes(shouldUpdate.position)) {
          updateNode(newLayer)
        }
      }
      if (prevVnode) {
        setRange(vm, prevVnode.dom, prevVnodeLen)
        // 跨行内dom删除 自动执行一步，相当于删除当前节点之后再删除上一节点一个单位的内容
        !blockTag.includes(layer.tag) && del(vm)
      }
    } else {
      // 删除线在节点之间或者末尾
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
      const startBlock = getLayer(startContainer.vnode)
      const endBlock = getLayer(endContainer.vnode)
      const position = startContainer.vnode.position
      let layer = endBlock
      // 删除区间内的内容，更新开始结束容器节点的内容
      rangeDel(commonAncestorContainer.vnode, startContainer.vnode, endContainer.vnode)
      startContainer.vnode.context = startContainer.vnode.context.slice(0, start)
      endContainer.vnode.context = endContainer.vnode.context.slice(end)
      // 如果内容为空则删除节点
      if (!endContainer.vnode.context) {
        layer = delVnode(endContainer.vnode)
      }
      if (startBlock !== endBlock && layer === endBlock) {
        // 不同快，且结束节点块还有内容，需要将该块内容移动到开始块
        // console.log('需要将结束块内容移动到开始块')
        startBlock.childrens = [...startBlock.childrens, ...endBlock.childrens]
        reArrangement(commonAncestorContainer)
        normalize(startBlock)
        delVnode(endContainer.vnode)
      }
      updateNode(commonAncestorContainer.vnode)
      console.log(getNode(vm, position))
      setRange(vm, getNode(vm, position), start)
    }
  }
}
