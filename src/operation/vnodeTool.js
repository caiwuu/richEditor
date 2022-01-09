class VnodeTool {
  type = 0
  constructor(vnode) {
    this.vnode = vnode
  }
  from(pos) {
    this.type = 0
    this.pos = pos
    return this
  }
  del(num) {
    switch (this.type) {
      case 0:
        if (this.vnode.tag === 'text') {
          // this.vnode.context = this.vnode.context.slice(0, this.pos - num) + this.vnode.context.slice(this.pos)
          this.vnode.delete
          // this.vnode.ele.data = this.vnode.context
        }
        break

      default:
        break
    }
  }
}

export default function vt(vnode) {
  log('o')
  return new VnodeTool(vnode)
}
