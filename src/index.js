// 实验性代码，方案验证
import Cursor from './cursor';
// 获取输入区域dom 暂时写死一个
const input = document.querySelector('#editor-body');
input.setAttribute('contenteditable', true);
const cursor = new Cursor();
input.onmouseup = function () {
  cursor.setPosition();
  cursor.focus();
};
document.onkeydown = grabEvent;
function grabEvent(event) {
  const key = event.key;
  switch (key) {
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'ArrowRight':
    case 'ArrowDown':
    case 'Backspace':
      if (document.activeElement.id === 'custom-cursor') {
        // 焦点恢复到内容区域以便于使用光标系统
        const { selection, range, text, offset } = cursor.meta;
        range.setStart(text, offset);
        range.setEnd(text, offset);
        selection.removeAllRanges();
        selection.addRange(range);
      }
  }
}
document.onkeyup = function (event) {
  const key = event.key;
  switch (key) {
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'ArrowRight':
    case 'ArrowDown':
    case 'Backspace':
      // 焦点恢复到 自定义光标上（input）
      cursor.setPosition();
      cursor.focus();
  }
};
