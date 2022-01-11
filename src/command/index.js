export default class Command {
  constructor(vm) {
    this.vm = vm
  }
  delete(pos) {
    if (pos) {
    } else {
      this.vm.selection.ranges.forEach((range) => {
        range.del()
        range.updateCaret()
      })
    }
  }
  input(event) {
    this.vm.selection.ranges.forEach((range) => {
      range.input(event)
      range.updateCaret()
    })
  }
  enter() {
    this.vm.selection.ranges.forEach((range) => {
      range.enter()
      range.updateCaret()
    })
  }
}
