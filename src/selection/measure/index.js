export default class Measure {
  dom = null
  constructor() {
    this.dom = document.createElement('text')
  }
  measure(range) {
    let container, offset
    switch (range._d) {
      case 0:
      case 1:
        container = range.startContainer
        offset = range.startOffset
        break
      case 2:
        container = range.endContainer
        offset = range.endOffset
        break
    }
    const vnode = container.vnode
    // splitText(0)会使原dom销毁造成startContainer向上逃逸，
    if (vnode.tag === 'text') {
      if (!offset) {
        vnode.ele.parentNode.insertBefore(this.dom, vnode.ele)
      } else {
        vnode.ele.parentNode.insertBefore(this.dom, vnode.ele.splitText(offset))
      }
    } else {
      if (vnode.childrens[offset]) {
        vnode.ele.insertBefore(this.dom, vnode.ele.childNodes[offset])
      } else {
        vnode.ele.appendChild(this.dom)
      }
    }
    return this._getRect(vnode)
  }
  _getRect(vnode) {
    const { offsetLeft: x, offsetTop: y, offsetHeight: h } = this.dom
    const rect = { x, y, h }
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
