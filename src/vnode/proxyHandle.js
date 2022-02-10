import { isEmptyNode, normalize, reArrangement } from '../utils/index'
/**
 * 节点操作代理 vnode update ----> dom update
 */
export default {
  set(target, key, newValue) {
    // ui 更新
    switch (key) {
      case 'context':
        target.ele.data = newValue
        break
    }
    return Reflect.set(target, key, newValue)
  },
  get(target, key, receiver) {
    switch (key) {
      case 'insert':
        log('insert')
        return function (vnode, pos) {
          log(target, pos)
          pos = pos === undefined ? receiver.length : pos
          if (target.childrens.length > pos) {
            if (pos === 0) {
              target.ele.insertBefore(vnode.ele, target.ele.childNodes[0])
            } else {
              target.ele.insertBefore(vnode.ele, target.ele.childNodes[pos - 1].nextSibling)
            }
          } else {
            target.ele.appendChild(vnode.ele)
          }
          target.childrens.splice(pos, 0, vnode)
          receiver.reArrangement()
        }
      case 'delete':
        return function (offset, count, isNormalize = true) {
          const start = offset - count <= 0 ? 0 : offset - count
          if (target.type === 'text') {
            target.context = target.context.slice(0, start) + target.context.slice(offset)
            target.ele.data = target.context
          } else {
            target.childrens.splice(start, offset - start).forEach((vnode) => vnode.ele.remove())
            receiver.reArrangement()
          }
        }
      case 'moveTo':
        log('moveTo')
        return function (T, pos) {
          const index = target.index
          // removeNodes reArrangement必须在执行insert之前，因为inset之后会改变parent
          const removeNodes = target.parent.childrens.splice(index, 1)
          receiver.parent.reArrangement()
          removeNodes.forEach((vnode) => {
            T.insert(vnode, pos)
          })
        }
      case 'normalize':
        return function () {
          receiver.childrens && normalize(receiver)
        }
      case 'belong':
        return function (kindName) {
          return target.kind === kindName
        }
      case 'split':
        return function (pos) {
          const index = receiver.index
          if (pos === 0) {
            return index
          }
          if (pos === receiver.length + 1) {
            return index + 1
          }
          if (receiver.type === 'text') {
            const splitedText = receiver.context.slice(pos)
            receiver.context = receiver.context.slice(0, pos)
            const splited = receiver.h({ type: 'text', context: splitedText }, receiver.parent)
            receiver.parent.insert(splited, index + 1)
            return splited
          } else {
            const splited = receiver.h({ type: receiver.type, childrens: [], style: receiver.style, attr: receiver.attr, event: receiver.event }, receiver.parent)
            receiver.childrens.slice(pos).forEach((ele) => ele.moveTo(splited))
            receiver.parent.insert(splited, index + 1)
            return splited
          }
        }
      case 'remove':
        return function (isNormalize = true) {
          const index = target.index
          target.parent.childrens.splice(index, 1).forEach((i) => {
            i.removed = true
            i.ele.remove()
          })
          isNormalize && target.parent.normalize()
          reArrangement(target.parent)
        }
      case 'isEmpty':
        return isEmptyNode(receiver)
      case 'length':
        if (target.kind === 'atom') {
          return -1
        } else if (target.type === 'text') {
          return target.context.length
        } else {
          return target.childrens.filter((ele) => !ele.belong('placeholder')).length
        }
      case 'reArrangement':
        return function () {
          reArrangement(receiver)
        }
      default:
        return Reflect.get(target, key, receiver)
    }
  },
}
