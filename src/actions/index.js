import mitt from 'mitt'
import { createVnode } from '../vnode'
import del from './del'
const actions = {
  test: (e) => console.log('foo', e),
  // 删除操作
  del: del,
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
