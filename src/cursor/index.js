import { styleSet } from '../utils/styleOp';
import { multiplication } from '../utils/pixelsCalc';
import Selection from '../selection';
export default class Cursor {
  cursor = null;
  selection = null;
  inputState = {
    value: '',
    expect: '',
    done: true,
  };
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
    this.cursor = document.createElement('input');
    this.initEvent();
    this.cursor.id = 'custom-cursor';
    const styleObj = {
      top: '-100px',
      left: 0,
      position: 'absolute',
      width: '0.5px',
      background: 'transparent',
      border: 'none',
      padding: 0,
    };
    styleSet(this.cursor, styleObj);
    document.body.appendChild(this.cursor);
    this.selection = new Selection();
  }
  initEvent() {
    this.cursor.addEventListener('compositionstart', this.handleEvent.bind(this));
    // this.cursor.addEventListener('compositionupdate', this.handleEvent.bind(this));
    // this.cursor.addEventListener('compositionend', this.handleEvent.bind(this));
    this.cursor.addEventListener('input', this.handleEvent.bind(this));
  }
  handleEvent(event) {
    console.log(`--->${event.type}: ${event.data}\n`);
    if (event.type === this.inputState.expect) {
      if (event.type === 'input') {
      }
    } else {
    }
    // 键盘字符输入
    if (event.type === 'input') {
      if (this.inputState.done) {
        this.meta.text.data =
          this.meta.text.data.slice(0, this.meta.offset) + event.target.value + this.meta.text.data.slice(this.meta.offset);
        this.setCret(event.target.value.length);
        this.followSysCret();
        this.focus();
      } else {
        this.inputState.done = false;
        this.inputState.expect = 'compositionstart';
        this.inputState.value = event.data;
      }
    }
    if (event.type === 'compositionstart') {
      this.inputState.done = false;
      this.inputState.expect = 'input';
    }

    console.log('value', event.target.value);
    event.target.value = '';
  }

  /**
   * @param {*} meta
   * @memberof Cursor
   */
  setPosition(x, y, container) {
    const copyStyle = getComputedStyle(container);
    const lineHeight = multiplication(copyStyle.fontSize, 1.3);
    const styleObj = {
      top: y + 'px',
      left: x + 'px',
      lineHeight,
      fontSize: copyStyle.fontSize,
      color: copyStyle.color,
    };
    styleSet(this.cursor, styleObj);
  }
  focus() {
    this.cursor.focus();
  }
  followSysCret() {
    this.getMeta();
    const { x, y, container } = this.meta;
    this.setPosition(x, y, container);
  }
  setCret(relativeOffset) {
    const { selection, range, text, offset } = this.meta;
    range.setStart(text, offset + relativeOffset);
    range.setEnd(text, offset + relativeOffset);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  getMeta() {
    if (this.selection.selection.rangeCount === 0) {
      return this.meta;
    }
    const range = this.selection.getRange();
    const text = range.endContainer;
    if (text.nodeName !== '#text') {
      return this.meta;
    }
    // 相对于 focusTaget 的偏移量
    const offset = range.endOffset;
    this.meta.range = range;
    this.meta.text = text;
    this.meta.offset = offset;
    this.meta.selection = this.selection;
    this.meta.container = range.endContainer.parentNode;
    // 模拟光标 有个bug这里
    const virtualCursor = document.createElement('span');
    const endNode = text.splitText(offset);
    text.parentNode.insertBefore(endNode, text.nextSibling);
    text.parentNode.insertBefore(virtualCursor, endNode);
    const { offsetLeft: x, offsetTop: y } = virtualCursor;
    this.meta.x = x;
    this.meta.y = y;
    text.parentNode.removeChild(virtualCursor);
    // 修复行首选区丢失的bug
    offset && text.parentNode.normalize();
    return this.meta;
  }
}
