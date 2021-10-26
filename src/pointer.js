export default class Pointer {
  pointer = null
  constructor() {
    const pointer = document.createElement('input')
    pointer.id = 'pointer'
    // TODO 设计一个公共方法来设置css
    pointer.style.top = '-100px'
    pointer.style.left = 0
    pointer.style.position = 'absolute'
    pointer.style.width = '0.5px'
    // pointer.style.height = '16px'
    pointer.style.background = 'transparent'
    // pointer.style.background = 'red';
    pointer.style.border = 'none'
    pointer.style.padding = 0
    document.body.appendChild(pointer)
    this.pointer = pointer
  }
  setPosition(x, y, h, fs, fc) {
    console.log(fc)
    this.pointer.style.top = y + 'px'
    this.pointer.style.left = x + 'px'
    this.pointer.style.lineHeight = h + 'px'
    this.pointer.style.fontSize = fs
    this.pointer.style.color = fc
  }
  focus() {
    this.pointer.focus()
  }
  // TODO
  //   toTop() {}
  //   toDown() {}
  //   toLeft() {}
  //   toRight() {}
}
