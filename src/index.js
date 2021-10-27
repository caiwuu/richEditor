// 实验性代码，方案验证
import getCursorXY from './getPointPosition';
import Pointer from './pointer';
// 获取输入区域dom 暂时写死一个
const input = document.querySelector('#editor-body');
// 创建一个光标pointer
const pointer = new Pointer();
let historyPointer = null;
// 编辑框点击事件 获取lastRange 再通过shadow input 获取pointer坐标 （px）
input.onclick = function (e) {
  const metaPointer = getCursorXY(e);
  pointer.setPosition(metaPointer);
  console.log('x', metaPointer);
  console.log('x', metaPointer.x);
  pointer.focus();
  historyPointer = metaPointer;

  // 恢复选区
};

document.onkeydown = grabEvent;
function grabEvent(event) {
  var keycode = event.which || event.keyCode;
  switch (keycode) {
    case 37:
    case 38:
    case 39:
    case 40:
      if (document.activeElement.id === 'pointer') {
        console.log(document.activeElement.id);
        const selection = document.getSelection();
        const range = document.createRange();
        range.setStart(historyPointer.text, historyPointer.offset);
        range.setEnd(historyPointer.text, historyPointer.offset);
        selection.removeAllRanges();
        selection.addRange(range);
      }
  }
}
document.onkeyup = function (event) {
  pointer.setPosition(historyPointer);
  const metaPointer = getCursorXY(event);
  console.log('x', metaPointer.x);
  pointer.setPosition(metaPointer);
  historyPointer = metaPointer;
  // 这里改变了文档的选区
  pointer.focus();
};
