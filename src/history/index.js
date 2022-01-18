import { clonePureVnode } from '../utils/index'
export default class History {
  size = 10
  queue = []
  current = -1
  range = null
  editor = null
  constructor(size, editor) {
    this.size = size
    this.editor = editor
  }
  push(vnode, range) {
    if (this.queue.length === this.size) {
      this.queue.shift()
    }
    this.queue.push({ vnode: clonePureVnode(vnode), range })
    this.current = this.queue.length - 1
  }
  forward() {
    if (this.current === this.queue.length - 1) {
      return false
    } else {
      this.current++
      this.editor.vnode.update(this.queue[this.current]['vnode'])
    }
  }
  back() {
    if (this.current === 0) {
      return false
    } else {
      this.current--
      this.editor.vnode.update(this.queue[this.current]['vnode'])
    }
  }
}
