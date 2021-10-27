// 实验性代码，方案验证
import Cursor from './cursor'
// 获取输入区域dom 暂时写死一个
const input = document.querySelector('#editor-body')
input.setAttribute('contenteditable', true)
const cursor = new Cursor()
input.onclick = function () {
  cursor.setPosition()
  cursor.focus()
}
document.onkeydown = grabEvent
function grabEvent(event) {
  const keycode = event.which || event.keyCode
  switch (keycode) {
    case 37:
    case 38:
    case 39:
    case 40:
      if (document.activeElement.id === 'custom-cursor') {
        // 焦点恢复到内容区域以便于使用光标系统
        const { selection, range, text, offset } = cursor.meta
        range.setStart(text, offset)
        range.setEnd(text, offset)
        selection.removeAllRanges()
        selection.addRange(range)
      }
  }
}
document.onkeyup = function (event) {
  const keycode = event.which || event.keyCode
  switch (keycode) {
    case 37:
    case 38:
    case 39:
    case 40:
      // 焦点恢复到 自定义光标上（input）
      cursor.setPosition()
      cursor.focus()
  }
}
