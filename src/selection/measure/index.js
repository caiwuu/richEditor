export default class Measure {
  dom = null
  constructor() {
    this.dom = document.createElement('span')
  }
  measure(range) {
    const startOffset = range.startOffset
    const vnode = range.startContainer.vnode
    if (vnode.tag === 'text') {
      vnode.ele.parentNode.insertBefore(this.dom, vnode.ele.splitText(startOffset))
    } else {
      if (vnode.childrens[startOffset]) {
        vnode.ele.insertBefore(this.dom, vnode.ele.childNodes[startOffset])
      } else {
        vnode.ele.appendChild(this.dom)
      }
    }
    return this.getRect(vnode,startOffset)
  }
  getRect(vnode,startOffset) {
    const { offsetLeft: x, offsetTop: y } = this.dom
    const rect = {x,y}
    this.dom.remove()
    if (vnode.tag === 'text') {
      if (!startOffset && vnode.ele.nextSibling) {
        vnode.ele.data = vnode.ele.nextSibling.data
        vnode.ele.nextSibling.data = ''
      }
      if (!vnode.context && vnode.ele.nextSibling) {
        vnode.ele.nextSibling.remove()
      } else {
        vnode.ele.parentNode.normalize()
      }
    }
    return rect
  }
}
