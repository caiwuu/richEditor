// import render from './render'
import createVnode from '../vnode'
import initStyle from './style'
import defaultBar from './defaultBar'
import mitt from 'mitt'

export default class UI {
  constructor(editableAreaOps, editor) {
    this.editor = editor
    this.emitter = mitt()
    this.editableArea = createVnode(editableAreaOps, null).ele
    this.editableArea.vnode.editor = editor
    this.actionBar = createVnode(this.genActionBarOps(defaultBar), null).ele
    this.editorContainer = document.createElement('div')
    this.editorContainer.style['border'] = '2px solid #eee'
    this.editorContainer.style['background'] = '#ffffff'
    this.editorContainer.style['padding'] = '30px'
  }
  notice(key, ...args) {
    this.emitter.emit(key, args)
  }
  setActionBar(ops) {
    this.emitter.all.clear()
    const newBar = createVnode(this.genActionBarOps(ops), null).ele
    this.updateActionBar(newBar)
  }
  updateActionBar(newBar) {
    this.root.replaceChild(newBar, this.actionBar)
  }
  mount(id) {
    initStyle(id)
    const root = document.getElementById(id)
    root.appendChild(this.actionBar)
    this.editorContainer.appendChild(this.editableArea)
    root.appendChild(this.editorContainer)
    this.root = root
  }
  updateEditableArea(editableAreaOps) {
    const ele = createVnode(editableAreaOps, null).ele
    document.getElementById(this.rootId).replaceChild(ele, this.editableArea)
    this.editableArea = ele
  }
  genActionBarOps(ops) {
    const self = this
    return {
      type: 'div',
      style: { width: '100%', height: '30px', background: '#ddd', lineHeight: '30px' },
      childrens: ops.map((ele) => {
        if (ele.isVnode) {
          return ele
        } else {
          return {
            type: 'span',
            childrens: [{ type: 'text', context: `| ${ele.title}  ` }],
            style: { cursor: 'pointer', userSelect: 'none' },
            listen: { emitter: self.emitter, key: ele.key, onMessage: ele.onMessage },
            event: {
              onclick: function () {
                if (typeof ele.command === 'function') {
                  ele.command(self.vnode, self.editor)
                } else {
                  self.editor.execCommand(ele.command)
                  self.notice('bold', 1, 2, 3)
                }
              },
            },
          }
        }
      }),
    }
  }
}
