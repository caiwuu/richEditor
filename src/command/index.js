export default class Command {
  customCommand = {
    test: () => {
      console.log('this is customCommand:test')
    },
  }
  constructor(vm) {
    this.vm = vm
  }
  _updateCaret_() {
    this.vm.selection.ranges.forEach((range) => {
      range.updateCaret()
    })
  }
  _delete(pos) {
    // 外部驱动
    if (pos) {
    } else {
      // 内部驱动
      this.vm.selection.ranges.forEach((range) => {
        range.del()
      })
      this._updateCaret_()
    }
  }
  _input(data, event) {
    this.vm.selection.ranges.forEach((range) => {
      // 外部驱动
      if (data) {
        range.input({
          type: 'input',
          data,
        })
      } else {
        // 内部驱动
        range.input(event)
      }
    })
    this._updateCaret_()
  }
  _enter() {
    this.vm.selection.ranges.forEach((range) => {
      range.enter()
    })
    // this.vm.selection.move('right')
    this._updateCaret_()
  }
  _bold(pos) {
    if (pos) {
    } else {
      this.vm.selection.ranges.forEach((range) => {
        range.bold()
      })
    }
  }
  _defineCommand_(name, fn) {
    if (this.customCommand[name]) {
      console.warn(`The command '${name}'  already exists,it will rewrite it`)
      this.customCommand[name] = fn
    } else if (name.startsWith('_')) {
      throw `commandName is not allowed to start with '_'`
    }
  }

  _exexCommand_(name, ...args) {
    const command = this['_' + name] || this.customCommand[name]
    command && command.call(this, ...args)
  }
}
