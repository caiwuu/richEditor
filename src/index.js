// 实验性代码，方案验证
import Cursor from './cursor';
// import state from './state/';
// const editorContainer = document.getElementById('editor-container');
// let timmer = null;
// // 获取输入区域
// // const input = document.querySelector('#editor-body');
// // 创建dom

class Editor {
  cursor = null;
  state = { mouseState: 'up', selecting: false, selectState: 'release' };
  timmer = null;
  root = null;
  editorBody = null;
  constructor(id) {
    this.root = document.getElementById(id);
    this.cursor = new Cursor(this.state, this.root);
    this.initEditorBody();
    this.addListeners();
  }
  initEditorBody() {
    this.editorBody = document.createElement('div');
    this.editorBody.setAttribute('contenteditable', true);
    const p = document.createElement('p');
    p.appendChild(document.createElement('br'));
    this.editorBody.appendChild(p);
    this.editorBody.id = 'editor-body';
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
      console.log(111111);
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
  }
}

// const input = document.createElement('div');
// const p = document.createElement('p');
// p.appendChild(document.createElement('br'));
// input.appendChild(p);
// input.id = 'editor-body';
// editorContainer.appendChild(input);
// // 事件监听
// window.onmousedown = (e) => {
//   setTimeout(() => {
//     if (!editorContainer.contains(document.activeElement)) {
//       cursor.hidden();
//     }
//   });
// };
// window.onblur = () => {
//   cursor.hidden();
// };
// input.setAttribute('contenteditable', true);
// const cursor = new Cursor();
// input.onmousedown = function () {
//   cursor.show();
//   state.mouseState = 'down';
//   state.selectState = 'release';
//   if (timmer) {
//     clearTimeout(timmer);
//   }
//   timmer = setTimeout(() => {
//     cursor.caret.style.animationName = 'caret';
//   }, 1000);
//   setTimeout(() => {
//     cursor.caret.style.animationName = 'caret-static';
//     cursor.followSysCaret();
//   });
// };
// input.onmousemove = function () {
//   if (state.mouseState === 'down') {
//     state.selectState = 'selecting';
//     cursor.hidden();
//   }
// };
// input.onmouseup = function () {
//   state.mouseState = 'up';
//   if (state.selectState === 'selecting') {
//     state.selectState = 'selected';
//   }
//   setTimeout(() => {
//     cursor.caret.style.animationName = 'caret-static';
//     cursor.followSysCaret();
//     if (state.selectState !== 'selected') {
//       input.setAttribute('contenteditable', true);
//       cursor.focus();
//     } else {
//       input.setAttribute('contenteditable', false);
//     }
//   });
// };
// document.onkeydown = grabEvent;
// function grabEvent(event) {
//   if (state.selectState === 'selected') {
//     input.setAttribute('contenteditable', true);
//     cursor.focus();
//   }
//   const key = event.key;
//   cursor.caret.style.animationName = 'caret-static';
//   switch (key) {
//     case 'ArrowUp':
//     case 'ArrowLeft':
//     case 'ArrowRight':
//     case 'ArrowDown':
//       // case 'Backspace':
//       if (document.activeElement.id === 'custom-input') {
//         // 焦点恢复到内容区域以便于使用光标系统
//         const { selection, range, text, offset } = cursor.meta;
//         range.setStart(text, offset);
//         range.setEnd(text, offset);
//         selection.removeAllRanges();
//         selection.addRange(range);
//         setTimeout(() => {
//           cursor.followSysCaret();
//           cursor.focus();
//         });
//       }
//   }
// }
// document.onkeyup = function (event) {
//   // const key = event.key;
//   if (timmer) {
//     clearTimeout(timmer);
//   }
//   timmer = setTimeout(() => {
//     cursor.caret.style.animationName = 'caret';
//   }, 1000);
// };

new Editor('editor-container');
