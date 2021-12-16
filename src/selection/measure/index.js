export default class Measure {
  dom = null
  constructor() {
    this.dom = document.createElement('text')
  }
  measure(range) {
    const startOffset = range.startOffset
    const vnode = range.startContainer.vnode
    // splitText(0)会使原dom销毁造成startContainer向上逃逸，
    if (vnode.tag === 'text') {
      if (!startOffset) {
        vnode.ele.parentNode.insertBefore(this.dom, vnode.ele)
      } else {
        vnode.ele.parentNode.insertBefore(this.dom, vnode.ele.splitText(startOffset))
      }
    } else {
      if (vnode.childrens[startOffset]) {
        vnode.ele.insertBefore(this.dom, vnode.ele.childNodes[startOffset])
      } else {
        vnode.ele.appendChild(this.dom)
      }
    }
    return this.getRect(vnode)
  }
  getRect(vnode) {
    const { offsetLeft: x, offsetTop: y } = this.dom
    const rect = { x, y }
    this.dom.remove()
    if (vnode.tag === 'text') {
      if (!vnode.context && vnode.ele.nextSibling) {
        vnode.ele.nextSibling.remove()
      } else {
        vnode.ele.parentNode.normalize()
      }
    }
    return rect
  }
}
