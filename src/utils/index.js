import { createVnode } from '../vnode'
import { inlineTag, blockTag } from '../type'
// 判断是否是dom对象
function isDOM(item) {
  return typeof HTMLElement === 'function' ? item instanceof HTMLElement : item && typeof item === 'object' && item.nodeType === 1 && typeof item.nodeName === 'string'
}
// position位置比较 l < r 表示 r节点在 l 之后
export function compare(l, r) {
  arrL = l.split('-')
  arrR = r.split('-')
  let flag = false
  minLen = Math.min(arrL.length, arrR.length)
  for (let index = 0; index < minLen; index++) {
    if (arrL[index] !== arrR[index]) {
      flag = arrL[index] < arrR[index]
      break
    }
  }
  return flag
}
// 通过position获取vnode
export function getVnode(rootTree, position) {
  const recursionTree = {
    childrens: [rootTree],
  }
  return position.split('-').reduce((pre, cur) => {
    return pre.childrens[cur]
  }, recursionTree)
}
// 设置dom样式
export function styleSet(dom, style) {
  for (const key in style) {
    dom.style[key] = style[key]
  }
}
// 设置dom属性
export function attrSet(dom, attr) {
  for (const key in attr) {
    dom.setAttribute(key, attr[key])
  }
}
// 纯洁vnode克隆
export function clonePlainVnode(vnode) {
  const cloneVnode = {}
  cloneVnode.tag = vnode.tag
  cloneVnode.position = vnode.position
  vnode.context && (cloneVnode.context = vnode.context)
  vnode.style && (cloneVnode.style = { ...vnode.style })
  vnode.attr && (cloneVnode.attr = { ...vnode.attr })
  vnode.childrens && (cloneVnode.childrens = vnode.childrens.map((i) => clonePlainVnode(i)))
  return cloneVnode
}
// 删除vnode
export function delVnode(vnode) {
  const parent = vnode.parent
  // 如果父级只有一个子集，则递归删除父级
  if (parent.childrens.length === 1) {
    return delVnode(parent)
  } else {
    const index = vnode.position.charAt(vnode.position.length - 1)
    parent.childrens.splice(index, 1)
    reArrangement(parent)
    return parent
  }
}
// 重排vnode 更新position
export function reArrangement(parent) {
  if (parent.childrens) {
    parent.childrens.forEach((item, index) => {
      item.position = parent.position + '-' + index
      reArrangement(item)
    })
  }
}
// 渲染vnode
export function renderDom(vnode) {
  const { parent } = vnode
  return createVnode(vnode, parent)
}
// 像素单位变量乘法
export function multiplication(pxVal, times) {
  return pxVal.replace(/(.*)(px)+/, function ($0, $1) {
    return $1 * times + 'px'
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
export function setRange(vm, startcontainer, start, endcontainer, end) {
  const { range, selection } = vm.cursor.meta
  endcontainer = endcontainer === undefined ? startcontainer : endcontainer
  end = end === undefined ? start : end
  range.setStart(startcontainer, start)
  range.setEnd(endcontainer, end)
  selection.removeAllRanges()
  selection.addRange(range)
  console.log('setRange')
  vm.cursor.followSysCaret()
  vm.cursor.focus()
}
// 获取前一个叶子节点
export function preLeafNode(vnode, layer) {
  if (!layer || !blockTag.includes(layer.tag)) {
    layer = vnode
  }
  const index = vnode.position.charAt(vnode.position.length - 1)
  if (vnode.parent.childrens.length !== 1 && index !== 0) {
    return getLeafR(vnode.dom.previousSibling.vnode, layer)
  } else {
    return preLeafNode(vnode.parent, layer)
  }
}
// 获取右叶子
function getLeafR(vnode, layer) {
  if (vnode.childrens && vnode.childrens.length !== 0) {
    return getLeafR(vnode.childrens[vnode.childrens.length - 1], layer)
  } else {
    return { vnode, layer }
  }
}
