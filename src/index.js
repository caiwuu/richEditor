import Cursor from './cursor';
import VNode from './vnode';
import action from './actions';
class Editor {
  vnode = null;
  cursor = null;
  state = { mouseState: 'up', selecting: false, selectState: 'release' };
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
            {
              tag: 'br',
            },
          ],
          style: { color: 'red' },
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
        this.cursor.hidden();
      }
    });
  }
  handGolobalBlur() {
    this.cursor.hidden();
  }
  handGolobalKeydown(event) {
    if (this.state.selectState === 'selected') {
      this.editorBody.setAttribute('contenteditable', true);
      this.cursor.focus();
    }
    const key = event.key;
    this.cursor.caret.style.animationName = 'caret-static';
    switch (key) {
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
    this.cursor.show();
    this.state.mouseState = 'down';
    this.state.selectState = 'release';
    if (this.timmer) {
      clearTimeout(this.timmer);
    }
    this.timmer = setTimeout(() => {
      this.cursor.caret.style.animationName = 'caret';
    }, 1000);
    setTimeout(() => {
      this.cursor.caret.style.animationName = 'caret-static';
      this.cursor.followSysCaret();
    });
  }
  handMousemove() {
    if (this.state.mouseState === 'down') {
      this.state.selectState = 'selecting';
      this.cursor.hidden();
    }
  }
  handMouseup() {
    this.state.mouseState = 'up';
    if (this.state.selectState === 'selecting') {
      this.state.selectState = 'selected';
    }
    setTimeout(() => {
      this.cursor.caret.style.animationName = 'caret-static';
      this.cursor.followSysCaret();
      if (this.state.selectState !== 'selected') {
        this.editorBody.setAttribute('contenteditable', true);
        this.cursor.focus();
      } else {
        this.editorBody.setAttribute('contenteditable', false);
      }
    });
    // action 测试
    action.emit('test');
  }
}
new Editor('editor-container');
