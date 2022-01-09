// 最后一次的range对象
var lastRange = null
// 编辑框dom
var rangeDivDom = document.querySelector('#range-div')
// 编辑框点击事件
rangeDivDom.onclick = function (e) {
  var selection = document.getSelection()
  log('selection', selection)
  // 保存最后的range对象
  lastRange = selection.getRangeAt(0)
  log('selection', lastRange)
}
// 编辑框键盘按键松开事件
rangeDivDom.onkeyup = function (e) {
  var selection = document.getSelection()
  log('selection', selection)
  // 保存最后的range对象
  lastRange = selection.getRangeAt(0)
  log('selection', selection)
}
// 插入内容
window.insertText = function () {
  var selection = document.getSelection()
  selection.removeAllRanges()
  selection.addRange(lastRange)
  var range = selection.getRangeAt(0)
  log(range)
  var textNode = range.startContainer
  var startOffset = range.startOffset
  var insertValue = document.querySelector('#insert-input').value
  textNode.insertData(startOffset, insertValue)
  range.setStart(textNode, startOffset + insertValue.length)
  selection.addRange(range)
}
