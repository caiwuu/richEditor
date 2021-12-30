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
    if (container.nodeName === '#text') {
      if (!offset) {
        container.parentNode.insertBefore(this.dom, container)
      } else {
        container.parentNode.insertBefore(this.dom, container.splitText(offset))
      }
    } else {
      if (container.childNodes[offset]) {
        container.insertBefore(this.dom, container.childNodes[offset])
      } else {
        container.appendChild(this.dom)
      }
    }
    return this._getRect(container)
  }
  _getRect(container) {
    const { offsetLeft: x, offsetTop: y, offsetHeight: h } = this.dom
    const rect = { x, y, h }
    this.dom.remove()
    if (container.nodeName === '#text') {
      if (!container.data && container.nextSibling) {
        container.nextSibling.remove()
      } else {
        container.parentNode.normalize()
      }
    }
    return rect
  }
}
