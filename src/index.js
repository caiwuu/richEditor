// 实验性代码，方案验证
import Cursor from './cursor'
import state from './state/'
// 获取输入区域dom 暂时写死一个
const input = document.querySelector('#editor-body')
input.setAttribute('contenteditable', true)
const cursor = new Cursor()
input.onclick = function () {
  cursor.followSysCaret()
  cursor.focus()
}
document.onkeydown = grabEvent
function grabEvent(event) {
  state.keyboard = event.key
  console.log(event.key)
  const key = event.key
  switch (key) {
    case 'ArrowUp':
    case 'ArrowLeft':
    case 'ArrowRight':
    case 'ArrowDown':
      // case 'Backspace':
      if (document.activeElement.id === 'custom-input') {
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
  const key = event.key
  switch (key) {
    case 'ArrowUp':
    case 'ArrowLeft':
    case 'ArrowRight':
    case 'ArrowDown':
      // case 'Backspace':
      // 焦点恢复到 自定义光标上（input）
      cursor.followSysCaret()
      cursor.focus()
  }
}
