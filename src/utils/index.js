import render from '../ui/render'
import { leafTag, blockTag } from '../type'
// 判断是否是dom对象
function isDOM(item) {
  return typeof HTMLElement === 'function'
    ? item instanceof HTMLElement
    : item && typeof item === 'object' && item.nodeType === 1 && typeof item.nodeName === 'string'
}
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
export function getNode(vm, position) {
  const recursionTree = {
    childrens: [vm.vnode.vnode],
  }
  return position.split('-').reduce((pre, cur) => {
    return pre.childrens[cur]
  }, recursionTree)['dom']
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
  cloneVnode.tag = vnode.tag
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
  if (parent.childrens.length === 1) {
    if (parent.isRoot) {
      vnode.childrens = [{ tag: 'text', context: '' }, { tag: 'br' }]
      return vnode
    }
    return delVnode(parent)
  } else {
    const index = vnode.position.charAt(vnode.position.length - 1)
    parent.childrens.splice(index, 1)
    console.log('remove', vnode.tag)
    vnode.dom.remove()
    normalize(parent)
    reArrangement(parent)
    // TODO 内容删空后立马初始化内容
    return parent
  }
}
// 重排vnode 更新position parent
export function reArrangement(parent) {
  if (parent.childrens) {
    parent.childrens.forEach((item, index) => {
      item.parent = parent
      item.position = parent.position + '-' + index
      reArrangement(item)
    })
  }
}
// 渲染vnode
export function renderDom(vnode) {
  return render(vnode, vnode.parent)
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
// 获取前一个叶子节点
export function preLeafNode(vnode, layer, direction = 'R') {
  if (!layer || !blockTag.includes(layer.tag)) {
    layer = vnode
  }
  const index = vnode.position.charAt(vnode.position.length - 1)
  if (vnode.parent.isRoot) {
    console.log('isRoot')
    return { vnode: null, layer: null }
  }
  if (vnode.parent.childrens.length !== 1 && index !== '0') {
    return direction === 'R' ? getLeafR(vnode.parent.childrens[index - 1], layer) : getLeafL(vnode.parent.childrens[index - 1], layer)
  } else {
    return preLeafNode(vnode.parent, layer, direction)
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
  if (blockTag.includes(vnode.parent.tag)) {
    return vnode.parent
  } else {
    return getLayer(vnode.parent)
  }
}
// 合并相邻的text节点
export function normalize(vnode) {
  if (vnode.childrens.length <= 1) return
  for (let index = vnode.childrens.length - 1; index >= 1; index--) {
    const curr = vnode.childrens[index]
    const next = vnode.childrens[index - 1]
    if (curr.tag !== 'text' || next.tag !== 'text') {
      continue
    } else {
      next.context += curr.context
      vnode.childrens.splice(index, 1)
    }
  }
}
function isEmptyNode(vnode) {
  if (vnode.childrens && vnode.childrens.length) {
    return vnode.childrens.some((item) => isEmptyNode(item))
  } else {
    if (vnode.tag === 'text' && Text.context === '') {
      return true
    } else if (leafTag.includes(vnode.tag)) {
      return false
    } else {
      return true
    }
  }
}
// 块级检测 检查vnode所属块级是否为空 vnode必须是个叶子节点
export function blockIsEmptyCheck(vnode) {
  console.log(vnode)
  if (vnode.context) {
    return false
  } else if (vnode.parent.childrens.length === 1) {
    if (!blockTag.includes(vnode.parent.tag)) {
      return blockIsEmptyCheck(vnode.parent)
    } else {
      return true
    }
  } else {
    return isEmptyNode(vnode.parent)
  }
}
// 节流throttle代码（时间戳+定时器）：
export function throttle(func, delay, vm) {
  let timer = null
  let startTime = Date.now()
  return function () {
    const curTime = Date.now()
    const remaining = delay - (curTime - startTime)
    console.log(vm)
    const args = arguments
    clearTimeout(timer)
    if (remaining <= 0) {
      func.apply(vm, args)
      startTime = Date.now()
    } else {
      timer = setTimeout(func.bind(vm), remaining)
    }
  }.bind(vm)
}
