export default class Selection {
  selection = null;
  constructor() {
    this.selection = document.getSelection();
  }
  getRange() {
    return this.selection.getRangeAt(0);
  }
}
