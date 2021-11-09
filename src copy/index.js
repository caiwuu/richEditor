import Cursor from './cursor';
import VNode from './vnode';
import action from './actions';
class Editor {
  mouseStats = 'up';
  vnode = null;
  cursor = null;
  timmer = null;
  root = null;
  editorBody = null;
  constructor(id) {
    this.vnode = new VNode();
    this.root = document.getElementById(id);
    this.cursor = new Cursor(this);
    this.initEditorBody();
    this.addListeners();
  }
  initEditorBody() {
    this.editorBody = this.vnode.init({
      tag: 'div',
      childrens: [
        {
          tag: 'p',
          childrens: [
            { tag: 'text', context: '普通文字' },
            {
              tag: 'span',
              childrens: [{ tag: 'text', context: '加了样式的文字' }],
              style: { color: 'red', fontSize: '36px' },
            },
          ],
          style: { color: '#888' },
        },
      ],
      attr: { id: 'editor-body', contenteditable: true },
    });
    this.root.appendChild(this.editorBody);
  }
  addListeners() {
    window.addEventListener('mousedown', this.handGolobalMouseDown.bind(this));
    window.addEventListener('blur', this.handGolobalBlur.bind(this));
    this.editorBody.addEventListener('mousedown', this.handMousedown.bind(this));
    this.editorBody.addEventListener('mousemove', this.handMousemove.bind(this));
    this.editorBody.addEventListener('mouseup', this.handMouseup.bind(this));
    document.addEventListener('keydown', this.handGolobalKeydown.bind(this));
    document.addEventListener('keyup', this.handGolobalKeyup.bind(this));
  }
  destroy() {
    window.removeEventListener('mousedown', this.handGolobalMouseDown.bind(this));
    window.removeEventListener('blur', this.handGolobalBlur.bind(this));
    this.editorBody.removeEventListener('mousedown', this.handMousedown.bind(this));
    this.editorBody.removeEventListener('mousemove', this.handMousemove.bind(this));
    this.editorBody.removeEventListener('mouseup', this.handMouseup.bind(this));
    document.removeEventListener('keydown', this.handGolobalKeydown.bind(this));
    document.removeEventListener('keyup', this.handGolobalKeyup.bind(this));
  }
  handGolobalMouseDown() {
    setTimeout(() => {
      if (!this.root.contains(document.activeElement)) {
        console.log('handGolobalMouseDown');
        this.cursor.hidden();
      }
    });
  }
  handGolobalBlur() {
    console.log('handGolobalBlur');
    this.cursor.hidden();
  }
  handGolobalKeydown(event) {
    if (!this.cursor.meta.range.collapsed) {
      this.editorBody.setAttribute('contenteditable', true);
      this.cursor.focus();
    }
    const key = event.key;
    this.cursor.caret.style.animationName = 'caret-static';
    console.log(key);
    switch (key) {
      case 'Backspace':
      case 'Enter':
        event.preventDefault();
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowDown':
        if (document.activeElement.id === 'custom-input') {
          // 焦点恢复到内容区域以便于使用光标系统
          const { selection, range, text, offset } = this.cursor.meta;
          range.setStart(text, offset);
          range.setEnd(text, offset);
          selection.removeAllRanges();
          selection.addRange(range);
          setTimeout(() => {
            this.cursor.followSysCaret();
            this.cursor.focus();
          });
        }
    }
  }
  handGolobalKeyup() {
    if (this.timmer) {
      clearTimeout(this.timmer);
    }
    this.timmer = setTimeout(() => {
      this.cursor.caret.style.animationName = 'caret';
    }, 1000);
  }
  handMousedown() {
    this.mouseStats = 'down';
    this.cursor.meta.range && this.cursor.meta.range.collapse(true);
    this.cursor.show();
    if (this.timmer) {
      clearTimeout(this.timmer);
    }
    this.timmer = setTimeout(() => {
      this.cursor.caret.style.animationName = 'caret';
    }, 1000);
    setTimeout(() => {
      this.cursor.caret.style.animationName = 'caret-static';
      this.cursor.followSysCaret();
      console.log(1);
    });
  }
  handMousemove() {
    if (this.mouseStats === 'down') {
      this.cursor.hidden();
    }
  }
  handMouseup() {
    this.mouseStats = 'up';
    setTimeout(() => {
      this.cursor.caret.style.animationName = 'caret-static';
      this.cursor.followSysCaret();
      console.log(this.cursor.meta.range.collapsed);
      if (this.cursor.meta.range.collapsed) {
        this.editorBody.setAttribute('contenteditable', true);
        this.cursor.focus();
      } else {
        this.cursor.hidden();
        this.editorBody.setAttribute('contenteditable', false);
      }
    });
    // action 测试
    action.emit('test');
  }
}
new Editor('editor-container');