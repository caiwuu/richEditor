// 实验性代码，方案验证
import getCursorXY from './getPointPosition';
import Pointer from './pointer';
// 获取输入区域dom 暂时写死一个
const input = document.querySelector('#editor-body');
// 创建一个光标pointer
const pointer = new Pointer();
// 最后一次的range对象
let lastRange = null;
// 编辑框点击事件 获取lastRange 再通过shadow input 获取pointer坐标 （px）
input.onclick = function (e) {
  var selection = document.getSelection();
  console.log('selection', selection);
  // 保存最后的range对象
  lastRange = selection.getRangeAt(0);
  console.log(lastRange);

  const { x, y } = getCursorXY(lastRange.endOffset, e);
  pointer.setPosition(x, y);
  pointer.focus();
};
