import UI from './ui'
import Selection from './selection'
import { bodyVnode, operBarVnode } from './uiVnode'
class Editor {
  constructor(id) {
    this.ui = new UI(bodyVnode, operBarVnode)
    this.ui.mount(id)
    this.selection = new Selection(this)
  }
  destroy() {
    this.selection.destroy()
  }
}
window.editor = new Editor('editor-root')
