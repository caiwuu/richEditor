import emojiRegexCreater from 'emoji-regex'

// position位置比较 l < r 表示 r节点在 l 之后
// l>r -1,r=l 0,l<r 1
export function comparePosition(l, r) {
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
  vnode.event && (cloneVnode.event = { ...vnode.event })
  vnode.childrens && (cloneVnode.childrens = vnode.childrens.map((i) => clonePureVnode(i)))
  return cloneVnode
}
// 空节点递归删除 最多删除到块级
export function deleteNode(vnode) {
  const parent = vnode.parent || vnode
  // 如果父级只有一个子集，则递归删除父级
  if (isEmptyNode(parent)) {
    if (parent.isRoot || (vnode.belong('block') && vnode.childrens.length > 1)) {
      console.log(`${vnode.position} is deleted`)
      vnode.remove()
    } else {
      deleteNode(parent)
    }
  } else {
    vnode.remove()
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
  return pxVal.replace(/(\d*).*/, function ($0, $1, $2) {
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
export function setRange(editor, startcontainer, start, endcontainer, end, notFocus = false) {
  const { range, selection } = editor.cursor.meta
  endcontainer = endcontainer === undefined ? startcontainer : endcontainer
  end = end === undefined ? start : end
  range.setStart(startcontainer, start)
  range.setEnd(endcontainer, end)
  selection.removeAllRanges()
  selection.addRange(range)
  // TODO
  if (!notFocus) {
    editor.cursor.followSysCaret()
    editor.cursor.focus()
  }
}
export function getIndex(vnode) {
  return vnode.position.split('-').pop() / 1
}
// 获取内容属于的第一层块级元素
export function getLayer(vnode, ceil) {
  if (vnode.parent === ceil) {
    return vnode
  } else if (vnode.belong('block')) {
    return vnode
  } else {
    return getLayer(vnode.parent)
  }
}
// 合并相邻的text节点
// TODO 合并之后如果被合并的节点有选区需要重新计算选区位置
export function normalize(vnode) {
  return
  if (vnode.childrens.length <= 1) return
  console.log(vnode.childrens.length)
  for (let index = vnode.childrens.length - 1; index >= 1; index--) {
    const curr = vnode.childrens[index]
    const next = vnode.childrens[index - 1]
    console.log(index)
    if (curr.type === 'text' && next.type === 'text') {
      console.log('合并相邻的text节点')
      // 重新计算光标
      const points = vnode.root.editor.selection
        .getRangePoints()
        .filter((point) => {
          console.log(point.container, curr, next)
          return point.container === curr.ele || (point.container === vnode.ele && point.offset === index - 1)
        })
        .map((point) => ({
          container: point.container === curr.ele ? next.ele : point.container,
          offset: point.container === curr.ele ? point.offset + next.length : index,
          range: point.range,
          flag: point.flag,
        }))
      next.context += curr.context
      console.log(vnode.childrens, index)
      vnode.childrens[index].remove(false)
      console.log(points)
      // 重新绘制光标
      recoverRangePoint(points)
    }
  }
}
export function isEmptyNode(vnode) {
  if (vnode.childrens && vnode.childrens.length) {
    return vnode.childrens.every((item) => isEmptyNode(item))
  } else {
    if (vnode.belong('placeholder')) {
      return true
      // TODO
    } else if (vnode.type === 'text') {
      return vnode.context === ''
    } else if (vnode.belong('atom')) {
      return false
    } else {
      return true
    }
  }
}
// 向上查找行内空节点
export function lookUpEmptyInline(emptyNode) {
  const parent = emptyNode.parent
  if (parent.isRoot) {
    return emptyNode
  } else if (parent.belong('block')) {
    return emptyNode
  } else if (parent.isEmpty) {
    return lookUpEmptyInline(parent)
  } else {
    return emptyNode
  }
}
// 块级检测 检查vnode所属块级是否为空
export function isEmptyBlock(vnode) {
  // debugger
  const block = getLayer(vnode)
  return isEmptyNode(block)
}
// 判断是否在同一行
export function isSameLine(initialRect, prevRect, currRect, flag, editor) {
  // 标识光标是否在同一行移动
  let sameLine = true
  // 判断自动折行 非vnode层面的换行 这里存在判断失误的概率 但是绝大部分情况都能判断
  // 这里通过判断前后两个光标位置距离是否大于一定的值来判断
  if (Math.abs(currRect.x - prevRect.x) > editor.ui.editableArea.offsetWidth - 2 * currRect.h) {
    sameLine = false
  }
  if (flag === 2) {
    sameLine = false
  }
  //光标Y坐标和参考点相同说明光标还在本行，最理想的情况放在最后判断
  if (currRect.y === initialRect.y) {
    sameLine = true
  }
  return sameLine
}
// 位点恢复
export function recoverRangePoint(points) {
  points.forEach((point) => {
    if (point.flag === 'end') {
      point.range.setEnd(point.container, point.offset)
    } else {
      point.range.setStart(point.container, point.offset)
    }
  })
}
// 多次函数执行器
export function times(n, fn, context = undefined, ...args) {
  let i = 0
  while (i++ < n) {
    fn.call(context, ...args)
  }
}

/**
 * 2.0 向后光标位点算法
 * @param {*} vnode
 * @param {*} pos
 * @param {*} flag 跨越标识
 * 0 节点内移动
 * -1 不需要向后矫正的跨节点标识
 * 1 需要向后校正的跨节点标识
 * 2 跨行标识
 * -2 emoji 两个字符
 * @returns
 */
export function getNextPoint(vnode, pos, flag = 0) {
  if (vnode.isRoot && pos === vnode.length) return { node: null, pos: null, flag: 404 }
  const len = vnode.type === 'text' ? vnode.length : vnode.childrens.length
  if (pos + 1 > len) {
    const index = getIndex(vnode)
    flag = vnode.belong('block') ? 2 : 1
    return getNextPoint(vnode.parent, index + 1, flag)
  } else if (pos + 1 === len) {
    return flag > 0 ? getHead(vnode, pos, flag) : { node: vnode, pos: pos + 1, flag }
  } else {
    return getHead(vnode, flag > 0 ? pos : pos + 1, flag)
  }
}
export function getHead(parent, pos, flag) {
  if (parent.type === 'text') {
    const emojiRegex = emojiRegexCreater()
    for (const match of parent.context.matchAll(emojiRegex)) {
      if (pos === match.index + 1) {
        pos = pos + 1
        flag = -2
      }
    }
    return { node: parent, pos: pos, flag }
  }
  const node = parent.childrens[pos]
  if (node.belong('block')) {
    flag = 2
  } else if (node.belong('inline') && flag === 0) {
    flag = -1
  }

  if (node.childrens && node.childrens.length > 0) {
    return getHead(node, 0, flag)
  } else if (node.type === 'text') {
    return { node, pos: 0, flag }
  } else {
    return { node: parent, pos: pos, flag }
  }
}
/**
 * 2.0 向前光标位点算法
 * @param {*} vnode
 * @param {*} pos
 * @param {*} flag 跨越标识
 * 0 节点内移动
 * -1 不需要向前矫正的跨节点标识
 * 1 需要向前校正的跨节点标识
 * 2 跨行标识
 * -2 emoji 两个字符
 * @returns
 */
export function getPrevPoint(vnode, pos, flag = 0) {
  if (pos - 1 < 0) {
    if (vnode.isRoot) {
      return { node: null, pos: null, flag: 404 }
    } else {
      const index = getIndex(vnode)
      flag = vnode.belong('block') ? 2 : 1
      return getPrevPoint(vnode.parent, index, flag)
    }
  } else if (pos - 1 === 0) {
    return flag > 0 ? getTail(vnode, pos, flag) : { node: vnode, pos: pos - 1, flag }
  } else {
    return getTail(vnode, flag > 0 ? pos : pos - 1, flag)
  }
}
export function getTail(parent, pos, flag) {
  if (parent.type === 'text') {
    const emojiRegex = emojiRegexCreater()
    for (const match of parent.context.matchAll(emojiRegex)) {
      if (pos === match.index + 1) {
        pos = pos - 1
        flag = -2
      }
    }
    return { node: parent, pos: pos, flag }
  }
  const node = parent.childrens[pos - 1]
  if (node.belong('block')) {
    flag = 2
  } else if (node.belong('inline') && flag === 0) {
    flag = -1
  }
  if (node.childrens && node.childrens.length > 0) {
    return getTail(node, node.childrens.length, flag)
  } else if (node.type === 'text') {
    return { node, pos: node.length, flag }
  } else {
    return { node: parent, pos: pos, flag }
  }
}
