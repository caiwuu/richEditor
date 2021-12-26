class VnodeTool {
  constructor(vnode) {
    this.vnode = vnode
  }
  from(index) {
    this.pos = index
    return this
  }
  del(num) {
    if (this.vnode.tag === 'text') {
      this.vnode.context = this.vnode.context.slice(0, this.pos - num) + this.vnode.context.slice(this.pos)
      this.vnode.ele.data = this.vnode.context
    } else {
    }
  }
}

export default function vt(vnode) {
  return new VnodeTool(vnode)
}
