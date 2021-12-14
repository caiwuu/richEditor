import setStyle from '../../utils'
const defaultStyle = {
  top: '-100px',
  left: 0,
  position: 'absolute',
  width: '2px',
  background: 'transparent',
  border: 'none',
  padding: 0,
}
export default class Caret {
  dom = null
  constructor() {
    this.dom = document.createElement('span')
    this.setStyle(this.dom)
  }
  setStyle(style = {}) {
    const mergeStyle = Object.assign({}, defaultStyle, style)
    setStyle(this.dom, mergeStyle)
  }
}
