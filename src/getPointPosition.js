export default function (e) {
  // 获取选取
  const selection = document.getSelection();
  const range = selection.getRangeAt(0);
  // 点击的元素
  // const focusTaget = e.target
  // 光标存在的节点
  const pointerContainer = range.endContainer;
  // 相对于 focusTaget 的偏移量
  const offset = range.endOffset;
  const virtualCursor = document.createElement('span');

  const endNode = pointerContainer.splitText(offset);
  pointerContainer.parentNode.insertBefore(endNode, pointerContainer.nextSibling);
  pointerContainer.parentNode.insertBefore(virtualCursor, endNode);

  // 内容分割 左边l 光标测量标签  右边r
  // TODO 抽离一层文本协议来避免脏dom生成

  const { offsetLeft: x, offsetTop: y } = virtualCursor;
  pointerContainer.parentNode.removeChild(virtualCursor);
  pointerContainer.parentNode.normalize();
  return {
    x: x,
    y: y,
    offset,
    range,
    selection,
    container: pointerContainer.parentNode,
    text: pointerContainer,
  };
}
