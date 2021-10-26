export default function (offset, e) {
  // 获取点击元素
  const focusTaget = e.target;
  console.log([focusTaget]);
  const focusTagetText = focusTaget.innerText;
  // 内容分割 左边l 光标测量标签  右边r
  // TODO 抽离一层文本协议来避免脏dom生成
  const l = focusTagetText.substr(0, offset);
  focusTaget.textContent = l;
  const virtualCursor = document.createElement('span');
  const span = document.createElement('span');
  const r = focusTagetText.substr(offset);
  span.textContent = r;
  focusTaget.appendChild(virtualCursor);
  focusTaget.appendChild(span);
  const { offsetLeft: x, offsetTop: y } = virtualCursor;
  focusTaget.removeChild(virtualCursor);
  return {
    x: x - 2,
    y: y + 2,
  };
}
