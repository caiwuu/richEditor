import {
  getNode,
  delVnode,
  updateNode,
  setRange,
  getPrevLeafNode,
  getLayer,
  rangeDel,
  reArrangement,
  normalize,
  isEmptyBlock,
  getIndex,
} from '../utils/index'
import { blockTag } from '../type'
export default function del(vm) {
  const { range, end, start } = vm.cursor.meta
  let orgText = range.endContainer.vnode.context
  // log([range.endContainer])
  /*
    删除分为 选区删除和非选区删除
  */
  if (range.collapsed) {
    // 兼容非text光标容器的情况，如，img，br
    orgText =
      range.endContainer.vnode.type === 'text' ? orgText.slice(0, end - 1) + orgText.slice(end) : range.endContainer.vnode.childrens.length
    const oldContainer = range.endContainer.vnode
    // 删除线在节点开头
    if (end === 0) {
      let shouldNormalize = false
      const { vnode: prevVnode, layer } = getPrevLeafNode(range.endContainer.vnode)
      // 当前节点内容被清空，则删除当前节点

      // 光标容器无内容;清除本节点且光标定位到上一个叶子末尾
      // TODO 遗漏一种情况
      if (orgText === '') {
        log('删空')
        log(range.endContainer.vnode)
        const shouldUpdate = delVnode(range.endContainer.vnode)
        // log(shouldUpdate)
        // updateNode(shouldUpdate)
        if (!prevVnode) {
          log('没有前置节点')
          return setRange(vm, shouldUpdate.childrens[0].dom, 0)
        }
        log(range.endContainer)
      }
      log(isEmptyBlock(oldContainer), oldContainer)
      if (prevVnode && blockTag.includes(layer.type) && !isEmptyBlock(oldContainer)) {
        log('跨块级')
        // 跨块级，将改块级子元素移动到prevVnode之后，并删除该节点
        // 未清空，但是光标即将离开块元素,将该块元素的子元素移动到上一个叶子块元素的末尾
        const newLayer = getLayer(prevVnode)
        shouldNormalize = newLayer.childrens.slice(-1)[0].type === 'text' && layer.childrens[0].type === 'text'
        log(shouldNormalize)
        newLayer.childrens = [...newLayer.childrens, ...layer.childrens]
        reArrangement(newLayer)
        shouldNormalize && normalize(newLayer)
        const shouldUpdate = delVnode(layer)
        updateNode(shouldUpdate)
        // // 性能优化，如果newLayer和shouldUpdate不是在同一树分支才更新两个分支
        if (!newLayer.position.includes(shouldUpdate.position)) {
          updateNode(newLayer)
        }
      }
      if (prevVnode) {
        log('if (prevVnode)')
        // 如果前一个叶子节点不是text，需额外处理
        if (prevVnode.type === 'text') {
          const prevVnodeLen = shouldNormalize ? prevVnode.context.length - layer.childrens[0].context.length : prevVnode.context.length
          setRange(vm, prevVnode.dom, prevVnodeLen)
        } else {
          setRange(vm, prevVnode.parent.dom, getIndex(prevVnode) + 1)
        }
        // 跨行内dom删除 自动执行一步，相当于删除当前节点之后再删除上一节点一个单位的内容
        !blockTag.includes(layer.type) && del(vm)
      }
    } else {
      // 删除线在节点之间或者末尾
      log(range.endContainer.vnode.type, end)
      if (range.endContainer.vnode.type === 'text') {
        range.endContainer.vnode.context = orgText
        setRange(vm, updateNode(range.endContainer.vnode), end - 1)
      } else {
        const shouldUpdate = delVnode(range.endContainer.vnode.childrens[end - 1])
        const t = updateNode(shouldUpdate)
        log(t)
        setRange(vm, t, end - 1)
      }
    }
  } else {
    const { startContainer, endContainer, commonAncestorContainer } = range
    log(range)
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
        // log('需要将结束块内容移动到开始块')
        startBlock.childrens = [...startBlock.childrens, ...endBlock.childrens]
        reArrangement(commonAncestorContainer)
        normalize(startBlock)
        delVnode(endContainer.vnode)
      }
      updateNode(commonAncestorContainer.vnode)
      log(getNode(vm, position))
      setRange(vm, getNode(vm, position), start)
    }
  }
}
