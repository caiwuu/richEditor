export default class Command {
  customCommand = {
    test: () => {
      console.log('this is customCommand:test')
    },
  }
  constructor(editor) {
    this.editor = editor
  }
  _delete(pos) {
    // 外部驱动
    if (pos) {
    } else {
      // 内部驱动
      this.editor.selection.ranges.forEach((range) => {
        range.del()
        range.updateCaret()
      })
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
      range.updateCaret()
    })
  }
  _enter() {
    this.editor.selection.ranges.forEach((range) => {
      range.enter()
      range.updateCaret()
    })
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
