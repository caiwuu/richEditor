import Cursor from './cursor'
import VNode from './vnode'
import action from './actions'
class Editor {
  mouseStats = 'up'
  vnode = null
  cursor = null
  timmer = null
  root = null
  editorBody = null
  constructor(id) {
    this.vnode = new VNode({
      tag: 'div',
      childrens: [
        {
          tag: 'p',
          childrens: [
            { tag: 'text', context: '普通文字' },
            {
              tag: 'span',
              childrens: [{ tag: 'text', context: '加了样式的文字' }],
              style: { color: '#bbb', fontSize: '36px' },
            },
            // { tag: 'br' },
          ],
          style: { color: '#888' },
        },
        {
          tag: 'ul',
          childrens: [
            { tag: 'li', childrens: [{ tag: 'text', context: '123' }] },
            { tag: 'li', childrens: [{ tag: 'text', context: '456' }] },
            {
              tag: 'li',
              childrens: [
                {
                  tag: 'span',
                  childrens: [{ tag: 'text', context: '这是一个pan' }],
                },
              ],
            },
          ],
        },
        {
          tag: 'p',
          childrens: [{ tag: 'span', childrens: [{ tag: 'br' }] }],
        },
      ],
      attr: { id: 'editor-body', contenteditable: true },
      style: { minHeight: '200px' },
    })
    this.editorBody = this.vnode.mount(id)
    this.root = document.getElementById(id)
    this.cursor = new Cursor(this)
    this.addListeners()
  }
  addListeners() {
    window.addEventListener('mousedown', this.handGolobalMouseDown.bind(this))
    window.addEventListener('blur', this.handGolobalBlur.bind(this))
    this.root.addEventListener('mousedown', this.handMousedown.bind(this))
    this.root.addEventListener('mousemove', this.handMousemove.bind(this))
    this.root.addEventListener('mouseup', this.handMouseup.bind(this))
    document.addEventListener('keydown', this.handGolobalKeydown.bind(this))
    document.addEventListener('keyup', this.handGolobalKeyup.bind(this))
  }
  destroy() {
    window.removeEventListener('mousedown', this.handGolobalMouseDown.bind(this))
    window.removeEventListener('blur', this.handGolobalBlur.bind(this))
    this.root.removeEventListener('mousedown', this.handMousedown.bind(this))
    this.root.removeEventListener('mousemove', this.handMousemove.bind(this))
    this.root.removeEventListener('mouseup', this.handMouseup.bind(this))
    document.removeEventListener('keydown', this.handGolobalKeydown.bind(this))
    document.removeEventListener('keyup', this.handGolobalKeyup.bind(this))
  }
  handGolobalMouseDown() {
    setTimeout(() => {
      if (!this.root.contains(document.activeElement)) {
        this.cursor.hidden()
      }
    })
  }
  handGolobalBlur() {
    this.cursor.hidden()
  }
  handGolobalKeydown(event) {
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
    if (this.mouseStats === 'down') {
      this.cursor.hidden()
    }
  }
  handMouseup() {
    this.mouseStats = 'up'
    setTimeout(() => {
      this.cursor.caret.style.animationName = 'caret-static'
      this.cursor.followSysCaret()
      if (this.cursor.meta.range.collapsed) {
        this.editorBody.setAttribute('contenteditable', true)
        this.cursor.focus()
      } else {
        this.cursor.hidden()
        this.editorBody.setAttribute('contenteditable', false)
      }
    })
  }
}
window.editor = new Editor('editor-container')
