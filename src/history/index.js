import { clonePureVnode } from '../utils/index'
export default class History {
  size = 10
  queue = []
  current = -1
  range = null
  vm = null
  constructor(size, vm) {
    this.size = size
    this.vm = vm
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
      this.vm.vnode.update(this.queue[this.current]['vnode'])
    }
  }
  back() {
    if (this.current === 0) {
      return false
    } else {
      this.current--
      this.vm.vnode.update(this.queue[this.current]['vnode'])
    }
  }
}
