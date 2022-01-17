// import render from '../ui/render'
import { leafTag, blockTag } from '../type'
// position位置比较 l < r 表示 r节点在 l 之后
// l>r -1,r=l 0,l<r 1
export function compare(l, r) {
  const arrL = l.split('-'),
    arrR = r.split('-'),
    minLen = Math.min(arrL.length, arrR.length)
  let flag = 0
  for (let index = 0; index < minLen; index++) {
    if (arrL[index] === arrR[index]) {
      flag = 0
    } else {
      flag = arrL[index] < arrR[index] ? 1 : -1
      break
    }
  }
  return flag
}
function compareStart(vnode, start, end, samebranch = false) {
  const compareRes = compare(vnode.position, start.position)
  if (compareRes === 0 && vnode.position !== start.position) {
    for (let index = vnode.childrens.length - 1; index >= 0; index--) {
      const element = vnode.childrens[index]
      compareStart(element, start, end, true)
    }
  } else if (compareRes == -1) {
    if (samebranch) {
      delVnode(vnode)
    } else {
      compareEnd(vnode, end, false)
    }
  }
}
function compareEnd(vnode, end) {
  const compareRes = compare(vnode.position, end.position)
  if (compareRes === 0 && vnode.position !== end.position) {
    for (let index = vnode.childrens.length - 1; index >= 0; index--) {
      const element = vnode.childrens[index]
      compareEnd(element, end)
    }
  } else if (compareRes == 1) {
    delVnode(vnode)
  }
}
// 选区删除，删除两个节点之间的节点
export function rangeDel(commonAncestorContainer, startContainer, endContainer) {
  for (let index = commonAncestorContainer.childrens.length - 1; index >= 0; index--) {
    const element = commonAncestorContainer.childrens[index]
    compareStart(element, startContainer, endContainer)
  }
}
// 通过position获取vnode
export function getNode(rootTree, position) {
  const recursionTree = {
    childrens: [rootTree],
  }
  return position.split('-').reduce((pre, cur) => {
    return pre.childrens[cur]
  }, recursionTree)
}
// 设置dom样式
export function setStyle(dom, style) {
  for (const key in style) {
    dom.style[key] = style[key]
  }
}
// 设置dom属性
export function setAttr(dom, attr) {
  for (const key in attr) {
    dom.setAttribute(key, attr[key])
  }
}
export function setEvent(dom, event) {
  for (const key in event) {
    dom[key] = event[key]
  }
}
// 纯净克隆(运行时无关，去除了依赖引用关系数据；去除循环引用；需要通过createVnode来创建依赖)
export function clonePureVnode(vnode) {
  const cloneVnode = {}
  cloneVnode.type = vnode.type
  cloneVnode.position = vnode.position
  vnode.context && (cloneVnode.context = vnode.context)
  vnode.style && (cloneVnode.style = { ...vnode.style })
  vnode.attr && (cloneVnode.attr = { ...vnode.attr })
  vnode.childrens && (cloneVnode.childrens = vnode.childrens.map((i) => clonePureVnode(i)))
  return cloneVnode
}
// 节点删除
export function delVnode(vnode) {
  const parent = vnode.parent || vnode
  // 如果父级只有一个子集，则递归删除父级
  // if (parent.childrens.length === 1) {
  if (isEmptyNode(parent)) {
    if (parent.isRoot) {
      vnode.childrens = [{ type: 'text', context: '' }, { type: 'br' }]
      return vnode
    }
    return delVnode(parent)
  } else {
    vnode.remove()
    // normalize(parent)
    // reArrangement(parent)
    // TODO 内容删空后立马初始化内容
    return parent
  }
}
// 重排vnode 更新position parent
export function reArrangement(parent) {
  if (parent.childrens) {
    parent.childrens.forEach((item, index) => {
      const old = item.position
      item.parent = parent
      item.position = parent.position + '-' + index
      if (old !== item.position) reArrangement(item)
    })
  }
}
// 渲染vnode
export function renderDom(vnode) {
  return render(vnode, vnode.parent)
}
// 像素单位变量乘法
export function multiplication(pxVal, times) {
  return pxVal.replace(/(\d*)(px)+/, function ($0, $1, $2) {
    return $1 * times
  })
}
// 节点更新
export function updateNode(vnode) {
  const oldDom = vnode.dom
  const dom = renderDom(vnode)
  vnode.parent.dom.replaceChild(dom, oldDom)
  return dom
}
// 重新设置选区
export function setRange(vm, startcontainer, start, endcontainer, end, notFocus = false) {
  const { range, selection } = vm.cursor.meta
  endcontainer = endcontainer === undefined ? startcontainer : endcontainer
  end = end === undefined ? start : end
  range.setStart(startcontainer, start)
  range.setEnd(endcontainer, end)
  selection.removeAllRanges()
  selection.addRange(range)
  // TODO
  if (!notFocus) {
    vm.cursor.followSysCaret()
    vm.cursor.focus()
  }
}
export function getIndex(vnode) {
  return vnode.position.split('-').pop() / 1
}
// 获取下一个叶子节点
export function getNextLeafNode(vnode, layer, direction = 'L') {
  if (vnode.isRoot) {
    return { vnode: null, layer: null }
  }
  if (!layer || !blockTag.includes(layer.type)) {
    layer = vnode
  }
  const index = getIndex(vnode)
  const len = vnode.parent.childrens.length
  if (len !== 1 && index != len - 1) {
    return direction === 'R' ? getLeafR(vnode.parent.childrens[index + 1], layer) : getLeafL(vnode.parent.childrens[index + 1], layer)
  } else {
    return getNextLeafNode(vnode.parent, layer, direction)
  }
}
// 获取前一个叶子节点
export function getPrevLeafNode(vnode, layer, direction = 'R') {
  if (!layer || !blockTag.includes(layer.type)) {
    layer = vnode
  }
  if (vnode.isRoot) {
    log('isRoot')
    return { vnode: null, layer: null }
  }
  const index = getIndex(vnode)
  if (vnode.parent.childrens.length !== 1 && index !== 0) {
    return direction === 'R' ? getLeafR(vnode.parent.childrens[index - 1], layer) : getLeafL(vnode.parent.childrens[index - 1], layer)
  } else {
    return getPrevLeafNode(vnode.parent, layer, direction)
  }
}
// 获取右叶子
export function getLeafR(vnode, layer) {
  if (vnode.childrens && vnode.childrens.length !== 0) {
    return getLeafR(vnode.childrens[vnode.childrens.length - 1], layer)
  } else {
    return { vnode, layer }
  }
}
// 获取左叶子
export function getLeafL(vnode, layer) {
  if (vnode.childrens && vnode.childrens.length !== 0) {
    return getLeafL(vnode.childrens[0], layer)
  } else {
    return { vnode, layer }
  }
}
// 获取内容属于的第一层块级元素
export function getLayer(vnode) {
  if (blockTag.includes(vnode.parent.type)) {
    return vnode.parent
  } else {
    return getLayer(vnode.parent)
  }
}
// 合并相邻的text节点
// TODO 合并之后如果被合并的节点有选区需要重新计算选区位置
export function normalize(vnode) {
  if (vnode.childrens.length <= 1) return
  for (let index = vnode.childrens.length - 1; index >= 1; index--) {
    const curr = vnode.childrens[index]
    const next = vnode.childrens[index - 1]
    if (curr.type !== 'text' || next.type !== 'text') {
      continue
    } else {
      next.context += curr.context
      vnode.childrens.splice(index, 1)
      // vnode.childrens[index].remove()
    }
  }
}
export function isEmptyNode(vnode) {
  if (vnode.childrens && vnode.childrens.length) {
    return vnode.childrens.every((item) => isEmptyNode(item))
  } else {
    if (vnode.type === 'text' && vnode.context === '') {
      return true
    } else if (vnode.virtual) {
      return true
    } else if (leafTag.includes(vnode.type)) {
      return false
    } else {
      return true
    }
  }
}
// 块级检测 检查vnode所属块级是否为空 vnode必须是个叶子节点
export function isEmptyBlock(vnode) {
  // 有内容的文本节点
  if (vnode.context) {
    return false
  } else if (vnode.parent.childrens.length === 1) {
    // 行内节点
    if (!blockTag.includes(vnode.parent.type)) {
      return isEmptyBlock(vnode.parent)
    } else {
      return true
    }
  } else {
    return isEmptyNode(vnode.parent)
  }
}
// 判断是否在同一行，正确率90%以上
export function isSameLine(initialRect, prevRect, currRect, result, vm) {
  // 标识光标是否在同一行移动
  let flag = true
  if (Math.abs(currRect.x - prevRect.x) > vm.ui.editableArea.offsetWidth - 1.3 * currRect.h) {
    flag = false
  }
  // 光标移动触发块级检测说明光标必然跨行
  if (typeof result === 'object' && blockTag.includes(result.type)) {
    flag = false
  }
  //光标Y坐标和参考点相同说明光标还在本行，最理想的情况放在最后判断
  if (currRect.y === initialRect.y) {
    flag = true
  }
  return flag
}
export function recoverRange(caches) {
  caches.forEach((cache) => {
    if (cache.endContainer.vnode.childrens) {
      const { vnode: leaf } = getLeafR(cache.endContainer.vnode.childrens[cache.offset - 1])
      if (!leaf.atom) {
        cache.endContainer = leaf.ele
        cache.offset = leaf.length
      }
    }
    cache.range.setEnd(cache.endContainer, cache.offset)
    cache.range.collapse(false)
  })
}
export function times(n, fn, context = undefined, ...args) {
  let i = 0
  while (i++ < n) {
    fn.call(context, ...args)
  }
}
