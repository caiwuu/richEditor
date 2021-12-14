import Caret from '../caret'
export default class Range {
  constructor(nativeRange,vm) {
    nativeRange.vm = vm
    this.factory.call(nativeRange)
    return nativeRange
  }
  factory(){
    this.caret = new Caret()
    this.updateCaret = ()=>{
      this.caret.update(this)
    }
  }
}
