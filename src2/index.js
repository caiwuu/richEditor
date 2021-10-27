// 实验性代码，方案验证
import getCursorXY from './getPointPosition';
import Pointer from './pointer';
// 获取输入区域dom 暂时写死一个
const input = document.querySelector('#editor-body');
input.setAttribute('contenteditable', true);
// 创建一个光标pointer
const pointer = new Pointer();
let historyPointer = null;
// 编辑框点击事件 获取lastRange 再通过shadow input 获取pointer坐标 （px）
input.onclick = function (e) {
  const metaPointer = getCursorXY(e);
  pointer.setPosition(metaPointer);
  pointer.focus();
  historyPointer = metaPointer;

  // 恢复选区
};

document.onkeydown = grabEvent;
function grabEvent(event) {
  const keycode = event.which || event.keyCode;
  switch (keycode) {
    case 37:
    case 38:
    case 39:
    case 40:
      if (document.activeElement.id === 'pointer') {
        // 焦点恢复到内容区域以便于使用光标系统
        const { selection, range, text, offset } = historyPointer;
        range.setStart(text, offset);
        range.setEnd(text, offset);
        selection.removeAllRanges();
        selection.addRange(range);
      }
  }
}
document.onkeyup = function (event) {
  const keycode = event.which || event.keyCode;
  switch (keycode) {
    case 37:
    case 38:
    case 39:
    case 40:
      // 焦点恢复到 自定义光标上（input）
      historyPointer = getCursorXY(event);
      pointer.setPosition(historyPointer);
      // 这里改变了文档的选区
      pointer.focus();
  }
};
