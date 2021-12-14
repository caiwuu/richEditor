import mitt from 'mitt'
import del from './del'
import input from './input'
const emitter = mitt()
const actions = {
  // 删除操作
  del,
  // 输入
  input,
}
for (const key in actions) {
  emitter.on(key, actions[key])
}
export default emitter
