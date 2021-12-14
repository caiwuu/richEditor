export default class Measure {
  dom = null
  constructor() {
    this.dom = document.createElement('span')
  }
  measure(vnode, offset) {
    if (vnode.tag === 'text') {
      vnode.ele.parentNode.insertBefore(this.dom, vnode.ele.splitText(offset))
    } else {
      if (vnode.childrens[offset]) {
        vnode.ele.insertBefore(this.dom, vnode.ele.childNodes[offset])
      } else {
        vnode.ele.appendChild(this.dom)
      }
    }
    return this.getRect()
  }
  getRect() {
    const rect = this.dom.getBoundingClientRect
    this.dom.remove()
    return rect
  }
}
