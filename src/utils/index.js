import { createVnode } from '../vnode'
import { inlineTag, blockTag } from '../type'
// 判断是否是dom对象
function isDOM(item) {
  return typeof HTMLElement === 'function' ? item instanceof HTMLElement : item && typeof item === 'object' && item.nodeType === 1 && typeof item.nodeName === 'string'
}
// position位置比较 l < r 表示 r节点在 l 之后
// r<l -1,r=l 0,r>l 1
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
export function rangeDel(commonAncestorContainer, startContainer, endContainer) {
  commonAncestorContainer.childrens.forEach((item) => {
    const conpareRes = compare(item.position, startContainer.position)
    if (conpareRes === 0 && item.position !== startContainer.position) {
      rangeDel(item, startContainer)
    } else if (conpareRes == -1) {
      if (endContainer) {
        if (compare(item.position, endContainer.position) == 1) delVnode(item)
      } else {
        delVnode(item)
      }
    }
  })
}
// 通过position获取vnode
export function getVnode(vm, position) {
  const recursionTree = {
    childrens: [vm.vnode.vnode],
  }
  return position.split('-').reduce((pre, cur) => {
    return pre.childrens[cur]
  }, recursionTree)['dom']
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
// 纯净vnode克隆
export function clonePureVnode(vnode) {
  const cloneVnode = {}
  cloneVnode.tag = vnode.tag
  cloneVnode.position = vnode.position
  vnode.context && (cloneVnode.context = vnode.context)
  vnode.style && (cloneVnode.style = { ...vnode.style })
  vnode.attr && (cloneVnode.attr = { ...vnode.attr })
  vnode.childrens && (cloneVnode.childrens = vnode.childrens.map((i) => clonePureVnode(i)))
  return cloneVnode
}
// 删除vnode
export function delVnode(vnode) {
  console.log(vnode)
  // TODO
  const parent = vnode.parent || vnode
  console.log(parent)
  // 如果父级只有一个子集，则递归删除父级
  if (parent.childrens.length === 1) {
    return delVnode(parent)
  } else {
    const index = vnode.position.charAt(vnode.position.length - 1)
    parent.childrens.splice(index, 1)
    // reArrangement(parent)
    // TODO 内容删空后立马初始化内容
    if (parent.childrens.length === 1 && parent.childrens[0]['tag'] === 'br') {
      return delVnode(parent)
    } else {
      return parent
    }
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
  console.log(vnode)
  const oldDom = vnode.dom
  const dom = renderDom(vnode)
  vnode.parent.dom.replaceChild(dom, oldDom)
  return dom
}
// 重新设置选区
export function setRange(vm, startcontainer, start, notFocus = false, endcontainer, end) {
  const { range, selection } = vm.cursor.meta
  endcontainer = endcontainer === undefined ? startcontainer : endcontainer
  end = end === undefined ? start : end
  range.setStart(startcontainer, start)
  range.setEnd(endcontainer, end)
  selection.removeAllRanges()
  selection.addRange(range)
  console.log('setRange')
  // TODO
  if (!notFocus) {
    vm.cursor.followSysCaret()
    vm.cursor.focus()
  }
}
// 获取前一个叶子节点
export function preLeafNode(vnode, layer) {
  console.log(vnode)
  if (!layer || !blockTag.includes(layer.tag)) {
    layer = vnode
  }
  const index = vnode.position.charAt(vnode.position.length - 1)
  console.log(index)
  if (vnode.position === '0') {
    if (vnode.childrens[1]) {
      return getLeafR(vnode.childrens[1], layer)
    } else {
      const leaf = { tag: 'text', context: '' }
      vnode.childrens = [leaf, { tag: 'br' }]
      updateNode(vnode)
      return { vnode: leaf, layer: vnode }
    }
  } else if (vnode.parent.childrens.length !== 1 && index !== '0') {
    return getLeafR(vnode.parent.childrens[index - 1], layer)
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
// 获取内容属于的第一层块级元素
export function getLayer(vnode) {
  if (blockTag.includes(vnode.parent.tag)) {
    return vnode.parent
  } else {
    return getLayer(vnode.parent)
  }
}
