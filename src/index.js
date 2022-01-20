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
    this.ui = new UI(bodyVnode, this)
    this.ui.mount(id)
    this.selection = new Selection(this)
    this._command = new Command(this)
    this.initActions()
  }
  setActionBar(ops) {
    this.ui.setActionBar(ops)
  }
  execCommand(name, ...args) {
    this._command._exexCommand_(name, ...args)
  }
  defineCommand(name, fn) {
    this._command._defineCommand_(name, fn)
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
window.editor.setActionBar([
  {
    key: 'bold',
    title: '加粗',
    command: 'bold',
    onMessage: (vnode) => {
      console.log(111)
      console.log(vnode)
    },
  },
  { key: 'delete', title: '删除', command: 'delete' },
])
window.log = function (params) {
  if (window.openLog) {
    console.log(params)
  }
}
