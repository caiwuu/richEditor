import { setStyle } from '../../utils'
export default class Input {
  dom = null
  constructor(selection) {
    this.selection = selection
    this.dom = document.createElement('input')
    this.dom.classList.add('custom-input')
    selection.vm.ui.root.appendChild(this.dom)
    this.initEvent()
  }
  focus() {
    const range = this.selection.getRangeAt(0)
    if (!range) return
    const style = {
      top: range.caret.rect.y + 'px',
      left: range.caret.rect.x + 'px',
    }
    setStyle(this.dom, style)
    this.dom.focus()
  }
  initEvent() {
    this.dom.addEventListener('compositionstart', this.handleEvent.bind(this))
    this.dom.addEventListener('compositionend', this.handleEvent.bind(this))
    this.dom.addEventListener('input', this.handleEvent.bind(this))
  }
  handleEvent(event) {
    // console.log(`--->${event.type}: ${event.data}--${event.isComposing}--${event.target.value}\n`)
  }
}
