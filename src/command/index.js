export default class Command {
  customCommand = {
    test: () => {
      console.log('this is customCommand:test')
    },
  }
  constructor(editor) {
    this.editor = editor
  }
  _updateCaret_() {
    this.editor.selection.ranges.forEach((range) => {
      range.updateCaret()
    })
  }
  _delete(pos) {
    // 外部驱动
    if (pos) {
    } else {
      // 内部驱动
      this.editor.selection.ranges.forEach((range) => {
        range.del()
      })
      this._updateCaret_()
    }
  }
  _input(data, event) {
    this.editor.selection.ranges.forEach((range) => {
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
    this.editor.selection.ranges.forEach((range) => {
      range.enter()
    })
    // this.editor.selection.move('right')
    this._updateCaret_()
  }
  _bold(pos) {
    if (pos) {
    } else {
      this.editor.selection.ranges.forEach((range) => {
        if (!range.collapsed) {
          this.editor.dispatch('bold')
        }
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
