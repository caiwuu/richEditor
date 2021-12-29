export default class Command {
  constructor(vm) {
    this.vm = vm
  }
  delete(pos) {
    if (pos) {
    } else {
      this.vm.selection.ranges.forEach((range) => range.del())
    }
  }
}
