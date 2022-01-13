import UI from './ui'
import Selection from './selection'
import Command from './command'
import { bodyVnode, operBarVnode } from './uiVnode'
class Editor {
  constructor(id) {
    this.init(id)
  }
  init(id) {
    this.ui = new UI(bodyVnode, operBarVnode)
    this.ui.mount(id)
    this.selection = new Selection(this)
    this.command = new Command(this)
  }
  destroy() {
    this.selection.destroy()
  }
}

window.editor = new Editor('editor-root')
window.log = function (params) {
  if (window.openLog) {
    console.log(params)
  }
}
