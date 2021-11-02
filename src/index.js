// 实验性代码，方案验证
import Cursor from './cursor';
import state from './state/';
let timmer = null;
// 获取输入区域dom 暂时写死一个
const input = document.querySelector('#editor-body');
input.setAttribute('contenteditable', true);
const cursor = new Cursor();
input.onmousedown = function () {
  state.mouseState = 'down';
  state.selectState = 'release';
  if (timmer) {
    clearTimeout(timmer);
  }
  timmer = setTimeout(() => {
    cursor.caret.style.animationName = 'caret';
  }, 1000);
  setTimeout(() => {
    cursor.caret.style.animationName = 'caret-static';
    cursor.followSysCaret();
  });
};
input.onmousemove = function () {
  if (state.mouseState === 'down') {
    state.selectState = 'selecting';
  }
};
input.onmouseup = function () {
  state.mouseState = 'up';
  if (state.selectState === 'selecting') {
    state.selectState = 'selected';
  }
  setTimeout(() => {
    cursor.caret.style.animationName = 'caret-static';
    cursor.followSysCaret();
    if (state.selectState !== 'selected') {
      input.setAttribute('contenteditable', true);
      cursor.focus();
    } else {
      input.setAttribute('contenteditable', false);
    }
  });
};
document.onkeydown = grabEvent;
function grabEvent(event) {
  input.setAttribute('contenteditable', true);
  cursor.focus();
  const key = event.key;
  cursor.caret.style.animationName = 'caret-static';
  switch (key) {
    case 'ArrowUp':
    case 'ArrowLeft':
    case 'ArrowRight':
    case 'ArrowDown':
      // case 'Backspace':
      if (document.activeElement.id === 'custom-input') {
        // 焦点恢复到内容区域以便于使用光标系统
        const { selection, range, text, offset } = cursor.meta;
        range.setStart(text, offset);
        range.setEnd(text, offset);
        selection.removeAllRanges();
        selection.addRange(range);
        setTimeout(() => {
          cursor.followSysCaret();
          cursor.focus();
        });
      }
  }
}
document.onkeyup = function (event) {
  // const key = event.key;
  if (timmer) {
    clearTimeout(timmer);
  }
  timmer = setTimeout(() => {
    cursor.caret.style.animationName = 'caret';
  }, 1000);
  // switch (key) {
  //   case 'ArrowUp':
  //   case 'ArrowLeft':
  //   case 'ArrowRight':
  //   case 'ArrowDown':
  //     // case 'Backspace':
  //     // 焦点恢复到 自定义光标上（input）
  //     cursor.followSysCaret();
  //     cursor.focus();
  // }
};
