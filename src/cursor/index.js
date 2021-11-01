import { styleSet } from '../utils/styleOp';
import { multiplication } from '../utils/pixelsCalc';
import Selection from '../selection';
// import state from '../state/';
export default class Cursor {
  input = null; // 虚拟输入框
  caret = null; // 虚拟光标
  measure = null; // 输入预文本测量器
  selection = null;
  caretMarker = null; // 系统光标标记
  inputState = {
    value: '',
    isComposing: false,
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
    this.input = document.createElement('input');
    this.caret = document.createElement('span');
    this.measure = document.createElement('span');
    this.caretMarker = document.createElement('span');
    this.initEvent();
    this.input.id = 'custom-input';
    this.caret.id = 'custom-caret';
    this.measure.id = 'custom-measure';
    document.body.appendChild(this.input);
    document.body.appendChild(this.caret);
    document.body.appendChild(this.measure);
    this.selection = new Selection();
  }
  initEvent() {
    this.input.addEventListener('compositionstart', this.handleEvent.bind(this));
    this.input.addEventListener('compositionend', this.handleEvent.bind(this));
    this.input.addEventListener('input', this.handleEvent.bind(this));
    this.input.addEventListener('blur', this.handleEvent.bind(this));
  }
  handleEvent(event) {
    console.log(`--->${event.type}: ${event.data}--${event.isComposing}--${event.target.value}\n`); // &nbsp
    console.log([this.meta.text]);
    if (event.type === 'input') {
      if (!this.inputState.isComposing && event.data) {
        const inputData = event.data === ' ' ? '\u00A0' : event.data;
        this.meta.text.data = this.meta.text.data.slice(0, this.meta.offset) + inputData + this.meta.text.data.slice(this.meta.offset);
        console.log(event.data.length);
        this.setSysCaret(event.data.length);
        this.followSysCaret();
        this.focus();
      } else {
        const preValLen = this.inputState.value.length;
        this.inputState.value = event.data || '';
        this.measure.innerText = this.inputState.value;
        this.setCustomMeasureSty();
        this.setCaret(this.meta.x + this.measure.offsetWidth, this.meta.y, this.meta.container);
        this.meta.text.data =
          this.meta.text.data.slice(0, this.meta.offset) + this.inputState.value + this.meta.text.data.slice(this.meta.offset + preValLen);
      }
    } else if (event.type === 'compositionstart') {
      this.inputState.isComposing = true;
    } else if (event.type === 'compositionend') {
      this.inputState.isComposing = false;
      // 等待dom更新
      setTimeout(() => {
        this.setSysCaret(this.inputState.value.length);
        this.followSysCaret();
        this.focus();
        event.target.value = '';
        this.inputState.value = '';
      });
    }
  }

  /**
   * @param {*} meta
   * @memberof Cursor
   */
  setPosition(x, y, container) {
    const copyStyle = getComputedStyle(container);
    const lineHeight = multiplication(copyStyle.fontSize, 1.3);
    const inputStyle = {
      top: y + 'px',
      left: x + 'px',
      lineHeight,
      fontSize: copyStyle.fontSize,
    };
    const caretStyle = {
      top: y + 'px',
      left: x + 'px',
      height: lineHeight,
      fontSize: copyStyle.fontSize,
      background: copyStyle.color,
    };
    styleSet(this.input, inputStyle);
    styleSet(this.caret, caretStyle);
  }
  // 设置自定义光标位置
  setCaret(x, y, container) {
    const copyStyle = getComputedStyle(container);
    const lineHeight = multiplication(copyStyle.fontSize, 1.3);
    const caretStyle = {
      top: y + 'px',
      left: x + 'px',
      height: lineHeight,
      fontSize: copyStyle.fontSize,
      background: copyStyle.color,
    };
    styleSet(this.caret, caretStyle);
  }
  //测量中文输入
  setCustomMeasureSty() {
    const { container } = this.meta;
    const copyStyle = getComputedStyle(container);
    const lineHeight = multiplication(copyStyle.fontSize, 1.3);
    const styleObj = {
      height: lineHeight,
      fontSize: copyStyle.fontSize,
    };
    styleSet(this.measure, styleObj);
  }
  // 聚焦到模拟输入
  focus() {
    this.input.focus();
  }
  // 自定义光标跟随系统光标
  followSysCaret() {
    this.getMeta();
    const { x, y, container } = this.meta;
    this.setPosition(x, y, container);
  }
  // 设置系统光标，设置系统光标位置会使模拟输入框失焦
  setSysCaret(relativeOffset) {
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

    const offset = range.endOffset;
    this.meta.range = range;
    this.meta.text = text;
    this.meta.offset = offset;
    this.meta.selection = this.selection;
    this.meta.container = range.endContainer.parentNode;
    // 测量光标绝对坐标
    const endNode = text.splitText(offset);
    text.parentNode.insertBefore(endNode, text.nextSibling);
    text.parentNode.insertBefore(this.caretMarker, endNode);
    const { offsetLeft: x, offsetTop: y } = this.caretMarker;
    this.meta.x = x;
    this.meta.y = y;
    text.parentNode.removeChild(this.caretMarker);
    // 修复行首选区丢失的bug
    offset && text.parentNode.normalize();
    return this.meta;
  }
}
