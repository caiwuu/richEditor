import { styleSet } from '../utils/styleOp';
import { multiplication } from '../utils/pixelsCalc';
import Selection from '../selection';
export default class Cursor {
  cursor = null;
  selection = null;
  meta = {
    x: 0,
    y: 0,
    offset: 0,
    range: null,
    selection: null,
    container: null,
    text: null,
  };
  constructor() {
    const cursor = document.createElement('input');
    cursor.id = 'custom-cursor';
    const styleObj = {
      top: '-100px',
      left: 0,
      position: 'absolute',
      width: '0.5px',
      background: 'transparent',
      border: 'none',
      padding: 0,
    };
    styleSet(cursor, styleObj);
    document.body.appendChild(cursor);
    this.cursor = cursor;
    this.selection = new Selection();
  }
  setPosition(metaPointer) {
    const copyStyle = getComputedStyle(metaPointer.container);
    const lineHeight = multiplication(copyStyle.fontSize, 1.3);
    const styleObj = {
      top: metaPointer.y + 'px',
      left: metaPointer.x + 'px',
      lineHeight,
      lineHeight: copyStyle.fontSize,
      color: copyStyle.color,
    };
    styleSet(this.cursor, styleObj);
  }
  focus() {
    this.cursor.focus();
  }
  getPosition() {
    const range = this.selection.getRange();
    const pointerContainer = range.endContainer;

    this.meta.range = range;
    this.meta.text = range.endContainer;
    this.meta.offset = range.endOffset;
    this.meta.container = range.endContainer.parentNode;

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
}
