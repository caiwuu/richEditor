import mitt from 'mitt'
import { createVnode } from '../vnode'
import getVnode from '../vnode/getVnode'
function renderDom(vnode) {
  const { parent } = vnode
  console.log(parent)
  return createVnode(vnode, parent)
}
const actions = {
  test: (e) => console.log('foo', e),
  // 删除操作
  del: (vm) => {
    const { range, end, selection, start } = vm.cursor.meta
    // if (end === 0) {
    //   if (range.endContainer.nextSibling.wholeText !== '') {
    //     console.log(range.endContainer.parentNode.previousSibling)
    //   }
    //   console.log(range.endContainer.previousSibling, [range.endContainer])
    //   return
    // }
    // MVC
    console.log(range.collapsed, start, end)
    let orgText = range.endContainer.vnode.context
    if (range.collapsed) {
      orgText = orgText.slice(0, end - 1) + orgText.slice(end)
      if (orgText === '' && end === 0) {
        console.log(getVnode(vm.vnode.VNodeTree, '0-0-1-0'))
        return
      }
      range.endContainer.vnode.context = orgText
      const dom = renderDom(range.endContainer.vnode)
      range.endContainer.parentNode.replaceChild(dom, range.endContainer)
      range.setStart(dom, end - 1)
      range.setEnd(dom, end - 1)
    } else {
      orgText = orgText.slice(0, start) + orgText.slice(end)
      range.endContainer.vnode.context = orgText
      const dom = renderDom(range.endContainer.vnode)
      range.endContainer.parentNode.replaceChild(dom, range.endContainer)
      console.log(start, end)
      range.setStart(dom, start)
      range.setEnd(dom, start)
    }
    selection.removeAllRanges()
    selection.addRange(range)
    vm.cursor.followSysCaret()
    vm.cursor.focus()
  },
  // 输入
  input: ({ vm, inputData }) => {
    const { range, end, selection } = vm.cursor.meta
    let orgText = range.endContainer.vnode.context
    orgText = orgText.slice(0, end) + inputData + orgText.slice(end)
    range.endContainer.vnode.context = orgText
    const dom = createVnode(range.endContainer.vnode)
    range.endContainer.parentNode.replaceChild(dom, range.endContainer)
    range.setStart(dom, end + inputData.length)
    range.setEnd(dom, end + inputData.length)
    selection.removeAllRanges()
    selection.addRange(range)
    vm.cursor.followSysCaret()
    vm.cursor.focus()
  },
}

const emitter = mitt()
for (const key in actions) {
  emitter.on(key, actions[key])
}

export default emitter
