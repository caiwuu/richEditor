import mitt from 'mitt'
import { updateNode, setRange } from '../utils'
import del from './del'
const emitter = mitt()
const actions = {
  // 删除操作
  del: del,
  // 输入
  input: ({ vm, inputData }) => {
    const { range, end } = vm.cursor.meta
    let orgText = range.endContainer.vnode.context
    orgText = orgText.slice(0, end) + inputData + orgText.slice(end)
    range.endContainer.vnode.context = orgText
    const dom = updateNode(range.endContainer.vnode)
    setRange(vm, dom, end + inputData.length)
  },
  // 动态的添加action
  addAction: ({ actionName, cb }) => {
    emitter.on(actionName, cb)
  },
}
for (const key in actions) {
  emitter.on(key, actions[key])
}

export default emitter
