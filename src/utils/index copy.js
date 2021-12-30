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
  return pxVal.replace(/(\d*)(px)+/, function ($0, $1, $2) {
    return $1 * times + $2
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
  if (!layer || !blockTag.includes(layer.tag)) {
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
  if (!layer || !blockTag.includes(layer.tag)) {
    layer = vnode
  }
  if (vnode.isRoot) {
    console.log('isRoot')
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
// 需要优化判断的准确率
export function isSameLine(initialRect, prevRect, currRect, result) {
  // 标识光标是否在同一行移动
  let flag = true
  if (Math.abs(currRect.x - prevRect.x) > 200) {
    flag = false
  }
  // 光标移动触发块级检测说明光标必然跨行
  if (typeof result === 'object' && blockTag.includes(result.tag)) {
    flag = false
  }
  //光标Y坐标和参考点相同说明光标还在本行，最理想的情况放在最后判断
  if (currRect.y === initialRect.y) {
    flag = true
  }
  return flag
}

export function throttle(func, wait, options) {
  var timeout, context, args, result

  // 上一次执行回调的时间戳
  var previous = 0

  // 无传入参数时，初始化 options 为空对象
  if (!options) options = {}

  var later = function () {
    // 当设置 { leading: false } 时
    // 每次触发回调函数后设置 previous 为 0
    // 不然为当前时间
    previous = options.leading === false ? 0 : Date.now()

    // 防止内存泄漏，置为 null 便于后面根据 !timeout 设置新的 timeout
    timeout = null

    // 执行函数
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }

  // 每次触发事件回调都执行这个函数
  // 函数内判断是否执行 func
  // func 才是我们业务层代码想要执行的函数
  var throttled = function () {
    // 记录当前时间
    var now = Date.now()

    // 第一次执行时（此时 previous 为 0，之后为上一次时间戳）
    // 并且设置了 { leading: false }（表示第一次回调不执行）
    // 此时设置 previous 为当前值，表示刚执行过，本次就不执行了
    if (!previous && options.leading === false) previous = now

    // 距离下次触发 func 还需要等待的时间
    var remaining = wait - (now - previous)
    context = this
    args = arguments

    // 要么是到了间隔时间了，随即触发方法（remaining <= 0）
    // 要么是没有传入 {leading: false}，且第一次触发回调，即立即触发
    // 此时 previous 为 0，wait - (now - previous) 也满足 <= 0
    // 之后便会把 previous 值迅速置为 now
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)

        // clearTimeout(timeout) 并不会把 timeout 设为 null
        // 手动设置，便于后续判断
        timeout = null
      }

      // 设置 previous 为当前时间
      previous = now

      // 执行 func 函数
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      // 最后一次需要触发的情况
      // 如果已经存在一个定时器，则不会进入该 if 分支
      // 如果 {trailing: false}，即最后一次不需要触发了，也不会进入这个分支
      // 间隔 remaining milliseconds 后触发 later 方法
      timeout = setTimeout(later, remaining)
    }
    return result
  }

  // 手动取消
  throttled.cancel = function () {
    clearTimeout(timeout)
    previous = 0
    timeout = context = args = null
  }

  // 执行 _.throttle 返回 throttled 函数
  return throttled
}
