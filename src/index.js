import Cursor from './cursor'
import VNode from './vnode'
import action from './actions'
import testData from './test'
class Editor {
  scrollTop = 0
  mouseStats = 'up'
  vnode = null
  cursor = null
  timmer = null
  root = null
  editorContainer = null
  editorBody = null
  constructor(id) {
    action.on('test', (value) => {
      console.log(value)
    })
    this.vnode = new VNode(testData)
    const { editorContainer, editorBody } = this.vnode.mount(id)
    this.editorBody = editorBody
    this.editorContainer = editorContainer
    this.root = document.getElementById(id)
    this.cursor = new Cursor(this)
    this.addListeners()
  }
  addListeners() {
    window.addEventListener('mousedown', this.handGolobalMouseDown.bind(this))
    window.addEventListener('blur', this.handGolobalBlur.bind(this))
    this.editorContainer.addEventListener('mousedown', this.handMousedown.bind(this))
    this.editorContainer.addEventListener('mousemove', this.handMousemove.bind(this))
    this.editorContainer.addEventListener('mouseup', this.handMouseup.bind(this))
    document.addEventListener('keydown', this.handGolobalKeydown.bind(this))
    document.addEventListener('keyup', this.handGolobalKeyup.bind(this))
  }
  destroy() {
    window.removeEventListener('mousedown', this.handGolobalMouseDown.bind(this))
    window.removeEventListener('blur', this.handGolobalBlur.bind(this))
    this.editorContainer.removeEventListener('mousedown', this.handMousedown.bind(this))
    this.editorContainer.removeEventListener('mousemove', this.handMousemove.bind(this))
    this.editorContainer.removeEventListener('mouseup', this.handMouseup.bind(this))
    document.removeEventListener('keydown', this.handGolobalKeydown.bind(this))
    document.removeEventListener('keyup', this.handGolobalKeyup.bind(this))
  }
  handGolobalMouseDown() {
    setTimeout(() => {
      if (!this.editorContainer.contains(document.activeElement)) {
        this.cursor.hidden()
      }
    })
  }
  handGolobalBlur() {
    this.cursor.hidden()
  }
  handGolobalKeydown(event) {
    // 记录滚动条，因为focus浮动元素会重置滚动条
    this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    if (this.cursor.meta.range && !this.cursor.meta.range.collapsed) {
      this.editorBody.setAttribute('contenteditable', true)
      this.cursor.focus()
    }
    const key = event.key
    console.log(key)
    this.cursor.caret.style.animationName = 'caret-static'
    switch (key) {
      case 'Backspace':
        event.preventDefault()
        if (!this.cursor.inputState.isComposing) {
          action.emit('del', this)
        }
        break
      case 'Enter':
        event.preventDefault()
        break
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowDown':
        if (document.activeElement.id === 'custom-input') {
          // 焦点恢复到内容区域以便于使用光标系统
          const { selection, range, end } = this.cursor.meta
          range.setStart(range.endContainer, end)
          range.setEnd(range.endContainer, end)
          selection.removeAllRanges()
          selection.addRange(range)
          setTimeout(() => {
            this.cursor.followSysCaret()
            this.cursor.focus()
          })
        }
        break
    }
  }
  handGolobalKeyup() {
    if (this.timmer) {
      clearTimeout(this.timmer)
    }
    this.timmer = setTimeout(() => {
      this.cursor.caret.style.animationName = 'caret'
    }, 1000)
  }
  handMousedown() {
    this.scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    this.mouseStats = 'down'
    this.cursor.meta.range && this.cursor.meta.range.collapse(true)
    this.cursor.show()
    if (this.timmer) {
      clearTimeout(this.timmer)
    }
    this.timmer = setTimeout(() => {
      this.cursor.caret.style.animationName = 'caret'
    }, 1000)
    setTimeout(() => {
      this.cursor.caret.style.animationName = 'caret-static'
      this.cursor.followSysCaret()
    })
  }
  handMousemove() {
    // 选择内容时隐藏光标
    if (this.mouseStats === 'down') {
      this.cursor.hidden()
    }
  }
  handMouseup() {
    this.mouseStats = 'up'
    this.cursor.caret.style.animationName = 'caret-static'
    let range = null
    try {
      range = this.cursor.selection.getRange()
    } catch (error) {
      console.warn(error)
      range = this.cursor.meta.range
    }
    if (!range) return
    if (range.collapsed) {
      this.editorBody.setAttribute('contenteditable', true)
      this.cursor.focus()
    } else {
      this.cursor.followSysCaret()
      this.cursor.hidden()
      this.editorBody.setAttribute('contenteditable', false)
    }
  }
}
window.editor = new Editor('editor-root')
