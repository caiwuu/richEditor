export default class Measure {
  dom = null
  instance = null
  constructor() {
    if (!Measure.instance) {
      this.dom = document.createElement('text')
      Measure.instance = this
    } else {
      return Measure.instance
    }
  }
  measure(container, offset) {
    // splitText(0)会使原dom销毁造成startContainer向上逃逸， nodeName = '#text'
    let temp
    if (container.nodeName === '#text') {
      if (!offset) {
        container.parentNode.insertBefore(this.dom, container)
      } else {
        temp = container.splitText(offset)
        container.parentNode.insertBefore(this.dom, temp)
      }
    } else {
      if (container.childNodes[offset]) {
        container.insertBefore(this.dom, container.childNodes[offset])
      } else {
        container.appendChild(this.dom)
      }
    }
    return this._getRect(container, offset, temp)
  }
  _getRect(container, offset, temp) {
    const { offsetLeft: x, offsetTop: y, offsetHeight: h } = this.dom
    const rect = { x, y, h }
    this.dom.remove()
    if (container.nodeName === '#text' && offset) {
      if (!container.data && container.nextSibling) {
        container.nextSibling.remove()
      } else {
        container.data += temp.data
        temp.remove()
        // container.parentNode.vnode.normalize()
        // container.parentNode.normalize()
      }
    }
    return rect
  }
}
