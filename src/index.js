import UI from './ui'
import Selection from './selection'
import Command from './command'
import mitt from 'mitt'
import defaultActions from './actions'
import { bodyVnode, operBarVnode } from './ui/uiVnode'
class Editor {
  constructor(id) {
    this.init(id)
  }
  init(id) {
    this.ui = new UI(bodyVnode, operBarVnode)
    this.ui.mount(id)
    this.selection = new Selection(this)
    this.command = new Command(this)
    this.initActions()
  }
  destroy() {
    this.selection.destroy()
  }
  initActions() {
    this._action = mitt()
    for (const key in defaultActions) {
      this._action.on(key, defaultActions[key].bind(this))
    }
  }
  on(name, fn) {
    const defaultActinsNames = Object.keys(defaultActions)
    if (defaultActinsNames.includes(name)) throw new Error('不能覆盖系统默认动作')
    this._action.on(name, fn.bind(this))
  }
  dispatch(name, ...args) {
    this._action.emit(name, args)
  }
}

window.editor = new Editor('editor-root')
window.log = function (params) {
  if (window.openLog) {
    console.log(params)
  }
}
