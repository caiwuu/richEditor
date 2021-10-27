export default class Pointer {
  pointer = null;
  constructor() {
    const pointer = document.createElement('input');
    pointer.id = 'pointer';
    // TODO 设计一个公共方法来设置css
    pointer.style.top = '-100px';
    pointer.style.left = 0;
    pointer.style.position = 'absolute';
    pointer.style.width = '0.5px';
    pointer.style.background = 'transparent';
    // pointer.style.background = 'red';
    pointer.style.border = 'none';
    pointer.style.padding = 0;
    document.body.appendChild(pointer);
    this.pointer = pointer;
  }
  setPosition(metaPointer) {
    const copyStyle = getComputedStyle(metaPointer.container);
    this.pointer.style.top = metaPointer.y + 'px';
    this.pointer.style.left = metaPointer.x + 'px';
    this.pointer.style.lineHeight = computeLineHeightByFs(copyStyle.fontSize);
    this.pointer.style.fontSize = copyStyle.fontSize;
    this.pointer.style.color = copyStyle.color;
  }
  focus() {
    this.pointer.focus();
  }
  // TODO
  //   toTop() {}
  //   toDown() {}
  //   toLeft() {}
  //   toRight() {}
}
function computeLineHeightByFs(fontSize) {
  return fontSize.replace(/(.*)(px)+/, function ($0, $1) {
    return $1 * 1.3 + 'px';
  });
}
